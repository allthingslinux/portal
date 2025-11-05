'use client';

import { useRouter } from 'next/navigation';

import { EnvMode } from '@/app/variables/lib/types';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';

export function EnvModeSelector({ mode }: { mode: EnvMode }) {
  const router = useRouter();

  const handleModeChange = (value: EnvMode) => {
    const searchParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    searchParams.set('mode', value);

    router.push(`${path}?${searchParams.toString()}`);
  };

  return (
    <div>
      <Select
        name={'mode'}
        defaultValue={mode}
        onValueChange={handleModeChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Mode" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="development">Development</SelectItem>
          <SelectItem value="production">Production</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
