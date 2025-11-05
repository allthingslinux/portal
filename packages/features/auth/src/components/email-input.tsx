'use client';

import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@portal/ui/input-group';

export function EmailInput(props: React.ComponentProps<'input'>) {
  const { t } = useTranslation('auth');

  return (
    <InputGroup className="dark:bg-background">
      <InputGroupAddon>
        <Mail className="h-4 w-4" />
      </InputGroupAddon>

      <InputGroupInput
        data-test={'email-input'}
        required
        type="email"
        placeholder={t('emailPlaceholder')}
        {...props}
      />
    </InputGroup>
  );
}
