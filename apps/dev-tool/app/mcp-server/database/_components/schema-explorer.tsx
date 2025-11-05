'use client';

import { useState } from 'react';

import { FileTextIcon, LayersIcon } from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@portal/ui/dialog';
import { Separator } from '@portal/ui/separator';

interface SchemaFile {
  filename: string;
  topic: string;
  description: string;
  section?: string;
  tables?: string[];
  functions?: string[];
}

interface SchemaExplorerProps {
  searchTerm: string;
  schemaFiles: SchemaFile[];
}

const topicColors: Record<string, string> = {
  security: 'bg-red-100 text-red-800',
  types: 'bg-purple-100 text-purple-800',
  configuration: 'bg-blue-100 text-blue-800',
  accounts: 'bg-green-100 text-green-800',
  permissions: 'bg-orange-100 text-orange-800',
  teams: 'bg-teal-100 text-teal-800',
  billing: 'bg-yellow-100 text-yellow-800',
  notifications: 'bg-pink-100 text-pink-800',
  auth: 'bg-indigo-100 text-indigo-800',
  admin: 'bg-gray-100 text-gray-800',
  storage: 'bg-cyan-100 text-cyan-800',
};

export function SchemaExplorer({
  searchTerm,
  schemaFiles,
}: SchemaExplorerProps) {
  const [selectedSchema, setSelectedSchema] = useState<SchemaFile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter schemas based on search term
  const filteredSchemas = schemaFiles.filter(
    (schema) =>
      schema.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schema.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schema.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schema.section?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Group schemas by topic for better organization
  const schemasByTopic = filteredSchemas.reduce(
    (acc, schema) => {
      if (!acc[schema.topic]) {
        acc[schema.topic] = [];
      }
      acc[schema.topic].push(schema);
      return acc;
    },
    {} as Record<string, SchemaFile[]>,
  );

  const handleSchemaClick = (schema: SchemaFile) => {
    setSelectedSchema(schema);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedSchema(null);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Schemas
              </p>
              <p className="text-2xl font-bold">{filteredSchemas.length}</p>
            </div>
            <LayersIcon className="text-muted-foreground h-8 w-8" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Topics
              </p>
              <p className="text-2xl font-bold">
                {Object.keys(schemasByTopic).length}
              </p>
            </div>
            <FileTextIcon className="text-muted-foreground h-8 w-8" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Tables
              </p>
              <p className="text-2xl font-bold">
                {filteredSchemas.reduce(
                  (acc, schema) => acc + (schema.tables?.length || 0),
                  0,
                )}
              </p>
            </div>
            <LayersIcon className="text-muted-foreground h-8 w-8" />
          </CardContent>
        </Card>
      </div>

      {/* Schema Files by Topic */}
      {Object.entries(schemasByTopic).map(([topic, schemas]) => (
        <div key={topic} className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              className={topicColors[topic] || 'bg-gray-100 text-gray-800'}
            >
              {topic.toUpperCase()}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {schemas.length} file{schemas.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schemas.map((schema) => (
              <Card
                key={schema.filename}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => handleSchemaClick(schema)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-start justify-between gap-2 text-sm">
                    <span className="line-clamp-1 flex-1">
                      {schema.filename}
                    </span>
                    <FileTextIcon className="text-muted-foreground h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {schema.description}
                  </p>

                  {schema.section && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-xs">
                        Section:
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {schema.section}
                      </Badge>
                    </div>
                  )}

                  {(schema.tables || schema.functions) && (
                    <div className="space-y-2 text-xs">
                      {schema.tables && schema.tables.length > 0 && (
                        <div>
                          <span className="font-medium">Tables: </span>
                          <span className="text-muted-foreground">
                            {schema.tables.slice(0, 3).join(', ')}
                            {schema.tables.length > 3 &&
                              ` +${schema.tables.length - 3} more`}
                          </span>
                        </div>
                      )}

                      {schema.functions && schema.functions.length > 0 && (
                        <div>
                          <span className="font-medium">Functions: </span>
                          <span className="text-muted-foreground">
                            {schema.functions.slice(0, 2).join(', ')}
                            {schema.functions.length > 2 &&
                              ` +${schema.functions.length - 2} more`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Schema Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileTextIcon className="h-5 w-5" />
              {selectedSchema?.filename}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSchema && (
              <>
                <div>
                  <h4 className="mb-2 font-medium">Description</h4>
                  <p className="text-muted-foreground text-sm">
                    {selectedSchema.description}
                  </p>
                </div>

                {selectedSchema.section && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="mb-2 font-medium">Section</h4>
                      <Badge variant="outline">{selectedSchema.section}</Badge>
                    </div>
                  </>
                )}

                {selectedSchema.tables && selectedSchema.tables.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="mb-2 font-medium">
                        Tables ({selectedSchema.tables.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSchema.tables.map((table) => (
                          <Badge
                            key={table}
                            variant="secondary"
                            className="text-xs"
                          >
                            {table}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {selectedSchema.functions &&
                  selectedSchema.functions.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="mb-2 font-medium">
                          Functions ({selectedSchema.functions.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedSchema.functions.map((func) => (
                            <Badge
                              key={func}
                              variant="outline"
                              className="text-xs"
                            >
                              {func}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {filteredSchemas.length === 0 && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <div className="text-center">
              <LayersIcon className="text-muted-foreground mx-auto h-8 w-8" />
              <p className="text-muted-foreground mt-2">
                {searchTerm
                  ? 'No schemas match your search'
                  : 'No schemas found'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
