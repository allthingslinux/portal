'use client';

import { useState } from 'react';

import {
  ArrowRightIcon,
  DatabaseIcon,
  FunctionSquareIcon,
  KeyIcon,
  ShieldIcon,
  UserIcon,
  ZapIcon,
} from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@portal/ui/dialog';
import { Separator } from '@portal/ui/separator';

interface DatabaseFunction {
  name: string;
  signature: string;
  returnType: string;
  purpose: string;
  source: string;
  isSecurityDefiner: boolean;
  isTrigger: boolean;
  category: string;
}

interface FunctionBrowserProps {
  searchTerm: string;
  functions: DatabaseFunction[];
}

const categoryColors: Record<string, string> = {
  Triggers: 'bg-red-100 text-red-800',
  Authentication: 'bg-indigo-100 text-indigo-800',
  Accounts: 'bg-green-100 text-green-800',
  Permissions: 'bg-orange-100 text-orange-800',
  Invitations: 'bg-teal-100 text-teal-800',
  Billing: 'bg-yellow-100 text-yellow-800',
  Utilities: 'bg-blue-100 text-blue-800',
  'Text Processing': 'bg-purple-100 text-purple-800',
};

const categoryIcons: Record<string, React.ComponentType<any>> = {
  Triggers: ZapIcon,
  Authentication: ShieldIcon,
  Accounts: UserIcon,
  Permissions: KeyIcon,
  Invitations: UserIcon,
  Billing: DatabaseIcon,
  Utilities: FunctionSquareIcon,
  'Text Processing': FunctionSquareIcon,
};

export function FunctionBrowser({
  searchTerm,
  functions,
}: FunctionBrowserProps) {
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter functions based on search term
  const filteredFunctions = functions.filter(
    (func) =>
      func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      func.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      func.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      func.source.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Group functions by category
  const functionsByCategory = filteredFunctions.reduce(
    (acc, func) => {
      if (!acc[func.category]) {
        acc[func.category] = [];
      }
      acc[func.category].push(func);
      return acc;
    },
    {} as Record<string, DatabaseFunction[]>,
  );

  const handleFunctionClick = (functionName: string) => {
    setSelectedFunction(functionName);
    setIsDialogOpen(true);
  };

  const getReturnTypeColor = (returnType: string): string => {
    if (returnType === 'trigger') return 'bg-red-100 text-red-800';
    if (returnType === 'boolean') return 'bg-green-100 text-green-800';
    if (returnType === 'uuid') return 'bg-purple-100 text-purple-800';
    if (returnType === 'text') return 'bg-blue-100 text-blue-800';
    if (returnType === 'json' || returnType === 'jsonb')
      return 'bg-yellow-100 text-yellow-800';
    if (returnType === 'TABLE') return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Functions
              </p>
              <p className="text-2xl font-bold">{filteredFunctions.length}</p>
            </div>
            <FunctionSquareIcon className="text-muted-foreground h-8 w-8" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Categories
              </p>
              <p className="text-2xl font-bold">
                {Object.keys(functionsByCategory).length}
              </p>
            </div>
            <DatabaseIcon className="text-muted-foreground h-8 w-8" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Security Definer
              </p>
              <p className="text-2xl font-bold">
                {filteredFunctions.filter((f) => f.isSecurityDefiner).length}
              </p>
            </div>
            <ShieldIcon className="text-muted-foreground h-8 w-8" />
          </CardContent>
        </Card>
      </div>

      {/* Functions by Category */}
      {Object.entries(functionsByCategory).map(
        ([category, categoryFunctions]) => {
          const IconComponent = categoryIcons[category] || FunctionSquareIcon;

          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    categoryColors[category] || 'bg-gray-100 text-gray-800'
                  }
                >
                  <IconComponent className="mr-1 h-3 w-3" />
                  {category}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  {categoryFunctions.length} function
                  {categoryFunctions.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {categoryFunctions.map((func) => (
                  <Card
                    key={func.name}
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => handleFunctionClick(func.name)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-start justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2">
                          <FunctionSquareIcon className="text-muted-foreground h-4 w-4" />
                          <span className="font-mono">{func.name}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          {func.isSecurityDefiner && (
                            <Badge variant="default" className="text-xs">
                              <ShieldIcon className="mr-1 h-3 w-3" />
                              DEFINER
                            </Badge>
                          )}
                          {func.isTrigger && (
                            <Badge variant="outline" className="text-xs">
                              <ZapIcon className="mr-1 h-3 w-3" />
                              TRIGGER
                            </Badge>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ArrowRightIcon className="text-muted-foreground h-3 w-3" />
                        <Badge
                          variant="outline"
                          className={`text-xs ${getReturnTypeColor(func.returnType)}`}
                        >
                          {func.returnType}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {func.purpose}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-mono text-xs">
                          {func.source}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Click for details
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        },
      )}

      {/* Function Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FunctionSquareIcon className="h-5 w-5" />
              Function Details: {selectedFunction}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              const func = functions.find((f) => f.name === selectedFunction);
              if (!func) return null;

              return (
                <>
                  <div>
                    <h4 className="mb-2 font-medium">Signature</h4>
                    <code className="text-muted-foreground bg-muted block rounded p-3 text-sm">
                      {func.signature}
                    </code>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="mb-2 font-medium">Purpose</h4>
                    <p className="text-muted-foreground text-sm">
                      {func.purpose}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 font-medium">Return Type</h4>
                      <Badge
                        variant="outline"
                        className={getReturnTypeColor(func.returnType)}
                      >
                        {func.returnType}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium">Source File</h4>
                      <span className="text-muted-foreground font-mono text-sm">
                        {func.source}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="mb-2 font-medium">Properties</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        <DatabaseIcon className="mr-1 h-3 w-3" />
                        {func.category}
                      </Badge>
                      {func.isSecurityDefiner && (
                        <Badge variant="default">
                          <ShieldIcon className="mr-1 h-3 w-3" />
                          Security Definer
                        </Badge>
                      )}
                      {func.isTrigger && (
                        <Badge variant="secondary">
                          <ZapIcon className="mr-1 h-3 w-3" />
                          Trigger Function
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {filteredFunctions.length === 0 && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <div className="text-center">
              <FunctionSquareIcon className="text-muted-foreground mx-auto h-8 w-8" />
              <p className="text-muted-foreground mt-2">
                {searchTerm
                  ? 'No functions match your search'
                  : 'No functions found'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
