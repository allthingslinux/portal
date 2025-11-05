'use client';

import { useMemo, useState } from 'react';

import { faker } from '@faker-js/faker';

import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { Checkbox } from '@portal/ui/checkbox';
import {
  ColumnDef,
  ColumnPinningState,
  DataTable,
  VisibilityState,
  flexRender,
  useColumnManagement,
} from '@portal/ui/enhanced-data-table';
import { Label } from '@portal/ui/label';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import { TableCell } from '@portal/ui/table';
import { cn } from '@portal/ui/utils';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Editor' | 'Moderator' | 'Guest';
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended' | 'Verified';
  department:
    | 'Engineering'
    | 'Marketing'
    | 'Sales'
    | 'Support'
    | 'Finance'
    | 'HR';
  location: string;
  phone: string;
  age: number;
  salary: number;
  isManager: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  company: string;
  jobTitle: string;
  skills: string[];
  rating: number;
}

interface DataTableControls {
  dataCount: number;
  pageSize: number;
  enableSorting: boolean;
  stickyHeader: boolean;
  enableSelection: boolean;
  enableColumnPinning: boolean;
  enableColumnVisibility: boolean;
}

// Server-side sorting example component
function ServerSideSortingExample({
  data,
  compact = false,
}: {
  data: User[];
  compact?: boolean;
}) {
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSortAction, setLastSortAction] = useState<string>('');

  const handleSortingChange = (newSorting: { id: string; desc: boolean }[]) => {
    setSorting(newSorting);
    setIsLoading(true);

    // Simulate server request
    const sortInfo =
      newSorting.length > 0
        ? `${newSorting[0].id} ${newSorting[0].desc ? 'DESC' : 'ASC'}`
        : 'No sorting';

    setLastSortAction(`Server request would be: ORDER BY ${sortInfo}`);

    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      enableSorting: true,
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      enableSorting: true,
      cell: ({ row }) => {
        const salary = row.getValue('salary') as number;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(salary);
      },
    },
  ];

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Current Sort State:</span>
            <code className="rounded bg-slate-100 px-2 py-1 text-xs">
              {sorting.length > 0
                ? `${sorting[0].id}: ${sorting[0].desc ? 'desc' : 'asc'}`
                : 'none'}
            </code>
            {isLoading && (
              <span className="animate-pulse text-blue-600">⏳ Loading...</span>
            )}
          </div>
          {lastSortAction && (
            <div className="text-xs text-slate-600">🔍 {lastSortAction}</div>
          )}
        </div>
      )}

      <div className={compact ? 'h-full' : 'h-64 rounded border'}>
        <DataTable
          columns={columns}
          data={data}
          pageSize={data.length}
          pageCount={1}
          getRowId={(row) => row.id}
          manualSorting={true} // This is the key difference!
          sorting={sorting}
          onSortingChange={handleSortingChange}
          sticky={!compact}
          className={isLoading ? 'opacity-50' : ''}
        />
      </div>
    </div>
  );
}

