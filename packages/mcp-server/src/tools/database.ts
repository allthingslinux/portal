import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import postgres from 'postgres';
import { z } from 'zod';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

const sql = postgres(DATABASE_URL, {
  prepare: false,
});

interface DatabaseFunction {
  name: string;
  parameters: Array<{
    name: string;
    type: string;
    defaultValue?: string;
  }>;
  returnType: string;
  description: string;
  purpose: string;
  securityLevel: 'definer' | 'invoker';
  schema: string;
  sourceFile: string;
}

interface SchemaFile {
  name: string;
  path: string;
  description: string;
  section: string;
  lastModified: Date;
  tables: string[];
  functions: string[];
  dependencies: string[];
  topic: string;
}

interface ProjectTable {
  name: string;
  schema: string;
  sourceFile: string;
  topic: string;
}

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencedTable?: string;
  referencedColumn?: string;
}

interface TableIndex {
  name: string;
  columns: string[];
  unique: boolean;
  type: string;
  definition: string;
}

interface TableForeignKey {
  name: string;
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
  onDelete?: string;
  onUpdate?: string;
}

interface TableInfo {
  name: string;
  schema: string;
  sourceFile: string;
  topic: string;
  columns: TableColumn[];
  foreignKeys: TableForeignKey[];
  indexes: TableIndex[];
  createStatement?: string;
}

interface EnumInfo {
  name: string;
  values: string[];
  sourceFile: string;
}

export class DatabaseTool {
  private static _ROOT_PATH = process.cwd();

  static get ROOT_PATH(): string {
    return this._ROOT_PATH;
  }

  static set ROOT_PATH(path: string) {
    this._ROOT_PATH = path;
  }

  static async getSchemaFiles(): Promise<SchemaFile[]> {
    const schemasPath = join(
      DatabaseTool.ROOT_PATH,
      'apps',
      'web',
      'supabase',
      'schemas',
    );

    const files = await readdir(schemasPath);

    const schemaFiles: SchemaFile[] = [];

    for (const file of files.filter((f) => f.endsWith('.sql'))) {
      const filePath = join(schemasPath, file);
      const content = await readFile(filePath, 'utf8');
      const stats = await stat(filePath);

      // Extract section and description from the file header
      const sectionMatch = content.match(/\* Section: ([^\n*]+)/);
      const descriptionMatch = content.match(/\* ([^*\n]+)\n \* We create/);

      // Extract tables and functions from content using simple regex (for schema file metadata only)
      const tables = this.extractTablesRegex(content);
      const functions = this.extractFunctionNamesRegex(content);
      const dependencies = this.extractDependenciesRegex(content);
      const topic = this.determineTopic(file, content);

      schemaFiles.push({
        name: file,
        path: filePath,
        section: sectionMatch?.[1]?.trim() || 'Unknown',
        description:
          descriptionMatch?.[1]?.trim() || 'No description available',
        lastModified: stats.mtime,
        tables,
        functions,
        dependencies,
        topic,
      });
    }

    return schemaFiles.sort((a, b) => a.name.localeCompare(b.name));
  }

  static async getFunctions(): Promise<DatabaseFunction[]> {
    try {
      // Query the database directly for function information
      const functions = await sql`
        SELECT
          p.proname as function_name,
          n.nspname as schema_name,
          pg_get_function_result(p.oid) as return_type,
          pg_get_function_arguments(p.oid) as parameters,
          CASE p.prosecdef WHEN true THEN 'definer' ELSE 'invoker' END as security_level,
          l.lanname as language,
          obj_description(p.oid, 'pg_proc') as description
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        LEFT JOIN pg_language l ON p.prolang = l.oid
        WHERE n.nspname IN ('public', 'kit')
        AND p.prokind = 'f'  -- Only functions, not procedures
        ORDER BY n.nspname, p.proname
      `;

      // Get schema files to map functions to source files
      const schemaFiles = await this.getSchemaFiles();
      const fileMapping = this.createFunctionFileMapping(schemaFiles);

      return functions.map((func) => ({
        name: func.function_name,
        schema: func.schema_name,
        returnType: func.return_type || 'unknown',
        parameters: this.parsePostgresParameters(func.parameters || ''),
        securityLevel: func.security_level as 'definer' | 'invoker',
        description: func.description || 'No description available',
        purpose: this.extractPurpose(
          func.description || '',
          func.function_name,
        ),
        sourceFile:
          fileMapping[`${func.schema_name}.${func.function_name}`] || 'unknown',
      }));
    } catch (error) {
      console.error(
        'Error querying database functions, falling back to file parsing:',
        error.message,
      );
      // Fallback to file-based extraction if database query fails
      return this.getFunctionsFromFiles();
    }
  }

  private static async getFunctionsFromFiles(): Promise<DatabaseFunction[]> {
    const schemaFiles = await this.getSchemaFiles();
    const functions: DatabaseFunction[] = [];

    for (const schemaFile of schemaFiles) {
      const content = await readFile(schemaFile.path, 'utf8');
      const fileFunctions = this.extractFunctionsFromContent(
        content,
        schemaFile.name,
      );
      functions.push(...fileFunctions);
    }

    return functions.sort((a, b) => a.name.localeCompare(b.name));
  }

