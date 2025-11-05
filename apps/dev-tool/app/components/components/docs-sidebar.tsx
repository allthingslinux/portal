'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Code2, FileText, Search } from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Input } from '@portal/ui/input';
import { ScrollArea } from '@portal/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { cn } from '@portal/ui/utils';

import type { ComponentInfo } from '../lib/components-data';
import {
  COMPONENTS_REGISTRY,
  categories,
  categoryInfo,
} from '../lib/components-data';

interface DocsSidebarProps {
  selectedComponent: string;
  selectedCategory: string | null;
}

export function DocsSidebar({
  selectedComponent,
  selectedCategory,
}: DocsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredComponents = COMPONENTS_REGISTRY.filter((c) =>
    selectedCategory ? c.category === selectedCategory : true,
  )
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subcategory.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const onCategorySelect = (category: string | null) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('category', category || '');
    router.push(`/components?${searchParams.toString()}`);
  };

  const onComponentSelect = (component: ComponentInfo) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('component', component.name);
    router.push(`/components?${searchParams.toString()}`);
  };

  return (
    <div className="bg-muted/30 flex h-screen w-80 flex-col overflow-hidden border-r">
      {/* Header */}
      <div className="flex-shrink-0 border-b p-4">
        <div className="mb-2 flex items-center gap-2">
          <Code2 className="text-primary h-6 w-6" />

          <h1 className="text-xl font-bold">Components</h1>
        </div>

        <p className="text-muted-foreground text-sm">
          This is the documentation for the components of the UI Kit.
        </p>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 space-y-2 border-b p-4">
        {/* Category Select */}
        <div className="space-y-2">
          <Select
            value={selectedCategory || 'all'}
            onValueChange={(value) => {
              const category = value === 'all' ? null : value;
              onCategorySelect(category);

              // Select first component in the filtered results
              const firstComponent = category
                ? COMPONENTS_REGISTRY.find((c) => c.category === category)
                : COMPONENTS_REGISTRY[0];

              if (firstComponent) {
                onComponentSelect(firstComponent);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={'Select a category'} />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <span>All Components</span>

                  <Badge variant="secondary" className="text-xs">
                    {COMPONENTS_REGISTRY.length}
                  </Badge>
                </div>
              </SelectItem>

              {categories.map((category) => {
                const categoryData =
                  categoryInfo[category as keyof typeof categoryInfo];

                const categoryComponents = COMPONENTS_REGISTRY.filter(
                  (c) => c.category === category,
                );

                return (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center gap-2">
                      {categoryData && (
                        <categoryData.icon className="h-4 w-4" />
                      )}
                      <span>{category}</span>
                      <Badge variant="outline" className="text-xs">
                        {categoryComponents.length}
                      </Badge>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

            <Input
              placeholder={'Search for a component'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Components List - Scrollable */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-shrink-0 p-4 pb-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4" />
            Components
            <Badge variant="outline" className="text-xs">
              {filteredComponents.length}
            </Badge>
            {selectedCategory && (
              <Badge variant="secondary" className="text-xs">
                {selectedCategory}
              </Badge>
            )}
          </h3>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-4 pb-4">
            <div className="space-y-1">
              {filteredComponents.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                  <p className="text-sm">No components found</p>
                  <p className="mt-1 text-xs">
                    Try adjusting your search or category filter
                  </p>
                </div>
              ) : (
                filteredComponents.map((item) => {
                  const IconComponent = item.icon;

                  return (
                    <ComponentItem
                      key={item.id}
                      item={item}
                      isSelected={item.name === selectedComponent}
                      onComponentSelect={onComponentSelect}
                      IconComponent={IconComponent}
                    />
                  );
                })
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function ComponentItem({
  item,
  isSelected,
  onComponentSelect,
  IconComponent,
}: {
  item: ComponentInfo;
  IconComponent: React.ComponentType<{ className?: string }>;
  isSelected: boolean;
  onComponentSelect: (item: ComponentInfo) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isSelected) {
      ref.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isSelected]);

  return (
    <button
      ref={ref}
      key={item.id}
      onClick={() => onComponentSelect(item)}
      className={cn(
        'w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent hover:text-accent-foreground',
      )}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <IconComponent className="h-4 w-4 flex-shrink-0" />

          <span className="flex-1 truncate font-medium">{item.name}</span>
        </div>
        <p
          className={cn(
            'ml-6 line-clamp-1 text-xs',
            isSelected ? 'opacity-90' : 'text-muted-foreground',
          )}
        >
          {item.description}
        </p>

        <div className="ml-6 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'font-medium',
              isSelected ? 'opacity-80' : 'text-muted-foreground',
            )}
          >
            {item.subcategory}
          </span>
          <span
            className={cn(
              isSelected ? 'opacity-60' : 'text-muted-foreground/60',
            )}
          >
            • {item.props.length} props
          </span>
        </div>
      </div>
    </button>
  );
}
