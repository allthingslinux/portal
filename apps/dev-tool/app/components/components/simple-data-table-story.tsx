'use client';

import { useMemo } from 'react';

import { faker } from '@faker-js/faker';
import { MoreHorizontal } from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@portal/ui/dropdown-menu';
import { Label } from '@portal/ui/label';
import { Separator } from '@portal/ui/separator';
import { toast } from '@portal/ui/sonner';
import { Switch } from '@portal/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@portal/ui/table';

import { useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Editor';
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: Date;
}

interface SimpleTableControls {
  dataCount: number;
  showActions: boolean;
  showBadges: boolean;
  showCaption: boolean;
}

export function SimpleDataTableStory() {
  const { controls, updateControl } = useStoryControls<SimpleTableControls>({
    dataCount: 10,
    showActions: true,
    showBadges: true,
    showCaption: false,
  });

  // Generate stable mock data
  const data = useMemo(() => {
    faker.seed(controls.dataCount * 123);

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
    }));
  }, [controls.dataCount]);

  const renderTable = () => (
    <div className="rounded-md border">
      <Table>
        {controls.showCaption && (
          <caption className="text-muted-foreground mt-4 text-sm">
            A list of {data.length} users
          </caption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            {controls.showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={controls.showActions ? 6 : 5}
                className="h-24 text-center"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {controls.showBadges ? (
                    <Badge variant="outline">{user.role}</Badge>
                  ) : (
                    user.role
                  )}
                </TableCell>
                <TableCell>
                  {controls.showBadges ? (
                    <Badge
                      variant={
                        user.status === 'Active' ? 'default' : 'secondary'
                      }
                    >
                      {user.status}
                    </Badge>
                  ) : (
                    user.status
                  )}
                </TableCell>
                <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                {controls.showActions && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => toast.success(`Editing ${user.name}`)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toast.success(`Viewing ${user.name}`)}
                        >
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const generateCode = () => {
    return `import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@portal/ui/table';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
}

<div className="rounded-md border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Created At</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((user) => (
        <TableRow key={user.id}>
          <TableCell>{user.name}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>{user.role}</TableCell>
          <TableCell>{user.status}</TableCell>
          <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>`;
  };

  const dataCountOptions = [
    { value: '5', label: '5 records', description: 'Small dataset' },
    { value: '10', label: '10 records', description: 'Default size' },
    { value: '20', label: '20 records', description: 'Medium dataset' },
    { value: '50', label: '50 records', description: 'Large dataset' },
  ];

  const renderPreview = () => renderTable();

  const renderControls = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="dataCount">Data Count</Label>
        <SimpleStorySelect
          value={controls.dataCount.toString()}
          onValueChange={(value) => updateControl('dataCount', parseInt(value))}
          options={dataCountOptions}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Label htmlFor="showCaption">Show Caption</Label>
        <Switch
          id="showCaption"
          checked={controls.showCaption}
          onCheckedChange={(checked) => updateControl('showCaption', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showBadges">Show Badges</Label>
        <Switch
          id="showBadges"
          checked={controls.showBadges}
          onCheckedChange={(checked) => updateControl('showBadges', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showActions">Show Actions</Label>
        <Switch
          id="showActions"
          checked={controls.showActions}
          onCheckedChange={(checked) => updateControl('showActions', checked)}
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Table</CardTitle>
          <CardDescription>
            Simple table with minimal configuration using basic HTML table
            components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 3).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Empty State</CardTitle>
          <CardDescription>
            How the table looks when there's no data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No data available
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>Table Components API</CardTitle>
        <CardDescription>
          Complete API reference for the basic table components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold">Components</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Component</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">HTML Element</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-mono">Table</td>
                  <td className="p-2">Root table container with styling</td>
                  <td className="p-2 font-mono">table</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">TableHeader</td>
                  <td className="p-2">Table header section</td>
                  <td className="p-2 font-mono">thead</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">TableBody</td>
                  <td className="p-2">Table body section</td>
                  <td className="p-2 font-mono">tbody</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">TableRow</td>
                  <td className="p-2">Table row with hover effects</td>
                  <td className="p-2 font-mono">tr</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">TableHead</td>
                  <td className="p-2">Table header cell</td>
                  <td className="p-2 font-mono">th</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">TableCell</td>
                  <td className="p-2">Table data cell</td>
                  <td className="p-2 font-mono">td</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Usage Notes</h4>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• These are basic styled HTML table components</li>
            <li>• No built-in sorting, filtering, or pagination logic</li>
            <li>• Use with manual state management for interactive features</li>
            <li>• All components accept standard HTML table attributes</li>
            <li>• Styling is handled via Tailwind CSS classes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const renderUsageGuidelines = () => (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>When to Use Basic Table Components</CardTitle>
          <CardDescription>
            Best practices for using the basic table components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use Basic Table Components For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Simple data presentation</li>
              <li>• Static tables without complex interactions</li>
              <li>• Quick prototyping and demos</li>
              <li>• Custom table implementations</li>
              <li>• When you need full control over table behavior</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Use DataTable Component Instead For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Large datasets that need pagination</li>
              <li>• Built-in sorting and filtering requirements</li>
              <li>• Row selection and bulk operations</li>
              <li>• Column pinning and visibility controls</li>
              <li>• Advanced table interactions with TanStack Table</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Patterns</CardTitle>
          <CardDescription>
            Common patterns for using basic table components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Basic Structure</h4>
            <pre className="bg-muted text-muted-foreground rounded p-2 text-sm">
              {`<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.value1}</TableCell>
        <TableCell>{item.value2}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}
            </pre>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">With Border Styling</h4>
            <pre className="bg-muted text-muted-foreground rounded p-2 text-sm">
              {`<div className="rounded-md border">
  <Table>
    {/* table content */}
  </Table>
</div>`}
            </pre>
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
      apiReference={renderApiReference()}
      usageGuidelines={renderUsageGuidelines()}
    />
  );
}