  private static createFunctionFileMapping(
    schemaFiles: SchemaFile[],
  ): Record<string, string> {
    const mapping: Record<string, string> = {};

    for (const file of schemaFiles) {
      for (const functionName of file.functions) {
        // Map both public.functionName and functionName to the file
        mapping[`public.${functionName}`] = file.name;
        mapping[`kit.${functionName}`] = file.name;
        mapping[functionName] = file.name;
      }
    }

    return mapping;
  }

  private static parsePostgresParameters(paramString: string): Array<{
    name: string;
    type: string;
    defaultValue?: string;
  }> {
    if (!paramString.trim()) return [];

    const parameters: Array<{
      name: string;
      type: string;
      defaultValue?: string;
    }> = [];

    // PostgreSQL function arguments format: "name type, name type DEFAULT value"
    const params = paramString
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p);

    for (const param of params) {
      // Match pattern: "name type" or "name type DEFAULT value"
      const match = param.match(
        /^(?:(?:IN|OUT|INOUT)\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s+([^=\s]+)(?:\s+DEFAULT\s+(.+))?$/i,
      );

      if (match) {
        const [, name, type, defaultValue] = match;
        parameters.push({
          name: name.trim(),
          type: type.trim(),
          defaultValue: defaultValue?.trim(),
        });
      } else if (param.includes(' ')) {
        // Fallback for unnamed parameters
        const parts = param.split(' ');
        if (parts.length >= 2) {
          parameters.push({
            name: parts[0] || 'unnamed',
            type: parts.slice(1).join(' ').trim(),
          });
        }
      }
    }

    return parameters;
  }

  static async getFunctionDetails(
    functionName: string,
  ): Promise<DatabaseFunction> {
    const functions = await this.getFunctions();

    // Extract just the function name if schema prefix is provided (e.g., "public.has_permission" -> "has_permission")
    const nameParts = functionName.split('.');
    const cleanFunctionName = nameParts[nameParts.length - 1];
    const providedSchema = nameParts.length > 1 ? nameParts[0] : 'public';

    // Try to find by exact name first, then by cleaned name and schema
    let func = functions.find((f) => f.name === functionName);

    if (!func) {
      // Match by function name and schema (defaulting to public if no schema provided)
      func = functions.find(
        (f) => f.name === cleanFunctionName && f.schema === providedSchema,
      );
    }

    if (!func) {
      throw new Error(`Function "${functionName}" not found`);
    }

    return func;
  }

  static async searchFunctions(query: string): Promise<DatabaseFunction[]> {
    const allFunctions = await this.getFunctions();
    const searchTerm = query.toLowerCase();

    // Extract schema and function name from search query if provided
    const nameParts = query.split('.');
    const cleanSearchTerm = nameParts[nameParts.length - 1].toLowerCase();

    const searchSchema =
      nameParts.length > 1 ? nameParts[0].toLowerCase() : null;

    return allFunctions.filter((func) => {
      const matchesName = func.name.toLowerCase().includes(cleanSearchTerm);
      const matchesFullName = func.name.toLowerCase().includes(searchTerm);

      const matchesSchema = searchSchema
        ? func.schema.toLowerCase() === searchSchema
        : true;

      const matchesDescription = func.description
        .toLowerCase()
        .includes(searchTerm);

      const matchesPurpose = func.purpose.toLowerCase().includes(searchTerm);

      const matchesReturnType = func.returnType
        .toLowerCase()
        .includes(searchTerm);

      // If schema is specified in query, must match both name and schema
      if (searchSchema) {
        return (matchesName || matchesFullName) && matchesSchema;
      }

      // Otherwise, match on any field
      return (
        matchesName ||
        matchesFullName ||
        matchesDescription ||
        matchesPurpose ||
        matchesReturnType
      );
    });
  }

