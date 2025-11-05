'use server';

import { relative } from 'path';

import { DatabaseTool } from '@portal/mcp-server/database';

export async function getTableDetailsAction(
  tableName: string,
  schema = 'public',
) {
  try {
    DatabaseTool.ROOT_PATH = relative(process.cwd(), '../..');

    console.log('Fetching table info for:', { tableName, schema });

    const tableInfo = await DatabaseTool.getTableInfo(schema, tableName);

    console.log('Successfully fetched table info:', tableInfo);

    return {
      success: true,
      data: tableInfo,
    };
  } catch (error) {
    console.error('Error fetching table info:', error);

    return {
      success: false,
      error: `Failed to fetch table information: ${(error as Error).message}`,
    };
  }
}
