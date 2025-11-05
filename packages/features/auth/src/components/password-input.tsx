'use client';

import { useState } from 'react';

import { Eye, EyeOff, Lock } from 'lucide-react';

import { Button } from '@portal/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@portal/ui/input-group';

export function PasswordInput(props: React.ComponentProps<'input'>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup className="dark:bg-background">
      <InputGroupAddon>
        <Lock className="h-4 w-4" />
      </InputGroupAddon>

      <InputGroupInput
        data-test="password-input"
        type={showPassword ? 'text' : 'password'}
        placeholder={'************'}
        {...props}
      />

      <InputGroupAddon align="inline-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}