  static async getSchemaContent(fileName: string): Promise<string> {
    const schemasPath = join(
      DatabaseTool.ROOT_PATH,
      'apps',
      'web',
      'supabase',
      'schemas',
    );

    const filePath = join(schemasPath, fileName);

    try {
      return await readFile(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Schema file "${fileName}" not found`);
    }
  }

  static async getSchemasByTopic(topic: string): Promise<SchemaFile[]> {
    const allSchemas = await this.getSchemaFiles();
    const searchTerm = topic.toLowerCase();

    return allSchemas.filter((schema) => {
      return (
        schema.topic.toLowerCase().includes(searchTerm) ||
        schema.section.toLowerCase().includes(searchTerm) ||
        schema.description.toLowerCase().includes(searchTerm) ||
        schema.name.toLowerCase().includes(searchTerm)
      );
    });
  }

  static async getSchemaBySection(section: string): Promise<SchemaFile | null> {
    const allSchemas = await this.getSchemaFiles();
    return (
      allSchemas.find(
        (schema) => schema.section.toLowerCase() === section.toLowerCase(),
      ) || null
    );
  }

  static async getAllProjectTables(): Promise<ProjectTable[]> {
    // Query database directly for table information
    const tables = await sql`
      SELECT
        t.table_name,
        t.table_schema,
        obj_description(c.oid, 'pg_class') as description
      FROM information_schema.tables t
      LEFT JOIN pg_class c ON c.relname = t.table_name
      LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
      WHERE t.table_schema IN ('public', 'kit')
      AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_schema, t.table_name
    `;

    // Get schema files to map tables to source files
    const schemaFiles = await this.getSchemaFiles();
    const fileMapping = this.createTableFileMapping(schemaFiles);

    return tables.map((table: any) => ({
      name: table.table_name,
      schema: table.table_schema,
      sourceFile:
        fileMapping[`${table.table_schema}.${table.table_name}`] ||
        fileMapping[table.table_name] ||
        'database',
      topic: this.getTableTopic(table.table_name, schemaFiles),
    }));
  }

  private static createTableFileMapping(
    schemaFiles: SchemaFile[],
  ): Record<string, string> {
    const mapping: Record<string, string> = {};

    for (const file of schemaFiles) {
      for (const tableName of file.tables) {
        mapping[`public.${tableName}`] = file.name;
        mapping[`kit.${tableName}`] = file.name;
        mapping[tableName] = file.name;
      }
    }

    return mapping;
  }

  private static getTableTopic(
    tableName: string,
    schemaFiles: SchemaFile[],
  ): string {
    for (const file of schemaFiles) {
      if (file.tables.includes(tableName)) {
        return file.topic;
      }
    }
    return 'general';
  }

  static async getAllEnums(): Promise<Record<string, EnumInfo>> {
    try {
      // Try to get live enums from database first
      const liveEnums = await this.getEnumsFromDB();
      if (Object.keys(liveEnums).length > 0) {
        return liveEnums;
      }

      // Fallback to schema files
      const enumContent = await this.getSchemaContent('01-enums.sql');
      return this.parseEnums(enumContent);
    } catch (error) {
      return {};
    }
  }

  static async getTableInfo(
    schema: string,
    tableName: string,
  ): Promise<TableInfo> {
    const schemaFiles = await this.getSchemaFiles();

    for (const file of schemaFiles) {
      const content = await readFile(file.path, 'utf8');
      const tableDefinition = this.extractTableDefinition(
        content,
        schema,
        tableName,
      );

      if (tableDefinition) {
        // Enhance with live database info
        const liveColumns = await this.getTableColumnsFromDB(schema, tableName);
        const liveForeignKeys = await this.getTableForeignKeysFromDB(
          schema,
          tableName,
        );
        const liveIndexes = await this.getTableIndexesFromDB(schema, tableName);

        return {
          name: tableName,
          schema: schema,
          sourceFile: file.name,
          topic: file.topic,
          columns:
            liveColumns.length > 0
              ? liveColumns
              : this.parseColumns(tableDefinition),
          foreignKeys:
            liveForeignKeys.length > 0
              ? liveForeignKeys
              : this.parseForeignKeys(tableDefinition),
          indexes:
            liveIndexes.length > 0
              ? liveIndexes
              : this.parseIndexes(content, tableName),
          createStatement: tableDefinition,
        };
      }
    }

    throw new Error(`Table ${schema}.${tableName} not found in schema files`);
  }

  static async getTableColumnsFromDB(
    schema: string,
    tableName: string,
  ): Promise<TableColumn[]> {
    try {
      const columns = await sql`
        SELECT
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
          CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
          fk.foreign_table_name as referenced_table,
          fk.foreign_column_name as referenced_column
        FROM information_schema.columns c
        LEFT JOIN (
          SELECT ku.table_name, ku.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku
            ON tc.constraint_name = ku.constraint_name
            AND tc.table_schema = ku.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = ${schema}
        ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
        LEFT JOIN (
          SELECT
            ku.table_name,
            ku.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku
            ON tc.constraint_name = ku.constraint_name
            AND tc.table_schema = ku.table_schema
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = ${schema}
        ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
        WHERE c.table_schema = ${schema}
          AND c.table_name = ${tableName}
        ORDER BY c.ordinal_position
      `;

      return columns.map((col) => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        defaultValue: col.column_default,
        isPrimaryKey: col.is_primary_key,
        isForeignKey: col.is_foreign_key,
        referencedTable: col.referenced_table,
        referencedColumn: col.referenced_column,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  static async getTableForeignKeysFromDB(
    schema: string,
    tableName: string,
  ): Promise<TableForeignKey[]> {
    try {
      const foreignKeys = await sql`
        SELECT
          tc.constraint_name,
          string_agg(kcu.column_name, ',' ORDER BY kcu.ordinal_position) as columns,
          ccu.table_name AS foreign_table_name,
          string_agg(ccu.column_name, ',' ORDER BY kcu.ordinal_position) as foreign_columns,
          rc.delete_rule,
          rc.update_rule
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints rc
          ON tc.constraint_name = rc.constraint_name
          AND tc.table_schema = rc.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = ${schema}
          AND tc.table_name = ${tableName}
        GROUP BY tc.constraint_name, ccu.table_name, rc.delete_rule, rc.update_rule
      `;

      return foreignKeys.map((fk: any) => ({
        name: fk.constraint_name,
        columns: fk.columns.split(','),
        referencedTable: fk.foreign_table_name,
        referencedColumns: fk.foreign_columns.split(','),
        onDelete: fk.delete_rule,
        onUpdate: fk.update_rule,
      }));
    } catch (error) {
      return [];
    }
  }

  static async getTableIndexesFromDB(
    schema: string,
    tableName: string,
  ): Promise<TableIndex[]> {
    try {
      const indexes = await sql`
        SELECT
          i.indexname,
          i.indexdef,
          ix.indisunique as is_unique,
          string_agg(a.attname, ',' ORDER BY a.attnum) as columns
        FROM pg_indexes i
        JOIN pg_class c ON c.relname = i.tablename
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_index ix ON ix.indexrelid = (
          SELECT oid FROM pg_class WHERE relname = i.indexname
        )
        JOIN pg_attribute a ON a.attrelid = c.oid
          AND a.attnum = ANY(ix.indkey)
        WHERE n.nspname = ${schema}
          AND i.tablename = ${tableName}
          AND i.indexname NOT LIKE '%_pkey'
        GROUP BY i.indexname, i.indexdef, ix.indisunique
        ORDER BY i.indexname
      `;

      return indexes.map((idx) => ({
        name: idx.indexname,
        columns: idx.columns.split(','),
        unique: idx.is_unique,
        type: 'btree', // Default, could be enhanced
        definition: idx.indexdef,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  static async getEnumsFromDB(): Promise<Record<string, EnumInfo>> {
    try {
      const enums = await sql`
        SELECT
          t.typname as enum_name,
          array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        GROUP BY t.typname
        ORDER BY t.typname
      `;

      const result: Record<string, EnumInfo> = {};
      for (const enumData of enums) {
        result[enumData.enum_name] = {
          name: enumData.enum_name,
          values: enumData.enum_values,
          sourceFile: 'database', // Live from DB
        };
      }
      return result;
    } catch (error) {
      return {};
    }
  }

  private static extractFunctionsFromContent(
    content: string,
    sourceFile: string,
  ): DatabaseFunction[] {
    const functions: DatabaseFunction[] = [];

    // Updated regex to capture function definitions with optional "or replace"
    const functionRegex =
      /create\s+(?:or\s+replace\s+)?function\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s*\(([^)]*)\)\s*returns?\s+([^;\n]+)(?:\s+language\s+\w+)?(?:\s+security\s+(definer|invoker))?[^$]*?\$\$([^$]*)\$\$/gi;

    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const [, fullName, params, returnType, securityLevel, body] = match;

      if (!fullName || !returnType) continue;

      // Extract schema and function name
      const nameParts = fullName.split('.');
      const functionName = nameParts[nameParts.length - 1];
      const schema = nameParts.length > 1 ? nameParts[0] : 'public';

      // Parse parameters
      const parameters = this.parseParameters(params || '');

      // Extract description and purpose from comments before function
      const functionIndex = match.index || 0;
      const beforeFunction = content.substring(
        Math.max(0, functionIndex - 500),
        functionIndex,
      );
      const description = this.extractDescription(beforeFunction, body || '');
      const purpose = this.extractPurpose(description, functionName);

      functions.push({
        name: functionName,
        parameters,
        returnType: returnType.trim(),
        description,
        purpose,
        securityLevel: (securityLevel as 'definer' | 'invoker') || 'invoker',
        schema,
        sourceFile,
      });
    }

    return functions;
  }

  private static parseParameters(paramString: string): Array<{
    name: string;
    type: string;
    defaultValue?: string;
  }> {
    if (!paramString.trim()) return [];

    const parameters: Array<{
      name: string;
      type: string;
      defaultValue?: string;
    }> = [];

    // Split by comma, but be careful of nested types
    const params = paramString.split(',');

    for (const param of params) {
      const cleaned = param.trim();
      if (!cleaned) continue;

      // Match parameter pattern: name type [default value]
      const paramMatch = cleaned.match(
        /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+([^=\s]+)(?:\s+default\s+(.+))?\s*$/i,
      );

      if (paramMatch) {
        const [, name, type, defaultValue] = paramMatch;
        if (name && type) {
          parameters.push({
            name: name.trim(),
            type: type.trim(),
            defaultValue: defaultValue?.trim(),
          });
        }
      }
    }

    return parameters;
  }

  private static extractDescription(
    beforeFunction: string,
    body: string,
  ): string {
    // Look for comments before the function
    const commentMatch = beforeFunction.match(/--\s*(.+?)(?:\n|$)/);
    if (commentMatch?.[1]) {
      return commentMatch[1].trim();
    }

    // Look for comments inside the function body
    const bodyCommentMatch = body.match(/--\s*(.+?)(?:\n|$)/);
    if (bodyCommentMatch?.[1]) {
      return bodyCommentMatch[1].trim();
    }

    return 'No description available';
  }

  private static extractPurpose(
    description: string,
    functionName: string,
  ): string {
    // Map function names to purposes
    const purposeMap: Record<string, string> = {
      create_nonce:
        'Create one-time authentication tokens for secure operations',
      verify_nonce: 'Verify and consume one-time tokens for authentication',
      is_mfa_compliant:
        'Check if user has completed multi-factor authentication',
      team_account_workspace:
        'Load comprehensive team account data with permissions',
      has_role_on_account: 'Check if user has access to a specific account',
      has_permission: 'Verify user permissions for specific account operations',
      create_team_account: 'Create new team account with proper permissions',
      invite_user_to_account: 'Send invitation to join team account',
      accept_invitation: 'Process and accept team invitation',
      transfer_account_ownership: 'Transfer account ownership between users',
      delete_account: 'Safely delete account and associated data',
    };

    if (purposeMap[functionName]) {
      return purposeMap[functionName];
    }

    // Analyze function name for purpose hints
    if (functionName.includes('create'))
      return 'Create database records with validation';
    if (functionName.includes('delete') || functionName.includes('remove'))
      return 'Delete records with proper authorization';
    if (functionName.includes('update') || functionName.includes('modify'))
      return 'Update existing records with validation';
    if (functionName.includes('get') || functionName.includes('fetch'))
      return 'Retrieve data with access control';
    if (functionName.includes('verify') || functionName.includes('validate'))
      return 'Validate data or permissions';
    if (functionName.includes('check') || functionName.includes('is_'))
      return 'Check conditions or permissions';
    if (functionName.includes('invite'))
      return 'Handle user invitations and access';
    if (functionName.includes('transfer'))
      return 'Transfer ownership or data between entities';

    return `Custom database function: ${description}`;
  }

  // Fallback regex methods (simplified and more reliable)
  private static extractTablesRegex(content: string): string[] {
    const tableMatches = content.match(
      /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z_][a-zA-Z0-9_]*)/gi,
    );
    if (!tableMatches) return [];

    return [
      ...new Set(
        tableMatches
          .map((match) => {
            const nameMatch = match.match(/([a-zA-Z_][a-zA-Z0-9_]*)$/i);
            return nameMatch ? nameMatch[1] : '';
          })
          .filter(Boolean),
      ),
    ];
  }

  private static extractFunctionNamesRegex(content: string): string[] {
    const functionMatches = content.match(
      /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-zA-Z_][a-zA-Z0-9_]*)/gi,
    );
    if (!functionMatches) return [];

    return [
      ...new Set(
        functionMatches
          .map((match) => {
            const nameMatch = match.match(/([a-zA-Z_][a-zA-Z0-9_]*)$/i);
            return nameMatch ? nameMatch[1] : '';
          })
          .filter(Boolean),
      ),
    ];
  }

  private static extractDependenciesRegex(content: string): string[] {
    const refMatches = content.match(
      /references\s+(?:public\.)?([a-zA-Z_][a-zA-Z0-9_]*)/gi,
    );
    if (!refMatches) return [];

    return [
      ...new Set(
        refMatches
          .map((match) => {
            const nameMatch = match.match(/([a-zA-Z_][a-zA-Z0-9_]*)$/i);
            return nameMatch && nameMatch[1] !== 'users' ? nameMatch[1] : '';
          })
          .filter(Boolean),
      ),
    ];
  }

  private static extractTableDefinition(
    content: string,
    schema: string,
    tableName: string,
  ): string | null {
    const tableRegex = new RegExp(
      `create\\s+table\\s+(?:if\\s+not\\s+exists\\s+)?(?:${schema}\\.)?${tableName}\\s*\\([^;]*?\\);`,
      'gis',
    );
    const match = content.match(tableRegex);
    return match ? match[0] : null;
  }

  private static parseColumns(tableDefinition: string): TableColumn[] {
    const columns: TableColumn[] = [];

    // Extract the content between parentheses
    const contentMatch = tableDefinition.match(/\(([\s\S]*)\)/);
    if (!contentMatch) return columns;

    const content = contentMatch[1];

    // Split by commas, but be careful of nested structures
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);

    for (const line of lines) {
      if (
        line.startsWith('constraint') ||
        line.startsWith('primary key') ||
        line.startsWith('foreign key')
      ) {
        continue; // Skip constraint definitions
      }

      // Parse column definition: name type [constraints]
      const columnMatch = line.match(
        /^([a-zA-Z_][a-zA-Z0-9_]*)\s+([^,\s]+)(?:\s+(.*))?/,
      );
      if (columnMatch) {
        const [, name, type, constraints = ''] = columnMatch;

        columns.push({
          name,
          type: type.replace(/,$/, ''), // Remove trailing comma
          nullable: !constraints.includes('not null'),
          defaultValue: this.extractDefault(constraints),
          isPrimaryKey: constraints.includes('primary key'),
          isForeignKey: constraints.includes('references'),
          referencedTable: this.extractReferencedTable(constraints),
          referencedColumn: this.extractReferencedColumn(constraints),
        });
      }
    }

    return columns;
  }

  private static extractDefault(constraints: string): string | undefined {
    const defaultMatch = constraints.match(/default\s+([^,\s]+)/i);
    return defaultMatch ? defaultMatch[1] : undefined;
  }

  private static extractReferencedTable(
    constraints: string,
  ): string | undefined {
    const refMatch = constraints.match(
      /references\s+([a-zA-Z_][a-zA-Z0-9_]*)/i,
    );
    return refMatch ? refMatch[1] : undefined;
  }

  private static extractReferencedColumn(
    constraints: string,
  ): string | undefined {
    const refMatch = constraints.match(
      /references\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(([^)]+)\)/i,
    );
    return refMatch ? refMatch[1].trim() : undefined;
  }

  private static parseForeignKeys(tableDefinition: string): TableForeignKey[] {
    const foreignKeys: TableForeignKey[] = [];

    // Match foreign key constraints
    const fkRegex =
      /foreign\s+key\s*\(([^)]+)\)\s*references\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]+)\)(?:\s+on\s+delete\s+([a-z\s]+))?(?:\s+on\s+update\s+([a-z\s]+))?/gi;

    let match;
    while ((match = fkRegex.exec(tableDefinition)) !== null) {
      const [
        ,
        columns,
        referencedTable,
        referencedColumns,
        onDelete,
        onUpdate,
      ] = match;

      foreignKeys.push({
        name: `fk_${referencedTable}_${columns.replace(/\s/g, '')}`,
        columns: columns.split(',').map((col) => col.trim()),
        referencedTable,
        referencedColumns: referencedColumns
          .split(',')
          .map((col) => col.trim()),
        onDelete: onDelete?.trim(),
        onUpdate: onUpdate?.trim(),
      });
    }

    return foreignKeys;
  }

  private static parseIndexes(
    content: string,
    tableName: string,
  ): TableIndex[] {
    const indexes: TableIndex[] = [];

    // Match CREATE INDEX statements
    const indexRegex = new RegExp(
      `create\\s+(?:unique\\s+)?index\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s+on\\s+(?:public\\.)?${tableName}\\s*\\(([^)]+)\\)`,
      'gi',
    );

    let match;
    while ((match = indexRegex.exec(content)) !== null) {
      const [fullMatch, indexName, columns] = match;

      indexes.push({
        name: indexName,
        columns: columns.split(',').map((col) => col.trim()),
        unique: fullMatch.toLowerCase().includes('unique'),
        type: 'btree', // Default type
        definition: fullMatch,
      });
    }

    return indexes;
  }

  private static parseEnums(content: string): Record<string, EnumInfo> {
    const enums: Record<string, EnumInfo> = {};

    // Match CREATE TYPE ... AS ENUM
    const enumRegex =
      /create\s+type\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+as\s+enum\s*\(([^)]+)\)/gi;

    let match;
    while ((match = enumRegex.exec(content)) !== null) {
      const [, enumName, values] = match;

      const enumValues = values
        .split(',')
        .map((value) => value.trim().replace(/['"]/g, ''))
        .filter((value) => value);

      enums[enumName] = {
        name: enumName,
        values: enumValues,
        sourceFile: '01-enums.sql',
      };
    }

    return enums;
  }

  private static determineTopic(fileName: string, content: string): string {
    // Map file names to topics
    const fileTopicMap: Record<string, string> = {
      '00-privileges.sql': 'security',
      '01-enums.sql': 'types',
      '02-config.sql': 'configuration',
      '03-accounts.sql': 'accounts',
      '04-roles.sql': 'permissions',
      '05-memberships.sql': 'teams',
      '06-roles-permissions.sql': 'permissions',
      '07-invitations.sql': 'teams',
      '11-notifications.sql': 'notifications',
      '12-one-time-tokens.sql': 'auth',
      '13-mfa.sql': 'auth',
      '14-super-admin.sql': 'admin',
      '15-account-views.sql': 'accounts',
      '16-storage.sql': 'storage',
      '17-roles-seed.sql': 'permissions',
    };

    if (fileTopicMap[fileName]) {
      return fileTopicMap[fileName];
    }

    // Analyze content for topic hints
    const contentLower = content.toLowerCase();
    if (contentLower.includes('account') && contentLower.includes('team'))
      return 'accounts';
    if (
      contentLower.includes('auth') ||
      contentLower.includes('mfa') ||
      contentLower.includes('token')
    )
      return 'auth';
    if (contentLower.includes('permission') || contentLower.includes('role'))
      return 'permissions';
    if (contentLower.includes('notification') || contentLower.includes('email'))
      return 'notifications';
    if (contentLower.includes('storage') || contentLower.includes('bucket'))
      return 'storage';
    if (contentLower.includes('admin') || contentLower.includes('super'))
      return 'admin';

    return 'general';
  }
}

export function registerDatabaseTools(server: McpServer) {
  createGetSchemaFilesTool(server);
  createGetSchemaContentTool(server);
  createGetSchemasByTopicTool(server);
  createGetSchemaBySectionTool(server);
  createGetFunctionsTool(server);
  createGetFunctionDetailsTool(server);
  createSearchFunctionsTool(server);
}

export function registerDatabaseResources(server: McpServer) {
  createDatabaseSummaryTool(server);
  createDatabaseTablesListTool(server);
  createGetTableInfoTool(server);
  createGetEnumInfoTool(server);
  createGetAllEnumsTool(server);
}

function createGetSchemaFilesTool(server: McpServer) {
  return server.tool(
    'get_schema_files',
    '🔥 DATABASE SCHEMA FILES (SOURCE OF TRUTH - ALWAYS CURRENT) - Use these over migrations!',
    async () => {
      const schemaFiles = await DatabaseTool.getSchemaFiles();

      const filesList = schemaFiles
        .map((file) => {
          const tablesInfo =
            file.tables.length > 0
              ? ` | Tables: ${file.tables.join(', ')}`
              : '';
          const functionsInfo =
            file.functions.length > 0
              ? ` | Functions: ${file.functions.join(', ')}`
              : '';
          return `${file.name} (${file.topic}): ${file.section} - ${file.description}${tablesInfo}${functionsInfo}`;
        })
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `🔥 DATABASE SCHEMA FILES (ALWAYS UP TO DATE)\n\nThese files represent the current database state. Use these instead of migrations for current schema understanding.\n\n${filesList}`,
          },
        ],
      };
    },
  );
}

function createGetFunctionsTool(server: McpServer) {
  return server.tool(
    'get_database_functions',
    'Get all database functions with descriptions and usage guidance',
    async () => {
      const functions = await DatabaseTool.getFunctions();

      const functionsList = functions
        .map((func) => {
          const security =
            func.securityLevel === 'definer' ? ' [SECURITY DEFINER]' : '';
          const params = func.parameters
            .map((p) => {
              const defaultVal = p.defaultValue ? ` = ${p.defaultValue}` : '';
              return `${p.name}: ${p.type}${defaultVal}`;
            })
            .join(', ');

          return `${func.name}(${params}) � ${func.returnType}${security}\n  Purpose: ${func.purpose}\n  Source: ${func.sourceFile}`;
        })
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Database Functions:\n\n${functionsList}`,
          },
        ],
      };
    },
  );
}

