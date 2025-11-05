'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { envVariables } from '@/app/variables/lib/env-variables-model';
import { updateEnvironmentVariableAction } from '@/app/variables/lib/server-actions';
import { EnvModeSelector } from '@/components/env-mode-selector';
import {
  ChevronsUpDownIcon,
  Copy,
  CopyIcon,
  Eye,
  EyeOff,
  EyeOffIcon,
  InfoIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Subject, debounceTime } from 'rxjs';

import { Alert, AlertDescription, AlertTitle } from '@portal/ui/alert';
import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@portal/ui/dropdown-menu';
import { Heading } from '@portal/ui/heading';
import { If } from '@portal/ui/if';
import { Input } from '@portal/ui/input';
import { toast } from '@portal/ui/sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@portal/ui/tooltip';
import { cn } from '@portal/ui/utils';

import { AppEnvState, EnvVariableState } from '../lib/types';
import { DynamicFormInput } from './dynamic-form-input';

export function AppEnvironmentVariablesManager({
  state,
}: React.PropsWithChildren<{
  state: AppEnvState;
}>) {
  return <EnvList appState={state} />;
}

function EnvListDisplay({
  groups,
  className,
  hideSecret = false,
}: {
  groups: Array<{
    category: string;
    variables: Array<EnvVariableState>;
  }>;

  className: string;
  hideSecret?: boolean;
}) {
  return (
    <div className={cn(className)}>
      <div
        className={
          'text-muted-foreground relative flex h-full flex-col rounded-lg font-mono text-xs'
        }
      >
        <div className="bg-muted/50 sticky top-0 flex flex-col gap-y-1 rounded-lg p-4">
          <div className={'sticky top-0 h-full overflow-auto pb-16 break-all'}>
            {groups.map((group) => (
              <div className="mb-4" key={group.category}>
                <span># {group.category}</span>

                {group.variables.map((variable) => {
                  const model = envVariables.find(
                    (item) => item.name === variable.key,
                  );

                  const isSecret = model?.secret;
                  const value =
                    isSecret && hideSecret
                      ? '••••••••'
                      : variable.effectiveValue;

                  return (
                    <Link
                      href={`#var_${variable.key.toLowerCase()}`}
                      className={cn('block transition-all hover:underline', {
                        ['text-orange-500']: variable.isOverridden,
                        ['text-destructive']: !variable.validation.success,
                        ['opacity-20']: !variable.isVisible,
                      })}
                      key={variable.key}
                    >
                      <span>{variable.key}</span>: {value}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EnvList({ appState }: { appState: AppEnvState }) {
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const searchParams = useSearchParams();

  const showSecretVars = searchParams.get('secret') === 'true';
  const showPublicVars = searchParams.get('public') === 'true';
  const showPrivateVars = searchParams.get('private') === 'true';
  const showOverriddenVars = searchParams.get('overridden') === 'true';
  const showInvalidVars = searchParams.get('invalid') === 'true';
  const showDeprecatedVars = searchParams.get('deprecated') === 'true';

  const toggleShowValue = (key: string) => {
    setShowValues((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderValue = (value: string, isVisible: boolean) => {
    if (!isVisible) {
      if (!value) {
        return `(empty)`;
      }

      return '••••••••';
    }

    return value;
  };

  const allVariables = getEffectiveVariablesValue(appState);

  const subject$ = useMemo(
    () =>
      new Subject<{
        name: string;
        value: string;
      }>(),
    [],
  );

  useEffect(() => {
    const subscription = subject$
      .pipe(debounceTime(1000))
      .subscribe((props) => {
        updateEnvironmentVariableAction({
          ...props,
          mode: appState.mode,
        })
          .then((result) => {
            toast.success(result.message);
          })
          .catch((err) => {
            toast.error(`Failed to update ${props.name}: ${err.message}`);
          });
      });

    return () => {
      return subscription.unsubscribe();
    };
  }, [subject$]);

  const onValueChanged = useCallback(
    (props: { value: string; name: string }) => {
      subject$.next({
        name: props.name,
        value: props.value,
      });
    },
    [subject$],
  );

  const renderVariable = (varState: EnvVariableState) => {
    const model = envVariables.find(
      (variable) => variable.name === varState.key,
    );

    const isClientBundledValue = varState.key.startsWith('NEXT_PUBLIC_');
    const isValueVisible = showValues[varState.key] ?? !model?.secret;

    return (
      <div
        id={`var_${varState.key.toLowerCase()}`}
        key={varState.key}
        className={cn('animate-in fade-in py-6 transition-all', {
          hidden: !varState.isVisible,
        })}
      >
        <div className={'flex flex-col space-y-2'}>
          <div className="flex items-start justify-between">
            <div className="flex max-w-full flex-1 flex-col">
              <div className="flex items-center gap-4">
                <span
                  className={cn('font-mono text-sm font-semibold', {
                    'text-orange-500': varState.isOverridden,
                    'text-destructive': !varState.validation.success,
                  })}
                >
                  {varState.key}
                </span>

                {model?.required && <Badge variant="outline">Required</Badge>}

                {varState.effectiveSource === 'MISSING' && (
                  <Badge
                    variant={
                      // Show destructive if required OR if contextual validation dependencies are not met
                      model?.required ||
                      model?.contextualValidation?.dependencies.some((dep) => {
                        const dependencyValue =
                          allVariables[dep.variable] ?? '';

                        const shouldValidate = dep.condition(
                          dependencyValue,
                          allVariables,
                        );

                        if (!shouldValidate) {
                          return false;
                        }

                        return !model.contextualValidation!.validate({
                          value: varState.effectiveValue,
                          variables: allVariables,
                          mode: appState.mode,
                        }).success;
                      })
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    Missing
                  </Badge>
                )}

                {varState.isOverridden && (
                  <Badge variant="warning">Overridden</Badge>
                )}
              </div>

              <If condition={model}>
                {(model) => (
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-muted-foreground text-xs font-normal">
                      {model.description}
                    </span>
                  </div>
                )}
              </If>

              <div className="mt-2 flex items-center gap-2">
                <If
                  condition={isValueVisible || !varState.effectiveValue}
                  fallback={
                    <div className="max-w-auto bg-muted text-muted-foreground flex h-9 w-auto flex-1 items-center overflow-x-auto rounded border px-2 py-2 font-mono text-xs">
                      {renderValue(varState.effectiveValue, isValueVisible)}
                    </div>
                  }
                >
                  <DynamicFormInput
                    type={model?.type ?? 'string'}
                    name={varState.key}
                    value={varState.effectiveValue}
                    onChange={onValueChanged}
                    placeholder={`Set a value for ${varState.key}`}
                    enumValues={model?.values}
                    className="text-xs"
                  />
                </If>

                <If condition={model?.secret}>
                  <Button
                    variant="ghost"
                    size={'icon'}
                    onClick={() => toggleShowValue(varState.key)}
                  >
                    {isValueVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </If>

                <If condition={model && model.type !== 'boolean'}>
                  <Button
                    variant="ghost"
                    onClick={() => copyToClipboard(varState.effectiveValue)}
                    size={'icon'}
                  >
                    <Copy size={16} />
                  </Button>
                </If>
              </div>

              <If condition={model?.hint}>
                {(hint) => (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-normal">
                      {hint}
                    </span>
                  </div>
                )}
              </If>
            </div>
          </div>

          <div className="mt-2 flex gap-x-2">
            <Badge
              variant="outline"
              className={cn({
                'text-orange-500': !isClientBundledValue,
                'text-green-500': isClientBundledValue,
              })}
            >
              {isClientBundledValue ? `Public variable` : `Private variable`}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="ml-2 h-3 w-3" />
                  </TooltipTrigger>

                  <TooltipContent>
                    {isClientBundledValue
                      ? `This variable will be bundled into the client side. If this is a private variable, do not use "NEXT_PUBLIC".`
                      : `This variable is private and will not be bundled client side, so you cannot access it from React components rendered client side`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Badge>

            <If condition={model?.secret}>
              <Badge variant="outline" className={'text-destructive'}>
                Secret Variable
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="ml-2 h-3 w-3" />
                    </TooltipTrigger>

                    <TooltipContent>
                      This is a secret key. Keep it safe!
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Badge>
            </If>

            <If condition={varState.effectiveSource !== 'MISSING'}>
              <Badge
                variant={'outline'}
                className={cn({
                  'text-destructive':
                    varState.effectiveSource === '.env.production',
                })}
              >
                {varState.effectiveSource}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="ml-2 h-3 w-3" />
                    </TooltipTrigger>

                    <TooltipContent>
                      {varState.effectiveSource === '.env.local'
                        ? `These variables are specific to this machine and are not committed`
                        : varState.effectiveSource === '.env.development'
                          ? `These variables are only being used during development`
                          : varState.effectiveSource === '.env'
                            ? `These variables are shared under all modes`
                            : `These variables are only used in production mode`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Badge>
            </If>

            <If condition={varState.isOverridden}>
              <Badge variant="warning">
                Overridden in {varState.effectiveSource}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="ml-2 h-3 w-3" />
                    </TooltipTrigger>

                    <TooltipContent>
                      This variable was overridden by a variable in{' '}
                      {varState.effectiveSource}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Badge>
            </If>

            <If condition={!varState.validation.success}>
              <Badge variant="destructive">
                Invalid Value
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="ml-2 h-3 w-3" />
                    </TooltipTrigger>

                    <TooltipContent>
                      This variable has an invalid value. Drop down to view the
                      errors.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Badge>
            </If>

            <If condition={model?.deprecated}>
              {(deprecated) => (
                <Badge variant="warning">
                  Deprecated
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <TriangleAlertIcon className="ml-2 h-3 w-3" />
                      </TooltipTrigger>

                      <TooltipContent>
                        <div className="space-y-2">
                          <div className="font-medium">
                            This variable is deprecated
                          </div>
                          <div className="text-sm">
                            <strong>Reason:</strong> {deprecated.reason}
                          </div>
                          {deprecated.alternative && (
                            <div className="text-sm">
                              <strong>Use instead:</strong>{' '}
                              {deprecated.alternative}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Badge>
              )}
            </If>
          </div>
        </div>

        <div className="flex w-full flex-col gap-y-2 py-4">
          <If condition={!varState.validation.success}>
            <div className={'flex flex-col space-y-2'}>
              <Alert variant="destructive">
                <AlertTitle>
                  {varState.effectiveSource === 'MISSING'
                    ? `The variable ${varState.key} is required but missing`
                    : `The value for ${varState.key} is invalid`}
                </AlertTitle>

                <AlertDescription>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      {varState.validation.error?.issues.map((issue, index) => (
                        <div key={index} className="text-sm">
                          • {issue}
                        </div>
                      ))}
                    </div>

                    {/* Display dependency information if available */}
                    {model?.contextualValidation?.dependencies && (
                      <div className="mt-4 space-y-1">
                        <div className="font-medium">Dependencies:</div>

                        {model.contextualValidation.dependencies.map(
                          (dep, index) => (
                            <div key={index} className="text-sm">
                              • Requires valid {dep.variable.toUpperCase()} when{' '}
                              {dep.message}
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </If>

          <If condition={varState.definitions.length > 1}>
            <div className={'flex flex-col space-y-2'}>
              <Heading level={6} className="text-sm font-medium">
                Override Chain
              </Heading>

              <div className="w-full space-y-2">
                {varState.definitions.map((def) => (
                  <div
                    key={`${def.key}-${def.source}`}
                    className="flex items-center gap-2"
                  >
                    <Badge
                      variant={'outline'}
                      className={cn({
                        'text-destructive': def.source === '.env.production',
                      })}
                    >
                      {def.source}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </If>
        </div>
      </div>
    );
  };

  const filterVariable = (varState: EnvVariableState) => {
    const model = envVariables.find(
      (variable) => variable.name === varState.key,
    );

    if (
      !search &&
      !showSecretVars &&
      !showPublicVars &&
      !showPrivateVars &&
      !showInvalidVars &&
      !showOverriddenVars &&
      !showDeprecatedVars
    ) {
      return true;
    }

    const isSecret = model?.secret ?? false;
    const isPublic = varState.key.startsWith('NEXT_PUBLIC_');
    const isPrivate = !isPublic;

    const isInSearch = search
      ? varState.key.toLowerCase().includes(search.toLowerCase())
      : true;

    if (showPublicVars && isInSearch) {
      return isPublic;
    }

    if (showSecretVars && isInSearch) {
      return isSecret;
    }

    if (showPrivateVars && isInSearch) {
      return isPrivate;
    }

    if (showOverriddenVars && isInSearch) {
      return varState.isOverridden;
    }

    if (showInvalidVars && isInSearch) {
      return !varState.validation.success;
    }

    if (showDeprecatedVars && isInSearch) {
      return !!model?.deprecated;
    }

    return isInSearch;
  };

  // Update groups to use allVarsWithValidation instead of appState.variables
  const groups = getGroups(appState, filterVariable);

  return (
    <div className="flex h-full flex-1 flex-col gap-y-4">
      <div className="flex items-center">
        <div className="flex w-full space-x-2 py-0.5">
          <div>
            <EnvModeSelector mode={appState.mode} />
          </div>

          <div>
            <FilterSwitcher
              filters={{
                secret: showSecretVars,
                public: showPublicVars,
                overridden: showOverriddenVars,
                private: showPrivateVars,
                invalid: showInvalidVars,
                deprecated: showDeprecatedVars,
              }}
            />
          </div>

          <Input
            className={'w-full'}
            placeholder="Search variables"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-y-4 overflow-hidden">
        <Summary appState={appState} />

        <div className="flex w-full flex-1 space-x-4 overflow-hidden">
          <div className="flex w-6/12 flex-1 flex-col overflow-y-auto">
            <div className="flex flex-col gap-y-4">
              {groups.map((group) => {
                const visibleVariables = group.variables.filter(
                  (item) => item.isVisible,
                );

                if (visibleVariables.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={group.category}
                    className="flex flex-col rounded-lg border p-4"
                  >
                    <div>
                      <span className={'text-lg font-bold'}>
                        {group.category}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      {group.variables.map((item) => {
                        return (
                          <Fragment key={item.key}>
                            {renderVariable(item)}
                          </Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <If condition={groups.length === 0}>
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-4 py-16">
                  <div className="text-muted-foreground text-sm">
                    No variables found
                  </div>
                </div>
              </If>
            </div>
          </div>

          <EnvListDisplay
            className="sticky top-0 w-6/12 overflow-y-auto"
            groups={groups}
          />
        </div>
      </div>
    </div>
  );
}

function FilterSwitcher(props: {
  filters: {
    secret: boolean;
    public: boolean;
    overridden: boolean;
    private: boolean;
    invalid: boolean;
    deprecated: boolean;
  };
}) {
  const secretVars = props.filters.secret;
  const publicVars = props.filters.public;
  const overriddenVars = props.filters.overridden;
  const privateVars = props.filters.private;
  const invalidVars = props.filters.invalid;
  const deprecatedVars = props.filters.deprecated;

  const handleFilterChange = useUpdateFilteredVariables();

  const buttonLabel = () => {
    const filters = [];

    if (secretVars) filters.push('Secret');
    if (publicVars) filters.push('Public');
    if (overriddenVars) filters.push('Overridden');
    if (privateVars) filters.push('Private');
    if (invalidVars) filters.push('Invalid');
    if (deprecatedVars) filters.push('Deprecated');

    if (filters.length === 0) return 'Filter variables';

    return filters.join(', ');
  };

  const allSelected =
    !secretVars &&
    !publicVars &&
    !overriddenVars &&
    !invalidVars &&
    !deprecatedVars;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="font-normal">
          {buttonLabel()}

          <ChevronsUpDownIcon className="text-muted-foreground ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={allSelected}
          onCheckedChange={() => {
            handleFilterChange('all', true);
          }}
        >
          All
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={secretVars}
          onCheckedChange={() => {
            handleFilterChange('secret', !secretVars);
          }}
        >
          Secret
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={privateVars}
          onCheckedChange={() => {
            handleFilterChange('private', !privateVars);
          }}
        >
          Private
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={publicVars}
          onCheckedChange={() => {
            handleFilterChange('public', !publicVars);
          }}
        >
          Public
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={invalidVars}
          onCheckedChange={() => {
            handleFilterChange('invalid', !invalidVars);
          }}
        >
          Invalid
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={overriddenVars}
          onCheckedChange={() => {
            handleFilterChange('overridden', !overriddenVars);
          }}
        >
          Overridden
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={deprecatedVars}
          onCheckedChange={() => {
            handleFilterChange('deprecated', !deprecatedVars);
          }}
        >
          Deprecated
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Summary({ appState }: { appState: AppEnvState }) {
  const varsArray = Object.values(appState.variables);
  const overridden = varsArray.filter((variable) => variable.isOverridden);
  const handleFilterChange = useUpdateFilteredVariables();

  // Find all variables with errors (including missing required and contextual validation)
  const variablesWithErrors = varsArray.filter((variable) => {
    return !variable.validation.success;
  });

  // Find deprecated variables
  const deprecatedVariables = varsArray.filter((variable) => {
    const model = envVariables.find((env) => env.name === variable.key);
    return !!model?.deprecated;
  });

  const validVariables = varsArray.length - variablesWithErrors.length;

  return (
    <div className="flex justify-between space-x-4">
      <div className="flex items-center gap-x-2">
        <Badge variant={'outline'} className={'text-green-500'}>
          {validVariables} Valid
        </Badge>

        <Badge
          variant={'outline'}
          className={cn({
            'text-destructive': variablesWithErrors.length > 0,
            'text-green-500': variablesWithErrors.length === 0,
          })}
        >
          {variablesWithErrors.length} Invalid
        </Badge>

        <If condition={overridden.length > 0}>
          <Badge
            variant={'outline'}
            className={cn({ 'text-orange-500': overridden.length > 0 })}
          >
            {overridden.length} Overridden
          </Badge>
        </If>

        <If condition={deprecatedVariables.length > 0}>
          <Badge
            variant={'outline'}
            className={cn({ 'text-amber-500': deprecatedVariables.length > 0 })}
          >
            {deprecatedVariables.length} Deprecated
          </Badge>
        </If>
      </div>

      <div className={'flex items-center gap-x-2'}>
        <If condition={variablesWithErrors.length > 0}>
          <Button
            size={'sm'}
            variant={'outline'}
            onClick={() => handleFilterChange('invalid', true, true)}
          >
            <EyeOffIcon className="mr-2 h-3 w-3" />
            Display Invalid only
          </Button>
        </If>

        <If condition={deprecatedVariables.length > 0}>
          <Button
            size={'sm'}
            variant={'outline'}
            onClick={() => handleFilterChange('deprecated', true, true)}
          >
            <TriangleAlertIcon className="mr-2 h-3 w-3" />
            Display Deprecated only
          </Button>
        </If>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={'sm'}
                onClick={() => {
                  let data = '';

                  const groups = getGroups(appState, () => true);

                  groups.forEach((group) => {
                    data += `# ${group.category}\n`;

                    group.variables.forEach((variable) => {
                      data += `${variable.key}=${variable.effectiveValue}\n`;
                    });

                    data += '\n';
                  });

                  const promise = copyToClipboard(data);

                  toast.promise(promise, {
                    loading: 'Copying environment variables...',
                    success: 'Environment variables copied to clipboard.',
                    error: 'Failed to copy environment variables to clipboard',
                  });
                }}
              >
                <CopyIcon className={'mr-2 h-4 w-4'} />
                <span>Copy env file to clipboard</span>
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              Copy environment variables to clipboard. You can place it in your
              hosting provider to set up the full environment.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

function getEffectiveVariablesValue(
  appState: AppEnvState,
): Record<string, string> {
  const varsArray = Object.values(appState.variables);

  return varsArray.reduce(
    (acc, variable) => ({
      ...acc,
      [variable.key]: variable.effectiveValue,
    }),
    {},
  );
}

function useUpdateFilteredVariables() {
  const router = useRouter();

  const handleFilterChange = (key: string, value: boolean, reset = false) => {
    const searchParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    const resetAll = () => {
      searchParams.delete('secret');
      searchParams.delete('public');
      searchParams.delete('overridden');
      searchParams.delete('private');
      searchParams.delete('invalid');
      searchParams.delete('deprecated');
    };

    if (reset) {
      resetAll();
    }

    if (key === 'all' && value) {
      resetAll();
    } else {
      if (!value) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, 'true');
      }
    }

    router.push(`${path}?${searchParams.toString()}`);
  };

  return useCallback(handleFilterChange, [router]);
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

function getGroups(
  appState: AppEnvState,
  filterVariable: (variable: EnvVariableState) => boolean,
) {
  return Object.values(appState.variables).reduce(
    (acc, variable) => {
      const group = acc.find((group) => group.category === variable.category);
      variable.isVisible = filterVariable(variable);

      if (!group) {
        acc.push({
          category: variable.category,
          variables: [variable],
        });
      } else {
        group.variables.push(variable);
      }

      return acc;
    },
    [] as Array<{ category: string; variables: Array<EnvVariableState> }>,
  );
}
