import 'server-only';

import { relative } from 'path';

import { DatabaseTool } from '@portal/mcp-server/database';

export interface DatabaseTable {
  name: string;
  schema: string;
  sourceFile: string;
  topic: string;
}

export interface DatabaseFunction {
  name: string;
  signature: string;
  returnType: string;
  purpose: string;
  source: string;
  isSecurityDefiner: boolean;
  isTrigger: boolean;
  category: string;
}

export interface DatabaseEnum {
  name: string;
  values: string[];
  sourceFile: string;
  category: string;
  description: string;
}

export interface SchemaFile {
  filename: string;
  topic: string;
  description: string;
  section?: string;
  tables?: string[];
  functions?: string[];
}

export async function loadDatabaseToolsData() {
  DatabaseTool.ROOT_PATH = relative(process.cwd(), '../..');

  try {
    const [
      schemaFilesResponse,
      tablesResponse,
      functionsResponse,
      enumsResponse,
    ] = await Promise.all([
      DatabaseTool.getSchemaFiles(),
      DatabaseTool.getAllProjectTables(),
      DatabaseTool.getFunctions(),
      DatabaseTool.getAllEnums(),
    ]);

    // Process schema files
    const schemaFiles: SchemaFile[] = schemaFilesResponse.map((file) => ({
      filename: file.name,
      topic: file.topic || 'general',
      description: file.description || 'Database schema file',
      section: file.section,
      tables: file.tables,
      functions: file.functions,
    }));

    // Process tables
    const tables: DatabaseTable[] = tablesResponse.map((table) => ({
      name: table.name,
      schema: table.schema || 'public',
      sourceFile: table.sourceFile || 'unknown',
      topic: table.topic || 'general',
    }));

    // Process functions - parse the structured function data
    const functions: DatabaseFunction[] = functionsResponse.map((func: any) => {
      // Determine category based on function name and purpose
      let category = 'Utilities';
      if (func.returnType === 'trigger') {
        category = 'Triggers';
      } else if (
        func.name.includes('nonce') ||
        func.name.includes('mfa') ||
        func.name.includes('auth') ||
        func.name.includes('aal2')
      ) {
        category = 'Authentication';
      } else if (
        func.name.includes('account') ||
        func.name.includes('team') ||
        func.name.includes('user')
      ) {
        category = 'Accounts';
      } else if (
        func.name.includes('permission') ||
        func.name.includes('role') ||
        func.name.includes('member')
      ) {
        category = 'Permissions';
      } else if (
        func.name.includes('invitation') ||
        func.name.includes('invite')
      ) {
        category = 'Invitations';
      } else if (
        func.name.includes('billing') ||
        func.name.includes('subscription') ||
        func.name.includes('payment') ||
        func.name.includes('order')
      ) {
        category = 'Billing';
      }

      return {
        name: func.name,
        signature: func.signature || func.name,
        returnType: func.returnType || 'unknown',
        purpose: func.purpose || 'Database function',
        source: func.source || 'unknown',
        isSecurityDefiner: func.isSecurityDefiner || false,
        isTrigger: func.returnType === 'trigger',
        category,
      };
    });

    // Process enums
    const enums: DatabaseEnum[] = Object.entries(enumsResponse).map(
      ([name, data]: [string, any]) => {
        let category = 'General';
        let description = `Database enum type: ${name}`;

        // Categorize enums based on name
        if (name.includes('permission')) {
          category = 'Security & Permissions';
          description =
            'Application-level permissions that can be assigned to roles for granular access control';
        } else if (
          name.includes('billing') ||
          name.includes('payment') ||
          name.includes('subscription')
        ) {
          category = 'Billing & Payments';
          if (name === 'billing_provider') {
            description =
              'Supported payment processing providers for handling subscriptions and transactions';
          } else if (name === 'payment_status') {
            description =
              'Status values for tracking the state of payment transactions';
          } else if (name === 'subscription_status') {
            description =
              'Comprehensive status tracking for subscription lifecycle management';
          } else if (name === 'subscription_item_type') {
            description =
              'Different pricing models for subscription line items and billing calculations';
          }
        } else if (name.includes('notification')) {
          category = 'Notifications';
          if (name === 'notification_channel') {
            description =
              'Available channels for delivering notifications to users';
          } else if (name === 'notification_type') {
            description =
              'Classification types for different notification severity levels';
          }
        }

        return {
          name,
          values: data.values || [],
          sourceFile: data.sourceFile || 'database',
          category,
          description,
        };
      },
    );

    return {
      schemaFiles,
      tables,
      functions,
      enums,
    };
  } catch (error) {
    console.error('Error loading database tools data:', error);

    // Return empty data structures on error
    return {
      schemaFiles: [],
      tables: [],
      functions: [],
      enums: [],
    };
  }
}
