import Link from 'next/link';

import { Checkbox } from '@portal/ui/checkbox';
import { FormControl, FormField, FormItem, FormMessage } from '@portal/ui/form';
import { Trans } from '@portal/ui/trans';

export function TermsAndConditionsFormField(
  props: {
    name?: string;
  } = {},
) {
  return (
    <FormField
      name={props.name ?? 'termsAccepted'}
      render={({ field }) => {
        return (
          <FormItem>
            <FormControl>
              <label className={'flex items-start gap-x-3 py-2'}>
                <Checkbox required name={field.name} />

                <div className={'text-xs'}>
                  <Trans
                    i18nKey={'auth:acceptTermsAndConditions'}
                    components={{
                      TermsOfServiceLink: (
                        <Link
                          target={'_blank'}
                          className={'underline'}
                          href={'/terms-of-service'}
                        >
                          <Trans i18nKey={'auth:termsOfService'} />
                        </Link>
                      ),
                      PrivacyPolicyLink: (
                        <Link
                          target={'_blank'}
                          className={'underline'}
                          href={'/privacy-policy'}
                        >
                          <Trans i18nKey={'auth:privacyPolicy'} />
                        </Link>
                      ),
                    }}
                  />
                </div>
              </label>
            </FormControl>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