function createGetFunctionDetailsTool(server: McpServer) {
  return server.tool(
    'get_function_details',
    'Get detailed information about a specific database function',
    {
      state: z.object({
        functionName: z.string(),
      }),
    },
    async ({ state }) => {
      const func = await DatabaseTool.getFunctionDetails(state.functionName);

      const params =
        func.parameters.length > 0
          ? func.parameters
              .map((p) => {
                const defaultVal = p.defaultValue
                  ? ` (default: ${p.defaultValue})`
                  : '';
                return `  - ${p.name}: ${p.type}${defaultVal}`;
              })
              .join('\n')
          : '  No parameters';

      const securityNote =
        func.securityLevel === 'definer'
          ? '\n�  SECURITY DEFINER: This function runs with elevated privileges and bypasses RLS.'
          : '\n SECURITY INVOKER: This function inherits caller permissions and respects RLS.';

      return {
        content: [
          {
            type: 'text',
            text: `Function: ${func.schema}.${func.name}

Purpose: ${func.purpose}
Description: ${func.description}
Return Type: ${func.returnType}
Security Level: ${func.securityLevel}${securityNote}

Parameters:
${params}

Source File: ${func.sourceFile}`,
          },
        ],
      };
    },
  );
}

function createSearchFunctionsTool(server: McpServer) {
  return server.tool(
    'search_database_functions',
    'Search database functions by name, description, or purpose',
    {
      state: z.object({
        query: z.string(),
      }),
    },
    async ({ state }) => {
      const functions = await DatabaseTool.searchFunctions(state.query);

      if (functions.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No database functions found matching "${state.query}"`,
            },
          ],
        };
      }

      const functionsList = functions
        .map((func) => {
          const security = func.securityLevel === 'definer' ? ' [DEFINER]' : '';
          return `${func.name}${security}: ${func.purpose}`;
        })
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${functions.length} functions matching "${state.query}":\n\n${functionsList}`,
          },
        ],
      };
    },
  );
}

