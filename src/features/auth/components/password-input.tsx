"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";

export function PasswordInput(props: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup className="dark:bg-background">
      <InputGroupAddon>
        <Lock className="h-4 w-4" />
      </InputGroupAddon>

      <InputGroupInput
        data-test="password-input"
        placeholder={"************"}
        type={showPassword ? "text" : "password"}
        {...props}
      />

      <InputGroupAddon align="inline-end">
        <Button
          onClick={() => setShowPassword(!showPassword)}
          size="sm"
          type="button"
          variant="ghost"
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
