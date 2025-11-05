'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@portal/ui/select';
import { cn } from '@portal/ui/utils';

import type { SelectOption } from '../lib/story-utils';

interface StorySelectProps<T = string> {
  value: T;
  onValueChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
}

export function StorySelect<T extends string = string>({
  value,
  onValueChange,
  options,
  placeholder,
  className,
}: StorySelectProps<T>) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn('min-h-[3.5rem] py-2', className)}>
        <div className="flex w-full items-center">
          {selectedOption ? (
            <div
              className={cn(
                'flex w-full',
                selectedOption.icon ? 'gap-3' : 'gap-0',
              )}
            >
              {selectedOption.icon && (
                <selectedOption.icon
                  className={cn(
                    'mt-0.5 h-4 w-4 flex-shrink-0',
                    selectedOption.color && `text-${selectedOption.color}`,
                  )}
                />
              )}
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm leading-none font-medium">
                  {selectedOption.label}
                </span>
                <span className="text-muted-foreground text-xs leading-tight">
                  {selectedOption.description}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem
              key={option.value}
              value={option.value}
              className="min-h-[3.5rem] items-start py-2"
            >
              <div
                className={cn(
                  'flex w-full',
                  Icon ? 'items-start gap-3' : 'items-center gap-0',
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      'mt-0.5 h-4 w-4 flex-shrink-0',
                      option.color && `text-${option.color}`,
                    )}
                  />
                )}
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm leading-none font-medium">
                    {option.label}
                  </span>
                  <span className="text-muted-foreground text-xs leading-tight">
                    {option.description}
                  </span>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

interface SimpleStorySelectProps<T = string> {
  value: T;
  onValueChange: (value: T) => void;
  options: Array<{
    value: T;
    label: string;
    description: string;
  }>;
  placeholder?: string;
  className?: string;
}

export function SimpleStorySelect<T extends string = string>({
  value,
  onValueChange,
  options,
  placeholder,
  className,
}: SimpleStorySelectProps<T>) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn('min-h-[3rem] py-2', className)}>
        <div className="flex w-full items-center">
          {selectedOption ? (
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm leading-none font-medium">
                {selectedOption.label}
              </span>

              <span className="text-muted-foreground text-xs leading-tight">
                {selectedOption.description}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
      </SelectTrigger>

      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="min-h-[3rem] items-start py-2"
          >
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm leading-none font-medium">
                {option.label}
              </span>

              <span className="text-muted-foreground text-xs leading-tight">
                {option.description}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
