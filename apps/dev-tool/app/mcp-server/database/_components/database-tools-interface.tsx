'use client';

import { useState } from 'react';

import {
  DatabaseIcon,
  FunctionSquareIcon,
  LayersIcon,
  ListIcon,
  SearchIcon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import { Input } from '@portal/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portal/ui/tabs';

import type {
  DatabaseEnum,
  DatabaseFunction,
  DatabaseTable,
  SchemaFile,
} from '../_lib/server/database-tools.loader';
import { EnumBrowser } from './enum-browser';
import { FunctionBrowser } from './function-browser';
import { SchemaExplorer } from './schema-explorer';
import { TableBrowser } from './table-browser';

interface DatabaseToolsData {
  schemaFiles: SchemaFile[];
  tables: DatabaseTable[];
  functions: DatabaseFunction[];
  enums: DatabaseEnum[];
}

interface DatabaseToolsInterfaceProps {
  searchTerm: string;
  databaseData: DatabaseToolsData;
}

export function DatabaseToolsInterface({
  searchTerm: initialSearchTerm,
  databaseData,
}: DatabaseToolsInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <DatabaseIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Database Tools</h1>
          </div>
          <p className="text-muted-foreground">
            Explore database schemas, tables, functions, and enums
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search tables, functions, schemas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Database Tools Tabs */}
      <Tabs defaultValue="schemas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schemas" className="flex items-center gap-2">
            <LayersIcon className="h-4 w-4" />
            Schemas
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <DatabaseIcon className="h-4 w-4" />
            Tables
          </TabsTrigger>
          <TabsTrigger value="functions" className="flex items-center gap-2">
            <FunctionSquareIcon className="h-4 w-4" />
            Functions
          </TabsTrigger>
          <TabsTrigger value="enums" className="flex items-center gap-2">
            <ListIcon className="h-4 w-4" />
            Enums
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schemas" className="space-y-4">
          <SchemaExplorer
            searchTerm={searchTerm}
            schemaFiles={databaseData.schemaFiles}
          />
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <TableBrowser searchTerm={searchTerm} tables={databaseData.tables} />
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <FunctionBrowser
            searchTerm={searchTerm}
            functions={databaseData.functions}
          />
        </TabsContent>

        <TabsContent value="enums" className="space-y-4">
          <EnumBrowser searchTerm={searchTerm} enums={databaseData.enums} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
