'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ChevronDownIcon, Loader2Icon } from 'lucide-react';
import { Subject, debounceTime } from 'rxjs';

import { Button } from '@portal/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@portal/ui/dropdown-menu';
import { If } from '@portal/ui/if';
import { Input } from '@portal/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { toast } from '@portal/ui/sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@portal/ui/table';
import { cn } from '@portal/ui/utils';

import {
  translateWithAIAction,
  updateTranslationAction,
} from '../lib/server-actions';
import type { TranslationData, Translations } from '../lib/translations-loader';

function flattenTranslations(
  obj: TranslationData,
  prefix = '',
  result: Record<string, string> = {},
) {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      result[newKey] = value;
    } else {
      flattenTranslations(value, newKey, result);
    }
  }

  return result;
}

type FlattenedTranslations = Record<string, Record<string, string>>;

export function TranslationsComparison({
  translations,
}: {
  translations: Translations;
}) {
  const [search, setSearch] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Create RxJS Subject for handling translation updates
  const subject$ = useMemo(
    () =>
      new Subject<{
        locale: string;
        namespace: string;
        key: string;
        value: string;
      }>(),
    [],
  );

  const locales = Object.keys(translations);
  const baseLocale = locales[0]!;
  const namespaces = Object.keys(translations[baseLocale] || {});

  const [selectedLocales, setSelectedLocales] = useState<Set<string>>(
    new Set(locales),
  );

  // Flatten translations for the selected namespace
  const flattenedTranslations: FlattenedTranslations = {};

  const [selectedNamespace, setSelectedNamespace] = useState(
    namespaces[0] as string,
  );

  for (const locale of locales) {
    const namespaceData = translations[locale]?.[selectedNamespace];

    if (namespaceData) {
      flattenedTranslations[locale] = flattenTranslations(namespaceData);
    } else {
      flattenedTranslations[locale] = {};
    }
  }

  // Get all unique keys across all translations
  const allKeys = Array.from(
    new Set(
      Object.values(flattenedTranslations).flatMap((data) => Object.keys(data)),
    ),
  ).sort();

  const filteredKeys = allKeys.filter((key) =>
    key.toLowerCase().includes(search.toLowerCase()),
  );

  const visibleLocales = locales.filter((locale) =>
    selectedLocales.has(locale),
  );

  const toggleLocale = (locale: string) => {
    const newSelectedLocales = new Set(selectedLocales);

    if (newSelectedLocales.has(locale)) {
      if (newSelectedLocales.size > 1) {
        newSelectedLocales.delete(locale);
      }
    } else {
      newSelectedLocales.add(locale);
    }

    setSelectedLocales(newSelectedLocales);
  };

  const handleTranslateWithAI = useCallback(async () => {
    try {
      setIsTranslating(true);

      // Get missing translations for the selected namespace
      const missingTranslations: Record<string, string> = {};
      const baseTranslations = flattenedTranslations[baseLocale] ?? {};

      for (const locale of visibleLocales) {
        if (locale === baseLocale) continue;

        const localeTranslations = flattenedTranslations[locale] ?? {};

        for (const [key, value] of Object.entries(baseTranslations)) {
          if (!localeTranslations[key]) {
            missingTranslations[key] = value;
          }
        }

        if (Object.keys(missingTranslations).length > 0) {
          await translateWithAIAction({
            sourceLocale: baseLocale,
            targetLocale: locale,
            namespace: selectedNamespace,
            translations: missingTranslations,
          });

          toast.success(`Translated missing strings to ${locale}`);
        }
      }
    } catch (error) {
      toast.error('Failed to translate: ' + (error as Error).message);
    } finally {
      setIsTranslating(false);
    }
  }, [flattenedTranslations, baseLocale, visibleLocales, selectedNamespace]);

  // Calculate if there are any missing translations
  const hasMissingTranslations = useMemo(() => {
    if (!flattenedTranslations || !baseLocale || !visibleLocales) return false;

    const baseTranslations = flattenedTranslations[baseLocale] ?? {};

    return visibleLocales.some((locale) => {
      if (locale === baseLocale) return false;

      const localeTranslations = flattenedTranslations[locale] ?? {};

      return Object.keys(baseTranslations).some(
        (key) => !localeTranslations[key],
      );
    });
  }, [flattenedTranslations, baseLocale, visibleLocales]);

  // Set up subscription to handle debounced updates
  useEffect(() => {
    const subscription = subject$.pipe(debounceTime(500)).subscribe((props) => {
      updateTranslationAction(props)
        .then(() => {
          toast.success(`Updated translation for ${props.key}`);
        })
        .catch((err) => {
          toast.error(`Failed to update translation: ${err.message}`);
        });
    });

    return () => subscription.unsubscribe();
  }, [subject$]);

  if (locales.length === 0) {
    return <div>No translations found</div>;
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="flex w-full items-center">
        <div className="flex w-full items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <Input
              type="search"
              placeholder="Search translations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />

            <If condition={locales.length > 1}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Select Languages
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-[200px]">
                  {locales.map((locale) => (
                    <DropdownMenuCheckboxItem
                      key={locale}
                      checked={selectedLocales.has(locale)}
                      onCheckedChange={() => toggleLocale(locale)}
                      disabled={
                        selectedLocales.size === 1 &&
                        selectedLocales.has(locale)
                      }
                    >
                      {locale}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </If>

            <Select
              value={selectedNamespace}
              onValueChange={setSelectedNamespace}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select namespace" />
              </SelectTrigger>

              <SelectContent>
                {namespaces.map((namespace: string) => (
                  <SelectItem key={namespace} value={namespace}>
                    {namespace}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button
              onClick={handleTranslateWithAI}
              disabled={isTranslating || !hasMissingTranslations}
            >
              {isTranslating ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                'Translate missing with AI'
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              {visibleLocales.map((locale) => (
                <TableHead key={locale}>{locale}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredKeys.map((key) => (
              <TableRow key={key}>
                <TableCell width={350} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span>{key}</span>
                  </div>
                </TableCell>

                {visibleLocales.map((locale) => {
                  const translations = flattenedTranslations[locale] ?? {};

                  const baseTranslations =
                    flattenedTranslations[baseLocale] ?? {};

                  const value = translations[key];
                  const baseValue = baseTranslations[key];
                  const isMissing = !value;
                  const isDifferent = value !== baseValue;

                  return (
                    <TableCell
                      key={locale}
                      className={cn({
                        'bg-destructive/10': isMissing,
                        'bg-warning/10': !isMissing && isDifferent,
                      })}
                    >
                      <div className="flex items-center justify-between">
                        <Input
                          defaultValue={value || ''}
                          onChange={(e) => {
                            const value = e.target.value.trim();

                            if (value === '') {
                              toast.error('Translation cannot be empty');

                              return;
                            }

                            if (value === baseValue) {
                              toast.info('Translation is the same as base');

                              return;
                            }

                            subject$.next({
                              locale,
                              namespace: selectedNamespace,
                              key,
                              value,
                            });
                          }}
                          className="w-full font-mono text-sm"
                          placeholder={isMissing ? 'Missing translation' : ''}
                        />
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