export function DataTableStory() {
  const { controls, updateControl } = useStoryControls<DataTableControls>({
    dataCount: 50,
    pageSize: 10,
    enableSorting: true,
    stickyHeader: false,
    enableSelection: true,
    enableColumnPinning: true,
    enableColumnVisibility: true,
  });

  // Generate stable test data
  const data = useMemo(() => {
    faker.seed(123);
    return Array.from({ length: controls.dataCount }, (_, i) => ({
      id: `user-${i + 1}`,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: faker.helpers.arrayElement(['Admin', 'User', 'Editor'] as const),
      status: faker.helpers.arrayElement([
        'Active',
        'Inactive',
        'Pending',
      ] as const),
      createdAt: faker.date.past(),
      department: faker.helpers.arrayElement([
        'Engineering',
        'Marketing',
        'Sales',
        'Support',
        'Finance',
        'HR',
      ] as const),
      location: faker.location.city(),
      phone: faker.phone.number(),
      age: faker.number.int({ min: 20, max: 65 }),
      salary: faker.number.int({ min: 30000, max: 120000 }),
      isManager: faker.datatype.boolean(),
      lastLoginAt: faker.date.recent(),
      company: faker.company.name(),
      jobTitle: faker.person.jobTitle(),
      skills: faker.helpers.arrayElements(
        [
          'JavaScript',
          'React',
          'Node.js',
          'Python',
          'SQL',
          'AWS',
          'Docker',
          'Git',
          'UI/UX Design',
        ] as const,
        {
          min: 2,
          max: 5,
        },
      ),
      rating: faker.number.int({ min: 1, max: 5 }),
    }));
  }, [controls.dataCount]);

  // Row selection state
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Column management with checkbox always pinned left when selection is enabled
  const columnManagement = useColumnManagement({
    defaultVisibility: {
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    } satisfies VisibilityState,
    defaultPinning: (controls.enableSelection
      ? { left: ['select'], right: ['actions'] }
      : { left: [], right: ['actions'] }) satisfies ColumnPinningState,
    onPinningChange: (newPinning: ColumnPinningState): ColumnPinningState => {
      // Always ensure 'select' column is pinned to the left when selection is enabled
      if (controls.enableSelection && !newPinning.left?.includes('select')) {
        return {
          ...newPinning,
          left: [
            'select',
            ...(newPinning.left?.filter((col) => col !== 'select') || []),
          ],
        };
      }
      return newPinning;
    },
  });

  // Define columns
  const columns = useMemo<ColumnDef<User>[]>(() => {
    const cols: ColumnDef<User>[] = [];

    // Add selection column if enabled - always pin to left
    if (controls.enableSelection) {
      cols.push({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      });
    }

    // Add data columns
    cols.push(
      {
        accessorKey: 'name',
        header: 'Name',
        enableSorting: controls.enableSorting,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        enableSorting: controls.enableSorting,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge variant="outline">{row.getValue('role')}</Badge>
        ),
        enableSorting: controls.enableSorting,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <Badge variant={status === 'Active' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          );
        },
        enableSorting: controls.enableSorting,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
          return new Date(row.getValue('createdAt')).toLocaleDateString();
        },
        enableSorting: controls.enableSorting,
      },
      {
        accessorKey: 'department',
        header: 'Department',
        enableSorting: controls.enableSorting,
      },
      {
        accessorKey: 'salary',
        header: 'Salary',
        cell: ({ row }) => {
          const salary = row.getValue('salary') as number;
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
          }).format(salary);
        },
        enableSorting: controls.enableSorting,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: () => (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 80,
      },
    );

    return cols;
  }, [controls.enableSelection, controls.enableSorting]);

  const currentPageData = data.slice(0, controls.pageSize);

  const renderPreview = () => {
    return (
      <div className="space-y-4">
        {/* Warning about pagination */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Pagination controls will update the page
            parameter in the URL query string, but this has no effect in the
            story environment. In a real application, pagination would fetch new
            data from your backend.
          </p>
        </div>

        {/* DataTable */}
        <div className={controls.stickyHeader ? 'h-96' : ''}>
          <DataTable
            columns={columns}
            data={currentPageData}
            getRowId={(row) => row.id}
            pageSize={controls.pageSize}
            pageCount={Math.ceil(data.length / controls.pageSize)}
            sticky={controls.stickyHeader}
            forcePagination={true}
            manualSorting={false} // Enable client-side sorting for demo
            columnVisibility={
              controls.enableColumnVisibility
                ? columnManagement.columnVisibility
                : undefined
            }
            columnPinning={
              controls.enableColumnPinning
                ? columnManagement.columnPinning
                : undefined
            }
            rowSelection={controls.enableSelection ? rowSelection : undefined}
            onColumnVisibilityChange={
              controls.enableColumnVisibility
                ? columnManagement.setColumnVisibility
                : undefined
            }
            onColumnPinningChange={
              controls.enableColumnPinning
                ? columnManagement.setColumnPinning
                : undefined
            }
            onRowSelectionChange={
              controls.enableSelection ? setRowSelection : undefined
            }
          />
        </div>

        {/* Minimal Selection Status at bottom */}
        {controls.enableSelection && (
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>
              Selected:{' '}
              {
                Object.keys(rowSelection).filter((key) => rowSelection[key])
                  .length
              }{' '}
              / {currentPageData.length}
            </span>

            {Object.keys(rowSelection).length > 0 && (
              <Button
                onClick={() => setRowSelection({})}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderControls = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="dataCount">Data Count</Label>
        <SimpleStorySelect
          value={controls.dataCount.toString()}
          onValueChange={(value) => updateControl('dataCount', parseInt(value))}
          options={[
            { value: '10', label: '10 records', description: 'Small dataset' },
            { value: '25', label: '25 records', description: 'Medium dataset' },
            {
              value: '50',
              label: '50 records',
              description: 'Standard dataset',
            },
            {
              value: '100',
              label: '100 records',
              description: 'Large dataset',
            },
          ]}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pageSize">Page Size</Label>
        <SimpleStorySelect
          value={controls.pageSize.toString()}
          onValueChange={(value) => updateControl('pageSize', parseInt(value))}
          options={[
            { value: '5', label: '5 per page', description: 'Compact view' },
            { value: '10', label: '10 per page', description: 'Standard view' },
            { value: '15', label: '15 per page', description: 'Extended view' },
            { value: '25', label: '25 per page', description: 'Large view' },
          ]}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Label htmlFor="enableSorting">Enable Sorting</Label>
        <Switch
          id="enableSorting"
          checked={controls.enableSorting}
          onCheckedChange={(checked) => updateControl('enableSorting', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="stickyHeader">Sticky Header</Label>
        <Switch
          id="stickyHeader"
          checked={controls.stickyHeader}
          onCheckedChange={(checked) => updateControl('stickyHeader', checked)}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Label htmlFor="enableSelection">Enable Row Selection</Label>
        <Switch
          id="enableSelection"
          checked={controls.enableSelection}
          onCheckedChange={(checked) =>
            updateControl('enableSelection', checked)
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="enableColumnPinning">Enable Column Pinning</Label>
        <Switch
          id="enableColumnPinning"
          checked={controls.enableColumnPinning}
          onCheckedChange={(checked) =>
            updateControl('enableColumnPinning', checked)
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="enableColumnVisibility">Enable Column Visibility</Label>
        <Switch
          id="enableColumnVisibility"
          checked={controls.enableColumnVisibility}
          onCheckedChange={(checked) =>
            updateControl('enableColumnVisibility', checked)
          }
        />
      </div>

      {controls.enableSelection && (
        <div className="space-y-2 border-t pt-4">
          <div className="text-sm font-medium">Selection Info</div>
          <div className="text-muted-foreground text-xs">
            Selected:{' '}
            {Object.keys(rowSelection).filter((k) => rowSelection[k]).length}{' '}
            rows
          </div>
          {Object.keys(rowSelection).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRowSelection({})}
            >
              Clear Selection
            </Button>
          )}
        </div>
      )}

      {controls.enableColumnPinning && (
        <div className="space-y-2 border-t pt-4">
          <div className="text-sm font-medium">Column Pinning</div>
          <div className="text-muted-foreground mb-2 text-xs">
            Click buttons to pin columns left (L) or right (R)
          </div>

          {/* Show select column as always pinned left when selection is enabled */}
          {controls.enableSelection && (
            <div className="flex items-center gap-1 opacity-60">
              <span className="w-12 text-xs">select:</span>
              <Button
                disabled
                variant="default"
                size="sm"
                className="h-6 w-6 cursor-not-allowed p-0 text-xs"
              >
                L
              </Button>
              <Button
                disabled
                variant="outline"
                size="sm"
                className="h-6 w-6 cursor-not-allowed p-0 text-xs"
              >
                R
              </Button>
              <Button
                disabled
                variant="outline"
                size="sm"
                className="h-6 w-6 cursor-not-allowed p-0 text-xs"
                title="Cannot unpin selection column"
              >
                ×
              </Button>
              <span className="ml-1 text-xs text-gray-500">(always left)</span>
            </div>
          )}

          {['name', 'email', 'role', 'status', 'createdAt', 'actions'].map(
            (columnId) => {
              const isPinnedLeft =
                columnManagement.isColumnPinned(columnId) === 'left';
              const isPinnedRight =
                columnManagement.isColumnPinned(columnId) === 'right';

              return (
                <div key={columnId} className="flex items-center gap-1">
                  <span className="w-12 text-xs capitalize">{columnId}:</span>
                  <Button
                    onClick={() =>
                      columnManagement.toggleColumnPin(columnId, 'left')
                    }
                    variant={isPinnedLeft ? 'default' : 'outline'}
                    size="sm"
                    className="h-6 w-6 p-0 text-xs"
                  >
                    L
                  </Button>
                  <Button
                    onClick={() =>
                      columnManagement.toggleColumnPin(columnId, 'right')
                    }
                    variant={isPinnedRight ? 'default' : 'outline'}
                    size="sm"
                    className="h-6 w-6 p-0 text-xs"
                  >
                    R
                  </Button>
                  <Button
                    onClick={() => columnManagement.toggleColumnPin(columnId)}
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 text-xs"
                    title="Unpin column"
                  >
                    ×
                  </Button>
                </div>
              );
            },
          )}
        </div>
      )}

      {controls.enableColumnVisibility && (
        <div className="space-y-2 border-t pt-4">
          <div className="text-sm font-medium">Column Visibility</div>
          <div className="space-y-2">
            {[
              'name',
              'email',
              'role',
              'status',
              'createdAt',
              'department',
              'salary',
            ].map((columnId) => (
              <div key={columnId} className="flex items-center justify-between">
                <span className="text-xs capitalize">{columnId}</span>
                <Switch
                  checked={columnManagement.isColumnVisible(columnId)}
                  onCheckedChange={(checked) =>
                    columnManagement.setColumnVisible(columnId, checked)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderExamples = () => {
    // Example-specific column management state
    const exampleColumnManagement = useColumnManagement({
      defaultVisibility: {
        name: true,
        email: true,
        status: true,
        role: true,
        department: true,
        salary: true,
      },
      defaultPinning: { left: [], right: [] },
    });

    // Example-specific row selection states
    const [exampleRowSelection1, setExampleRowSelection1] = useState<
      Record<string, boolean>
    >({});
    const [exampleRowSelection2, setExampleRowSelection2] = useState<
      Record<string, boolean>
    >({});
    const [paginationRowSelection, setPaginationRowSelection] = useState<
      Record<string, boolean>
    >({});

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Usage with Row Click</CardTitle>
            <CardDescription>
              Simple data table with row click handlers to navigate or show
              details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <DataTable
                columns={[
                  { accessorKey: 'name', header: 'Name' },
                  { accessorKey: 'email', header: 'Email' },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ row }) => (
                      <Badge variant="outline">{row.getValue('status')}</Badge>
                    ),
                  },
                ]}
                data={data.slice(0, 5)}
                pageSize={5}
                pageCount={1}
                getRowId={(row) => row.id}
                onClick={({ row, cell }) => {
                  console.log('Row clicked:', row.original);
                  console.log('Cell clicked:', cell);
                }}
              />
              <div className="text-muted-foreground text-xs">
                💡 Click on any row to see the onClick handler in action. In a
                real application, this might navigate to a user detail page or
                open a modal.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>With Selection, Pinning & Cell Click</CardTitle>
            <CardDescription>
              Advanced table with selection (checkbox always pinned left) and
              action column pinned right. Demonstrates both row and cell click
              handlers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium">Column Visibility:</span>
                {['name', 'email', 'role', 'department'].map((columnId) => (
                  <label key={columnId} className="flex items-center gap-2">
                    <Checkbox
                      checked={exampleColumnManagement.isColumnVisible(
                        columnId,
                      )}
                      onCheckedChange={(checked) =>
                        exampleColumnManagement.setColumnVisible(
                          columnId,
                          !!checked,
                        )
                      }
                    />
                    <span className="capitalize">{columnId}</span>
                  </label>
                ))}
              </div>
              <DataTable
                columns={[
                  {
                    id: 'select',
                    header: ({ table }) => (
                      <Checkbox
                        checked={
                          table.getIsAllPageRowsSelected() ||
                          (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) =>
                          table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                      />
                    ),
                    cell: ({ row }) => (
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                      />
                    ),
                    enableSorting: false,
                    enableHiding: false,
                    size: 40,
                  },
                  {
                    accessorKey: 'name',
                    header: 'Name',
                    cell: ({ row }) => (
                      <button
                        className="text-left hover:underline focus:underline focus:outline-none"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          alert(
                            `Cell click: Opening profile for ${row.original.name}`,
                          );
                        }}
                      >
                        {row.getValue('name')}
                      </button>
                    ),
                  },
                  { accessorKey: 'email', header: 'Email' },
                  {
                    accessorKey: 'role',
                    header: 'Role',
                    cell: ({ row }) => (
                      <Badge
                        variant="outline"
                        className="hover:bg-accent cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          alert(`Filter by role: ${row.getValue('role')}`);
                        }}
                      >
                        {row.getValue('role')}
                      </Badge>
                    ),
                  },
                  { accessorKey: 'department', header: 'Department' },
                  {
                    id: 'actions',
                    header: 'Actions',
                    cell: ({ row }) => (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          alert(`Edit user: ${row.original.name}`);
                        }}
                      >
                        Edit
                      </Button>
                    ),
                    enableSorting: false,
                    enableHiding: false,
                    size: 80,
                  },
                ]}
                data={data.slice(0, 5)}
                pageSize={5}
                pageCount={1}
                getRowId={(row) => row.id}
                columnPinning={{
                  left: ['select'],
                  right: ['actions'],
                }}
                columnVisibility={exampleColumnManagement.columnVisibility}
                onColumnVisibilityChange={
                  exampleColumnManagement.setColumnVisibility
                }
                rowSelection={exampleRowSelection1}
                onRowSelectionChange={setExampleRowSelection1}
                onRowClick={(row) => {
                  console.log('Row clicked:', row.original);
                  // In a real app, might navigate to detail view
                  alert(`Row click: Viewing details for ${row.original.name}`);
                }}
              />
              <div className="text-muted-foreground space-y-1 text-xs">
                <p>💡 This example demonstrates multiple click handlers:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>
                    <strong>Name cell:</strong> Click to open user profile
                  </li>
                  <li>
                    <strong>Role badge:</strong> Click to filter by role
                  </li>
                  <li>
                    <strong>Edit button:</strong> Click to edit user
                  </li>
                  <li>
                    <strong>Row click:</strong> Click empty space to view
                    details
                  </li>
                  <li>
                    Cell clicks use <code>e.stopPropagation()</code> to prevent
                    row click
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fixed Height with Sticky Header</CardTitle>
            <CardDescription>
              Table constrained to h-64 with sticky header for scrolling through
              data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-lg border p-0.5">
              <DataTable
                className={''}
                columns={[
                  { accessorKey: 'name', header: 'Name' },
                  { accessorKey: 'email', header: 'Email' },
                  { accessorKey: 'department', header: 'Department' },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ row }) => (
                      <Badge variant="outline">{row.getValue('status')}</Badge>
                    ),
                  },
                  {
                    accessorKey: 'salary',
                    header: 'Salary',
                    cell: ({ row }) => {
                      const salary = row.getValue('salary') as number;
                      return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                      }).format(salary);
                    },
                  },
                ]}
                data={data.slice(0, 20)}
                pageSize={20}
                pageCount={1}
                getRowId={(row) => row.id}
                sticky={true}
              />
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              📄 Try scrolling • Header stays visible while content scrolls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Full-Screen Layout with Action Handlers</CardTitle>
            <CardDescription>
              Simulated full-screen table with toolbar actions and keyboard
              navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-80 flex-col rounded-lg border">
              {/* Simulated header */}
              <div className="bg-muted/30 flex items-center justify-between border-b p-3">
                <h3 className="text-sm font-semibold">Dashboard Table</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const selectedRows = Object.keys(
                        exampleRowSelection2,
                      ).filter((key) => exampleRowSelection2[key]);
                      const selectedCount = selectedRows.length;
                      if (selectedCount > 0) {
                        alert(`Exporting ${selectedCount} selected users`);
                      } else {
                        alert('Exporting all users');
                      }
                    }}
                  >
                    Export (
                    {Object.keys(exampleRowSelection2).filter(
                      (key) => exampleRowSelection2[key],
                    ).length || 'All'}
                    )
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => alert('Opening add user form')}
                  >
                    Add User
                  </Button>
                </div>
              </div>

              {/* Table fills remaining space */}
              <div className="min-h-0 flex-1">
                <DataTable
                  columns={[
                    {
                      id: 'select',
                      header: ({ table }) => (
                        <Checkbox
                          checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                              'indeterminate')
                          }
                          onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                          }
                          aria-label="Select all"
                        />
                      ),
                      cell: ({ row }) => (
                        <Checkbox
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) =>
                            row.toggleSelected(!!value)
                          }
                          aria-label="Select row"
                        />
                      ),
                      enableSorting: false,
                      size: 40,
                    },
                    { accessorKey: 'name', header: 'Name' },
                    { accessorKey: 'email', header: 'Email' },
                    { accessorKey: 'department', header: 'Department' },
                    {
                      accessorKey: 'role',
                      header: 'Role',
                      cell: ({ row }) => (
                        <Badge variant="outline">{row.getValue('role')}</Badge>
                      ),
                    },
                    {
                      id: 'actions',
                      header: 'Actions',
                      cell: ({ row }) => (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Editing ${row.original.name}`);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete ${row.original.name}?`)) {
                                alert('User deleted (simulated)');
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      ),
                      enableSorting: false,
                      size: 120,
                    },
                  ]}
                  data={data.slice(0, 15)}
                  pageSize={15}
                  pageCount={1}
                  getRowId={(row) => row.id}
                  columnPinning={{ left: ['select'], right: ['actions'] }}
                  sticky={true}
                  rowSelection={exampleRowSelection2}
                  onRowSelectionChange={setExampleRowSelection2}
                  onRowClick={(row) => {
                    console.log(
                      'Row clicked in full-screen layout:',
                      row.original,
                    );
                  }}
                  onRowDoubleClick={(row) => {
                    alert(`Double-click: Quick edit for ${row.original.name}`);
                  }}
                />
              </div>
            </div>
            <div className="text-muted-foreground mt-2 space-y-1 text-xs">
              <p>💻 This example shows common dashboard patterns:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Export button shows selected count dynamically</li>
                <li>Action buttons (Edit/Delete) with confirmation dialogs</li>
                <li>Double-click rows for quick actions</li>
                <li>Flex layout fills available space</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsive Height</CardTitle>
            <CardDescription>
              Table height adapts to screen size (h-48 on small, h-64 on medium,
              h-80 on large screens)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64 lg:h-80">
              <DataTable
                tableProps={{
                  className: 'border border-border',
                }}
                columns={[
                  { accessorKey: 'name', header: 'Name' },
                  { accessorKey: 'email', header: 'Email' },
                  { accessorKey: 'location', header: 'Location' },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ row }) => (
                      <Badge variant="outline">{row.getValue('status')}</Badge>
                    ),
                  },
                ]}
                data={data.slice(0, 25)}
                pageSize={25}
                pageCount={1}
                getRowId={(row) => row.id}
                sticky={true}
              />
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              📱 Resize window to see responsive behavior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Cell Rendering with renderCell</CardTitle>
            <CardDescription>
              Using the renderCell prop to wrap all cells with custom behavior
              and styling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { accessorKey: 'name', header: 'Name' },
                { accessorKey: 'email', header: 'Email' },
                {
                  accessorKey: 'role',
                  header: 'Role',
                  cell: ({ row }) => (
                    <Badge variant="outline">{row.getValue('role')}</Badge>
                  ),
                },
                {
                  accessorKey: 'salary',
                  header: 'Salary',
                  cell: ({ row }) => {
                    const salary = row.getValue('salary') as number;
                    return new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                    }).format(salary);
                  },
                },
                {
                  accessorKey: 'rating',
                  header: 'Rating',
                  cell: ({ row }) => {
                    const rating = row.getValue('rating') as number;
                    return (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < rating
                                ? 'text-yellow-400'
                                : 'text-muted-foreground'
                            }
                          >
                            ⭐
                          </span>
                        ))}
                        <span className="text-muted-foreground ml-1 text-xs">
                          ({rating}/5)
                        </span>
                      </div>
                    );
                  },
                },
              ]}
              data={data.slice(0, 8)}
              pageSize={8}
              pageCount={1}
              getRowId={(row) => row.id}
              renderCell={({ cell, style, className }) => {
                // Custom cell wrapper that adds hover effects and tooltips
                return () => (
                  <TableCell
                    key={cell.id}
                    style={style}
                    className={cn(
                      className,
                      'group hover:bg-accent/30 relative transition-all duration-200',
                      // Add special styling for salary column
                      cell.column.id === 'salary' && 'font-mono',
                      // Add padding for rating column
                      cell.column.id === 'rating' && 'px-6',
                    )}
                    title={`Column: ${cell.column.id} | Value: ${cell.getValue()}`}
                  >
                    <div className="relative">
                      {/* Add a subtle border indicator on hover */}
                      <div className="bg-primary/20 absolute top-0 -left-2 h-full w-1 scale-y-0 transform rounded transition-transform duration-200 group-hover:scale-y-100" />
                      <div className="relative z-10">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    </div>
                  </TableCell>
                );
              }}
            />
            <div className="text-muted-foreground mt-3 space-y-2 text-xs">
              <p>💡 This example shows renderCell usage:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Adds custom hover effects to all cells</li>
                <li>Shows tooltips with column and value info</li>
                <li>Applies conditional styling (monospace font for salary)</li>
                <li>Adds animated border indicators on hover</li>
                <li>Maintains all original cell content and behavior</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagination Examples</CardTitle>
            <CardDescription>
              Different pagination scenarios with proper page management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Note about pagination examples */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> These examples show only the first page
                  of data for demonstration. In a real application, pagination
                  would fetch different pages from your backend based on the
                  current page index.
                </p>
              </div>

              {/* Small dataset with pagination */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">
                  Small Dataset (15 items, 5 per page)
                </h4>
                <DataTable
                  columns={[
                    { accessorKey: 'name', header: 'Name' },
                    { accessorKey: 'email', header: 'Email' },
                    {
                      accessorKey: 'status',
                      header: 'Status',
                      cell: ({ row }) => (
                        <Badge variant="outline">
                          {row.getValue('status')}
                        </Badge>
                      ),
                    },
                  ]}
                  data={data.slice(0, 5)}
                  pageSize={5}
                  pageCount={3}
                  getRowId={(row) => row.id}
                />
              </div>

              {/* Medium dataset with pagination */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">
                  Medium Dataset (30 items, 10 per page)
                </h4>
                <DataTable
                  columns={[
                    { accessorKey: 'name', header: 'Name' },
                    { accessorKey: 'department', header: 'Department' },
                    {
                      accessorKey: 'role',
                      header: 'Role',
                      cell: ({ row }) => (
                        <Badge variant="outline">{row.getValue('role')}</Badge>
                      ),
                    },
                    {
                      accessorKey: 'salary',
                      header: 'Salary',
                      cell: ({ row }) => {
                        const salary = row.getValue('salary') as number;
                        return new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(salary);
                      },
                    },
                  ]}
                  data={data.slice(0, 10)}
                  pageSize={10}
                  pageCount={3}
                  getRowId={(row) => row.id}
                />
              </div>

              {/* Large dataset with selection and pagination */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">
                  Large Dataset with Selection & Context Menu (50 items, 15 per
                  page)
                </h4>
                <DataTable
                  columns={[
                    {
                      id: 'select',
                      header: ({ table }) => (
                        <Checkbox
                          checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                              'indeterminate')
                          }
                          onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                          }
                          aria-label="Select all"
                        />
                      ),
                      cell: ({ row }) => (
                        <Checkbox
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) =>
                            row.toggleSelected(!!value)
                          }
                          aria-label="Select row"
                        />
                      ),
                      enableSorting: false,
                      enableHiding: false,
                      size: 40,
                    },
                    { accessorKey: 'name', header: 'Name' },
                    {
                      accessorKey: 'email',
                      header: 'Email',
                      cell: ({ row }) => (
                        <button
                          className="text-left text-blue-600 hover:underline focus:underline focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `mailto:${row.original.email}`,
                              '_blank',
                            );
                          }}
                        >
                          {row.getValue('email')}
                        </button>
                      ),
                    },
                    { accessorKey: 'department', header: 'Department' },
                    { accessorKey: 'location', header: 'Location' },
                    {
                      accessorKey: 'status',
                      header: 'Status',
                      cell: ({ row }) => (
                        <Badge
                          variant={
                            row.getValue('status') === 'Active'
                              ? 'default'
                              : 'secondary'
                          }
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentStatus = row.getValue('status');
                            const newStatus =
                              currentStatus === 'Active'
                                ? 'Inactive'
                                : 'Active';
                            alert(
                              `Status would change from ${currentStatus} to ${newStatus}`,
                            );
                          }}
                        >
                          {row.getValue('status') as string}
                        </Badge>
                      ),
                    },
                    {
                      id: 'actions',
                      header: 'Actions',
                      cell: ({ row }) => (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(
                              `Opening detailed view for ${row.original.name}`,
                            );
                          }}
                        >
                          View
                        </Button>
                      ),
                      enableSorting: false,
                      enableHiding: false,
                      size: 80,
                    },
                  ]}
                  data={data.slice(0, 15)}
                  pageSize={15}
                  pageCount={Math.ceil(50 / 15)}
                  getRowId={(row) => row.id}
                  columnPinning={{
                    left: ['select'],
                    right: ['actions'],
                  }}
                  rowSelection={paginationRowSelection}
                  onRowSelectionChange={setPaginationRowSelection}
                  onRowContextMenu={(row, event) => {
                    event.preventDefault();
                    const actions = [
                      `Edit ${row.original.name}`,
                      `Send message to ${row.original.name}`,
                      `View ${row.original.name}'s profile`,
                      '---',
                      `Delete ${row.original.name}`,
                    ];
                    alert(
                      `Right-click context menu for ${row.original.name}:\n\n${actions.join('\n')}`,
                    );
                  }}
                  onRowClick={(row) => {
                    console.log(
                      'Row clicked in pagination example:',
                      row.original,
                    );
                  }}
                />
              </div>

              {/* Force pagination example */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">
                  Force Pagination (3 items, but pagination shown)
                </h4>
                <p className="text-muted-foreground text-xs">
                  Using `forcePagination={true}` to show pagination controls
                  even with few items
                </p>
                <DataTable
                  columns={[
                    { accessorKey: 'name', header: 'Name' },
                    { accessorKey: 'email', header: 'Email' },
                    {
                      accessorKey: 'role',
                      header: 'Role',
                      cell: ({ row }) => (
                        <Badge variant="outline">{row.getValue('role')}</Badge>
                      ),
                    },
                  ]}
                  data={data.slice(0, 3)}
                  pageSize={5}
                  pageCount={1}
                  getRowId={(row) => row.id}
                  forcePagination={true}
                />
              </div>
            </div>

            <div className="text-muted-foreground mt-6 space-y-2 text-xs">
              <p>💡 Pagination examples demonstrate:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Different page sizes (5, 10, 15 per page)</li>
                <li>Proper pageCount calculation based on total items</li>
                <li>Selection state preserved across page changes</li>
                <li>Force pagination option for consistency</li>
                <li>
                  Real pagination controls (note: URL updates don't work in
                  stories)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server-Side Sorting (Manual Sorting)</CardTitle>
            <CardDescription>
              Demonstrates server-side sorting with manualSorting=true. Click
              headers to see sorting state, but data doesn't change (would
              require server integration).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>Server-Side Mode:</strong> This table has
                  manualSorting=true (default). Clicking column headers triggers
                  onSortingChange callback where you would fetch sorted data
                  from your server. The table shows current sort state but
                  doesn't modify data locally.
                </p>
              </div>

              <ServerSideSortingExample data={data.slice(0, 10)} />

              <div className="text-muted-foreground space-y-2 text-xs">
                <p>💡 Server-side sorting pattern:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>
                    Use onSortingChange to detect sort column/direction changes
                  </li>
                  <li>Send sorting parameters to your API endpoint</li>
                  <li>Update data state with sorted results from server</li>
                  <li>Show loading states during sort operations</li>
                  <li>
                    Handle sort state in URL for bookmarkable sorted views
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client-Side vs Server-Side Sorting Comparison</CardTitle>
            <CardDescription>
              Side-by-side comparison of client-side and server-side sorting
              approaches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-green-700">
                    Client-Side Sorting (manualSorting=false)
                  </h4>
                  <div className="h-48 rounded border">
                    <DataTable
                      columns={[
                        {
                          accessorKey: 'name',
                          header: 'Name',
                          enableSorting: true,
                        },
                        {
                          accessorKey: 'department',
                          header: 'Department',
                          enableSorting: true,
                        },
                        {
                          accessorKey: 'salary',
                          header: 'Salary',
                          enableSorting: true,
                          cell: ({ row }) => {
                            const salary = row.getValue('salary') as number;
                            return new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 0,
                            }).format(salary);
                          },
                        },
                      ]}
                      data={data.slice(0, 8)}
                      pageSize={8}
                      pageCount={1}
                      getRowId={(row) => row.id}
                      manualSorting={false}
                      sticky={true}
                    />
                  </div>
                  <p className="text-xs text-green-600">
                    ✅ Data sorts immediately when headers are clicked
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-blue-700">
                    Server-Side Sorting (manualSorting=true - default)
                  </h4>
                  <div className="h-48 rounded border">
                    <ServerSideSortingExample
                      data={data.slice(0, 8)}
                      compact={true}
                    />
                  </div>
                  <p className="text-xs text-blue-600">
                    ℹ️ Headers show sort state but data unchanged (awaits
                    server)
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-slate-50 p-4">
                <h4 className="mb-3 text-sm font-semibold">
                  When to use each approach:
                </h4>
                <div className="grid gap-4 text-xs md:grid-cols-2">
                  <div>
                    <h5 className="mb-2 font-semibold text-green-700">
                      Client-Side (manualSorting=false)
                    </h5>
                    <ul className="ml-4 list-disc space-y-1">
                      <li>Small to medium datasets (&lt;1000 rows)</li>
                      <li>All data already loaded</li>
                      <li>Instant sorting feedback</li>
                      <li>Works offline</li>
                      <li>Simpler implementation</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="mb-2 font-semibold text-blue-700">
                      Server-Side (manualSorting=true - default)
                    </h5>
                    <ul className="ml-4 list-disc space-y-1">
                      <li>Large datasets (&gt;1000 rows)</li>
                      <li>Paginated data loading</li>
                      <li>Database-level sorting performance</li>
                      <li>Memory efficient</li>
                      <li>Required for real-world applications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const generateCode = () => {
    const propsString = generatePropsString(
      {
        pageSize: controls.pageSize,
        sticky: controls.stickyHeader,
        forcePagination: true,
        enableSelection: controls.enableSelection,
        enableColumnVisibility: controls.enableColumnVisibility,
        enableColumnPinning: controls.enableColumnPinning,
      },
      {
        pageSize: 10,
        sticky: false,
        forcePagination: false,
        enableSelection: false,
        enableColumnVisibility: false,
        enableColumnPinning: false,
      },
    );

    return `import { useState } from 'react';
import { DataTable, ColumnDef${controls.enableSelection || controls.enableColumnVisibility || controls.enableColumnPinning ? ', useColumnManagement' : ''} } from '@portal/ui/enhanced-data-table';${controls.enableSelection ? "\nimport { Checkbox } from '@portal/ui/checkbox';" : ''}
import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  // ... other fields
}

export function MyDataTable() {${controls.enableSelection ? '\n  const [rowSelection, setRowSelection] = useState({});' : ''}${
      controls.enableColumnVisibility || controls.enableColumnPinning
        ? `
  
  const columnManagement = useColumnManagement({
    defaultVisibility: { /* your defaults */ },
    defaultPinning: ${controls.enableSelection ? "{ left: ['select'], right: ['actions'] }" : '{ left: [], right: [] }'},
  });`
        : ''
    }

  const columns: ColumnDef<User>[] = [${
    controls.enableSelection
      ? `
    // Selection column - always pinned left
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      size: 40,
    },`
      : ''
  }
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email', 
      header: 'Email',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('status')}</Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => <Button size="sm">Edit</Button>,
      enableSorting: false,
      size: 80,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      getRowId={(row) => row.id}${propsString}${controls.enableColumnVisibility ? '\n      columnVisibility={columnManagement.columnVisibility}\n      onColumnVisibilityChange={columnManagement.setColumnVisibility}' : ''}${controls.enableColumnPinning ? '\n      columnPinning={columnManagement.columnPinning}\n      onColumnPinningChange={columnManagement.setColumnPinning}' : ''}${controls.enableSelection ? '\n      rowSelection={rowSelection}\n      onRowSelectionChange={setRowSelection}' : ''}
    />
  );
}`;
  };

  const renderUsageGuidelines = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
            Guidelines for using DataTable effectively
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Column Pinning Best Practices
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>
                • Always pin selection checkboxes to the left for consistency
              </li>
              <li>• Pin action buttons to the right for easy access</li>
              <li>• Keep important identifier columns (like names) pinned</li>
              <li>• Limit pinned columns to 2-3 per side for usability</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Selection Best Practices
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Provide clear feedback on selected items count</li>
              <li>• Include bulk action buttons when selection is enabled</li>
              <li>• Use consistent selection patterns across your app</li>
              <li>• Consider pagination impact on bulk selections</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-700">
              📏 Height & Layout Best Practices
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>
                • Use sticky headers with fixed height containers (h-96,
                max-h-screen)
              </li>
              <li>
                • For full-screen tables, wrap in flex containers with min-h-0
              </li>
              <li>• Always test with varying content lengths</li>
              <li>• Consider responsive behavior on smaller screens</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-purple-700">
              🔧 Sticky Header Guidelines
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Sticky headers work best in fixed-height containers</li>
              <li>• Combine with rounded borders for polished appearance</li>
              <li>
                • Ensure sufficient contrast for sticky header backgrounds
              </li>
              <li>• Test scroll behavior with long datasets</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Height & Layout Examples</CardTitle>
          <CardDescription>
            Common patterns for DataTable height management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">1. Fixed Height Container</h4>
            <div className="rounded border bg-slate-50 p-3">
              <code className="text-xs">
                {`<div className="h-96 rounded-lg border">
  <DataTable
    columns={columns}
    data={data}
    sticky={true}
    // ... other props
  />
</div>`}
              </code>
            </div>
            <p className="text-muted-foreground text-xs">
              Best for cards, modals, or sections with known height constraints
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">2. Full-Screen Stretch</h4>
            <div className="rounded border bg-slate-50 p-3">
              <code className="text-xs">
                {`<div className="flex flex-col h-screen">
  <header>...</header>
  <div className="flex-1 min-h-0 p-4">
    <div className="h-full rounded-lg border">
      <DataTable
        columns={columns}
        data={data}
        sticky={true}
        // ... other props
      />
    </div>
  </div>
</div>`}
              </code>
            </div>
            <p className="text-muted-foreground text-xs">
              For dashboard pages where table should fill available space
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">3. Responsive Height</h4>
            <div className="rounded border bg-slate-50 p-3">
              <code className="text-xs">
                {`<div className="h-64 sm:h-80 lg:h-96 rounded-lg border">
  <DataTable
    columns={columns}
    data={data}
    sticky={true}
    // ... other props
  />
</div>`}
              </code>
            </div>
            <p className="text-muted-foreground text-xs">
              Adapts table height based on screen size for optimal experience
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">4. Content-Aware Height</h4>
            <div className="rounded border bg-slate-50 p-3">
              <code className="text-xs">
                {`<div className="max-h-screen overflow-hidden rounded-lg border">
  <DataTable
    columns={columns}
    data={data}
    sticky={true}
    pageSize={data.length} // Show all data
    // ... other props
  />
</div>`}
              </code>
            </div>
            <p className="text-muted-foreground text-xs">
              Let table grow with content but constrain to screen height
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ComponentStoryLayout
      preview={renderPreview()}
      controls={renderControls()}
      generatedCode={generateCode()}
      examples={renderExamples()}
      usageGuidelines={renderUsageGuidelines()}
    />
  );
}