function createGetSchemaContentTool(server: McpServer) {
  return server.tool(
    'get_schema_content',
    '📋 Get raw schema file content (CURRENT DATABASE STATE) - Source of truth for database structure',
    {
      state: z.object({
        fileName: z.string(),
      }),
    },
    async ({ state }) => {
      const content = await DatabaseTool.getSchemaContent(state.fileName);

      return {
        content: [
          {
            type: 'text',
            text: `📋 SCHEMA FILE: ${state.fileName} (CURRENT STATE)\n\n${content}`,
          },
        ],
      };
    },
  );
}

function createGetSchemasByTopicTool(server: McpServer) {
  return server.tool(
    'get_schemas_by_topic',
    '🎯 Find schema files by topic (accounts, auth, permissions, etc.) - Fastest way to find relevant schemas',
    {
      state: z.object({
        topic: z.string(),
      }),
    },
    async ({ state }) => {
      const schemas = await DatabaseTool.getSchemasByTopic(state.topic);

      if (schemas.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No schema files found for topic "${state.topic}". Available topics: accounts, auth, permissions, teams, notifications, storage, admin, security, types, configuration.`,
            },
          ],
        };
      }

      const schemasList = schemas
        .map((schema) => {
          const tablesInfo =
            schema.tables.length > 0
              ? `\n  Tables: ${schema.tables.join(', ')}`
              : '';
          const functionsInfo =
            schema.functions.length > 0
              ? `\n  Functions: ${schema.functions.join(', ')}`
              : '';
          return `${schema.name}: ${schema.description}${tablesInfo}${functionsInfo}`;
        })
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `🎯 SCHEMAS FOR TOPIC: "${state.topic}"\n\n${schemasList}`,
          },
        ],
      };
    },
  );
}

function createGetSchemaBySectionTool(server: McpServer) {
  return server.tool(
    'get_schema_by_section',
    '📂 Get specific schema by section name (Accounts, Permissions, etc.) - Direct access to schema sections',
    {
      state: z.object({
        section: z.string(),
      }),
    },
    async ({ state }) => {
      const schema = await DatabaseTool.getSchemaBySection(state.section);

      if (!schema) {
        return {
          content: [
            {
              type: 'text',
              text: `No schema found for section "${state.section}". Use get_schema_files to see available sections.`,
            },
          ],
        };
      }

      const tablesInfo =
        schema.tables.length > 0 ? `\nTables: ${schema.tables.join(', ')}` : '';
      const functionsInfo =
        schema.functions.length > 0
          ? `\nFunctions: ${schema.functions.join(', ')}`
          : '';
      const dependenciesInfo =
        schema.dependencies.length > 0
          ? `\nDependencies: ${schema.dependencies.join(', ')}`
          : '';

      return {
        content: [
          {
            type: 'text',
            text: `📂 SCHEMA SECTION: ${schema.section}\n\nFile: ${schema.name}\nTopic: ${schema.topic}\nDescription: ${schema.description}${tablesInfo}${functionsInfo}${dependenciesInfo}\n\nLast Modified: ${schema.lastModified.toISOString()}`,
          },
        ],
      };
    },
  );
}

function createDatabaseSummaryTool(server: McpServer) {
  return server.tool(
    'get_database_summary',
    '📊 Get comprehensive database overview with tables, enums, and functions',
    async () => {
      const tables = await DatabaseTool.getAllProjectTables();
      const enums = await DatabaseTool.getAllEnums();
      const functions = await DatabaseTool.getFunctions();

      const summary = {
        overview: {
          totalTables: tables.length,
          totalEnums: Object.keys(enums).length,
          totalFunctions: functions.length,
        },
        tables: tables.map((t) => ({
          name: t.name,
          schema: t.schema,
          topic: t.topic,
          sourceFile: t.sourceFile,
        })),
        enums: Object.entries(enums).map(([name, info]) => ({
          name,
          values: info.values,
          sourceFile: info.sourceFile,
        })),
        functions: functions.map((f) => ({
          name: f.name,
          schema: f.schema,
          purpose: f.purpose,
          sourceFile: f.sourceFile,
        })),
        tablesByTopic: tables.reduce(
          (acc, table) => {
            if (!acc[table.topic]) acc[table.topic] = [];
            acc[table.topic].push(table.name);
            return acc;
          },
          {} as Record<string, string[]>,
        ),
      };

      return {
        content: [
          {
            type: 'text',
            text: `📊 DATABASE OVERVIEW\n\n${JSON.stringify(summary, null, 2)}`,
          },
        ],
      };
    },
  );
}

function createDatabaseTablesListTool(server: McpServer) {
  return server.tool(
    'get_database_tables',
    '📋 Get list of all project-defined database tables',
    async () => {
      const tables = await DatabaseTool.getAllProjectTables();

      return {
        content: [
          {
            type: 'text',
            text: `📋 PROJECT TABLES\n\n${JSON.stringify(tables, null, 2)}`,
          },
        ],
      };
    },
  );
}

function createGetTableInfoTool(server: McpServer) {
  return server.tool(
    'get_table_info',
    '🗂️ Get detailed table schema with columns, foreign keys, and indexes',
    {
      state: z.object({
        schema: z.string().default('public'),
        tableName: z.string(),
      }),
    },
    async ({ state }) => {
      try {
        const tableInfo = await DatabaseTool.getTableInfo(
          state.schema,
          state.tableName,
        );

        return {
          content: [
            {
              type: 'text',
              text: `🗂️ TABLE: ${state.schema}.${state.tableName}\n\n${JSON.stringify(tableInfo, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}

function createGetEnumInfoTool(server: McpServer) {
  return server.tool(
    'get_enum_info',
    '🏷️ Get enum type definition with all possible values',
    {
      state: z.object({
        enumName: z.string(),
      }),
    },
    async ({ state }) => {
      try {
        const enums = await DatabaseTool.getAllEnums();
        const enumInfo = enums[state.enumName];

        if (!enumInfo) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Enum "${state.enumName}" not found. Available enums: ${Object.keys(enums).join(', ')}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `🏷️ ENUM: ${state.enumName}\n\n${JSON.stringify(enumInfo, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}

function createGetAllEnumsTool(server: McpServer) {
  return server.tool(
    'get_all_enums',
    '🏷️ Get all enum types and their values',
    async () => {
      try {
        const enums = await DatabaseTool.getAllEnums();

        return {
          content: [
            {
              type: 'text',
              text: `🏷️ ALL ENUMS\n\n${JSON.stringify(enums, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
