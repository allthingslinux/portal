'use client';

import { useState } from 'react';

import { DatabaseIcon, KeyIcon, LinkIcon, TableIcon } from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@portal/ui/dialog';
import { Separator } from '@portal/ui/separator';

import { getTableDetailsAction } from '../_lib/server/table-server-actions';

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencedTable: string | null;
  referencedColumn: string | null;
}

interface TableInfo {
  name: string;
  schema: string;
  sourceFile: string;
  topic: string;
  columns: TableColumn[];
  foreignKeys: Array<{
    name: string;
    columns: string[];
    referencedTable: string;
    referencedColumns: string[];
    onDelete: string;
    onUpdate: string;
  }>;
  indexes: Array<{
    name: string;
    columns: string[];
    unique: boolean;
    type: string;
  }>;
}

interface TableSummary {
  name: string;
  schema: string;
  sourceFile: string;
  topic: string;
}

interface TableBrowserProps {
  searchTerm: string;
  tables: TableSummary[];
}

const topicColors: Record<string, string> = {
  accounts: 'bg-green-100 text-green-800',
  teams: 'bg-teal-100 text-teal-800',
  configuration: 'bg-blue-100 text-blue-800',
  auth: 'bg-indigo-100 text-indigo-800',
  notifications: 'bg-pink-100 text-pink-800',
  permissions: 'bg-orange-100 text-orange-800',
  general: 'bg-gray-100 text-gray-800',
};

const typeColors: Record<string, string> = {
  uuid: 'bg-purple-100 text-purple-800',
  text: 'bg-blue-100 text-blue-800',
  'character varying': 'bg-blue-100 text-blue-800',
  boolean: 'bg-green-100 text-green-800',
  integer: 'bg-orange-100 text-orange-800',
  'timestamp with time zone': 'bg-gray-100 text-gray-800',
  jsonb: 'bg-yellow-100 text-yellow-800',
  'USER-DEFINED': 'bg-red-100 text-red-800',
};

export function TableBrowser({ searchTerm, tables }: TableBrowserProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableDetails, setTableDetails] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter tables based on search term
  const filteredTables = tables.filter(
    (table) =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.sourceFile.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Group tables by topic
  const tablesByTopic = filteredTables.reduce(
    (acc, table) => {
      if (!acc[table.topic]) {
        acc[table.topic] = [];
      }
      acc[table.topic].push(table);
      return acc;
    },
    {} as Record<string, TableSummary[]>,
  );

  const handleTableClick = async (tableName: string) => {
    setSelectedTable(tableName);
    setIsDialogOpen(true);
    setLoading(true);
    setTableDetails(null);

    try {
      const result = await getTableDetailsAction(tableName, 'public');

      if (result.success && result.data) {
        setTableDetails(result.data);
      } else {
        console.error('Error fetching table details:', result.error);
        setTableDetails(null);
      }
    } catch (error) {
      console.error('Error fetching table details:', error);
      setTableDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedTable(null);
    setTableDetails(null);
  };

  const getColumnTypeDisplay = (type: string) => {
    const cleanType = type.replace('character varying', 'varchar');
    return cleanType;
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Tables
              </p>
              <p className="text-2xl font-bold">{filteredTables.length}</p>
            </div>
            <DatabaseIcon className="text-muted-foreground h-8 w-8" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Topics
              </p>
              <p className="text-2xl font-bold">
                {Object.keys(tablesByTopic).length}
              </p>
            </div>
            <TableIcon className="text-muted-foreground h-8 w-8" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Schema
              </p>
              <p className="text-2xl font-bold">public</p>
            </div>
            <DatabaseIcon className="text-muted-foreground h-8 w-8" />
          </CardContent>
        </Card>
      </div>

      {/* Tables by Topic */}
      {Object.entries(tablesByTopic).map(([topic, topicTables]) => (
        <div key={topic} className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              className={topicColors[topic] || 'bg-gray-100 text-gray-800'}
            >
              {topic.toUpperCase()}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {topicTables.length} table{topicTables.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topicTables.map((table) => (
              <Card
                key={table.name}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => handleTableClick(table.name)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-start justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <TableIcon className="text-muted-foreground h-4 w-4" />
                      <span className="font-mono">{table.name}</span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      Schema:
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {table.schema}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      Source:
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {table.sourceFile}
                    </span>
                  </div>

                  <div className="pt-2">
                    <Badge variant="secondary" className="text-xs">
                      Click for details
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Table Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TableIcon className="h-5 w-5" />
              Table Details: {selectedTable}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {loading && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  Loading table details...
                </p>
              </div>
            )}
            {selectedTable && tableDetails && (
              <>
                {/* Columns */}
                <div>
                  <h4 className="mb-3 font-medium">
                    Columns ({tableDetails.columns.length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">Name</th>
                          <th className="py-2 text-left">Type</th>
                          <th className="py-2 text-left">Nullable</th>
                          <th className="py-2 text-left">Default</th>
                          <th className="py-2 text-left">Constraints</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableDetails.columns.map((column) => (
                          <tr key={column.name} className="border-b">
                            <td className="py-2 font-mono">{column.name}</td>
                            <td className="py-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  typeColors[column.type] ||
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {getColumnTypeDisplay(column.type)}
                              </Badge>
                            </td>
                            <td className="py-2">
                              <Badge
                                variant={
                                  column.nullable ? 'secondary' : 'outline'
                                }
                              >
                                {column.nullable ? 'YES' : 'NO'}
                              </Badge>
                            </td>
                            <td className="text-muted-foreground py-2 font-mono text-xs">
                              {column.defaultValue || '—'}
                            </td>
                            <td className="py-2">
                              <div className="flex gap-1">
                                {column.isPrimaryKey && (
                                  <Badge variant="default" className="text-xs">
                                    <KeyIcon className="mr-1 h-3 w-3" />
                                    PK
                                  </Badge>
                                )}
                                {column.isForeignKey && (
                                  <Badge variant="outline" className="text-xs">
                                    <LinkIcon className="mr-1 h-3 w-3" />
                                    FK
                                  </Badge>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Foreign Keys */}
                {tableDetails.foreignKeys.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="mb-3 font-medium">
                        Foreign Keys ({tableDetails.foreignKeys.length})
                      </h4>
                      <div className="space-y-2">
                        {tableDetails.foreignKeys.map((fk) => (
                          <div
                            key={fk.name}
                            className="flex items-center gap-2 text-sm"
                          >
                            <LinkIcon className="text-muted-foreground h-4 w-4" />
                            <span className="font-mono">
                              {fk.columns.join(', ')}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-mono">
                              {fk.referencedTable}.
                              {fk.referencedColumns.join(', ')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              ON DELETE {fk.onDelete}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Indexes */}
                {tableDetails.indexes.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="mb-3 font-medium">
                        Indexes ({tableDetails.indexes.length})
                      </h4>
                      <div className="space-y-2">
                        {tableDetails.indexes.map((index) => (
                          <div
                            key={index.name}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">
                                {index.name}
                              </span>
                              {index.unique && (
                                <Badge variant="default" className="text-xs">
                                  UNIQUE
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {index.type.toUpperCase()}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground">on</span>
                            <span className="font-mono text-xs">
                              {index.columns.join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            {selectedTable && !tableDetails && !loading && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No detailed information available for this table.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {filteredTables.length === 0 && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <div className="text-center">
              <DatabaseIcon className="text-muted-foreground mx-auto h-8 w-8" />
              <p className="text-muted-foreground mt-2">
                {searchTerm ? 'No tables match your search' : 'No tables found'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
