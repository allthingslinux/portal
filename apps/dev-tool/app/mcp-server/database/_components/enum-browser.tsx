'use client';

import { useState } from 'react';

import {
  BellIcon,
  CheckCircleIcon,
  CircleDollarSignIcon,
  CreditCardIcon,
  DatabaseIcon,
  ListIcon,
  ShieldIcon,
  TagIcon,
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

interface DatabaseEnum {
  name: string;
  values: string[];
  sourceFile: string;
  category: string;
  description: string;
}

interface EnumBrowserProps {
  searchTerm: string;
  enums: DatabaseEnum[];
}

const categoryColors: Record<string, string> = {
  'Security & Permissions': 'bg-red-100 text-red-800',
  'Billing & Payments': 'bg-green-100 text-green-800',
  Notifications: 'bg-blue-100 text-blue-800',
};

const categoryIcons: Record<string, React.ComponentType<any>> = {
  'Security & Permissions': ShieldIcon,
  'Billing & Payments': CreditCardIcon,
  Notifications: BellIcon,
};

const valueColors: Record<string, string> = {
  // Permission colors
  'roles.manage': 'bg-purple-100 text-purple-800',
  'settings.manage': 'bg-blue-100 text-blue-800',
  'members.manage': 'bg-orange-100 text-orange-800',
  'invites.manage': 'bg-teal-100 text-teal-800',

  // Payment provider colors
  stripe: 'bg-purple-100 text-purple-800',
  'lemon-squeezy': 'bg-yellow-100 text-yellow-800',
  paddle: 'bg-blue-100 text-blue-800',

  // Notification channel colors
  in_app: 'bg-blue-100 text-blue-800',
  email: 'bg-green-100 text-green-800',

  // Notification type colors
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',

  // Payment status colors
  pending: 'bg-yellow-100 text-yellow-800',
  succeeded: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',

  // Subscription item type colors
  flat: 'bg-gray-100 text-gray-800',
  per_seat: 'bg-orange-100 text-orange-800',
  metered: 'bg-purple-100 text-purple-800',

  // Subscription status colors
  active: 'bg-green-100 text-green-800',
  trialing: 'bg-blue-100 text-blue-800',
  past_due: 'bg-yellow-100 text-yellow-800',
  canceled: 'bg-red-100 text-red-800',
  unpaid: 'bg-red-100 text-red-800',
  incomplete: 'bg-gray-100 text-gray-800',
  incomplete_expired: 'bg-gray-100 text-gray-800',
  paused: 'bg-gray-100 text-gray-800',
};

export function EnumBrowser({ searchTerm, enums }: EnumBrowserProps) {
  const [selectedEnum, setSelectedEnum] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter enums based on search term
  const filteredEnums = enums.filter(
    (enumItem) =>
      enumItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enumItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enumItem.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enumItem.values.some((value) =>
        value.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  // Group enums by category
  const enumsByCategory = filteredEnums.reduce(
    (acc, enumItem) => {
      if (!acc[enumItem.category]) {
        acc[enumItem.category] = [];
      }
      acc[enumItem.category].push(enumItem);
      return acc;
    },
    {} as Record<string, DatabaseEnum[]>,
  );

  const handleEnumClick = (enumName: string) => {
    setSelectedEnum(enumName);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedEnum(null);
  };

  const getValueBadgeColor = (value: string): string => {
    return valueColors[value] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Enums
              </p>
              <p className="text-2xl font-bold">{filteredEnums.length}</p>
            </div>
            <ListIcon className="text-muted-foreground h-8 w-8" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Categories
              </p>
              <p className="text-2xl font-bold">
                {Object.keys(enumsByCategory).length}
              </p>
            </div>
            <TagIcon className="text-muted-foreground h-8 w-8" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Values
              </p>
              <p className="text-2xl font-bold">
                {filteredEnums.reduce(
                  (acc, enumItem) => acc + enumItem.values.length,
                  0,
                )}
              </p>
            </div>
            <DatabaseIcon className="text-muted-foreground h-8 w-8" />
          </CardContent>
        </Card>
      </div>

      {/* Enums by Category */}
      {Object.entries(enumsByCategory).map(([category, categoryEnums]) => {
        const IconComponent = categoryIcons[category] || ListIcon;

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
                {categoryEnums.length} enum
                {categoryEnums.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {categoryEnums.map((enumItem) => (
                <Card
                  key={enumItem.name}
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handleEnumClick(enumItem.name)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-start justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2">
                        <ListIcon className="text-muted-foreground h-4 w-4" />
                        <span className="font-mono">{enumItem.name}</span>
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {enumItem.values.length} value
                        {enumItem.values.length !== 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {enumItem.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {enumItem.values.slice(0, 4).map((value) => (
                        <Badge
                          key={value}
                          variant="outline"
                          className={`text-xs ${getValueBadgeColor(value)}`}
                        >
                          {value}
                        </Badge>
                      ))}
                      {enumItem.values.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{enumItem.values.length - 4} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-mono text-xs">
                        {enumItem.sourceFile}
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
      })}

      {/* Enum Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListIcon className="h-5 w-5" />
              Enum Details: {selectedEnum}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              const enumItem = enums.find((e) => e.name === selectedEnum);
              if (!enumItem) return null;

              return (
                <>
                  <div>
                    <h4 className="mb-2 font-medium">Description</h4>
                    <p className="text-muted-foreground text-sm">
                      {enumItem.description}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="mb-3 font-medium">
                      Values ({enumItem.values.length})
                    </h4>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {enumItem.values.map((value, index) => (
                        <div
                          key={value}
                          className="flex items-center gap-2 rounded border p-2"
                        >
                          <span className="text-muted-foreground font-mono text-xs">
                            {index + 1}.
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-sm ${getValueBadgeColor(value)}`}
                          >
                            {value}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 font-medium">Category</h4>
                      <Badge
                        className={
                          categoryColors[enumItem.category] ||
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        <TagIcon className="mr-1 h-3 w-3" />
                        {enumItem.category}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium">Source File</h4>
                      <span className="text-muted-foreground font-mono text-sm">
                        {enumItem.sourceFile}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="mb-2 font-medium">Usage Examples</h4>
                    <div className="space-y-2">
                      <div className="bg-muted rounded p-3">
                        <code className="text-muted-foreground text-sm">
                          CREATE TABLE example_table (
                        </code>
                        <br />
                        <code className="text-muted-foreground ml-4 text-sm">
                          id uuid PRIMARY KEY,
                        </code>
                        <br />
                        <code className="text-muted-foreground ml-4 text-sm">
                          status {enumItem.name} NOT NULL
                        </code>
                        <br />
                        <code className="text-muted-foreground text-sm">
                          );
                        </code>
                      </div>
                      <div className="bg-muted rounded p-3">
                        <code className="text-muted-foreground text-sm">
                          SELECT * FROM table_name WHERE status = '
                          {enumItem.values[0]}';
                        </code>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {filteredEnums.length === 0 && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <div className="text-center">
              <ListIcon className="text-muted-foreground mx-auto h-8 w-8" />
              <p className="text-muted-foreground mt-2">
                {searchTerm ? 'No enums match your search' : 'No enums found'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
