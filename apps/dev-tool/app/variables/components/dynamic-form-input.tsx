import { useCallback } from 'react';

import { Input } from '@portal/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Switch } from '@portal/ui/switch';
import { Textarea } from '@portal/ui/textarea';

type ModelType =
  | 'string'
  | 'longString'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'url'
  | 'email';

interface DynamicFormInputProps {
  type: ModelType;
  value: string;
  name: string;
  onChange: (props: { name: string; value: string }) => void;
  placeholder?: string;
  enumValues?: Array<string | null>;
  className?: string;
}

export function DynamicFormInput({
  type,
  value,
  name,
  onChange,
  placeholder,
  enumValues = [],
  className,
}: DynamicFormInputProps) {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        name,
        value: e.target.value,
      });
    },
    [name, onChange],
  );

  const handleSwitchChange = useCallback(
    (checked: boolean) => {
      onChange({
        name,
        value: checked ? 'true' : 'false',
      });
    },
    [name, onChange],
  );

  const handleSelectChange = useCallback(
    (value: string) => {
      onChange({
        name,
        value: value === '' ? 'none' : value,
      });
    },
    [name, onChange],
  );

  switch (type) {
    case 'longString':
      return (
        <Textarea
          defaultValue={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          defaultValue={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
        />
      );

    case 'boolean':
      return (
        <label className="flex items-center gap-x-2">
          <Switch
            checked={value === 'true'}
            onCheckedChange={handleSwitchChange}
          />

          <span className={'text-sm uppercase'}>
            {value === 'true' ? 'True' : 'False'}
          </span>
        </label>
      );

    case 'url':
      return (
        <Input
          type="url"
          defaultValue={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
        />
      );

    case 'email':
      return (
        <Input
          type="email"
          defaultValue={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
        />
      );

    case 'enum':
      return (
        <Select
          value={value === 'none' ? '' : value}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className={className}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent>
            {enumValues.map((enumValue) => (
              <SelectItem key={enumValue} value={enumValue as string}>
                {enumValue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    default:
      return (
        <Input
          type="text"
          defaultValue={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
        />
      );
  }
}
