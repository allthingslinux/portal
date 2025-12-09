import Link from "next/link";
import { Trans } from "~/components/makerkit/trans";
import { Checkbox } from "~/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";

export function TermsAndConditionsFormField(props: { name?: string } = {}) {
  return (
    <FormField
      name={props.name ?? "termsAccepted"}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            {(() => {
              const checkboxId = `${field.name}-checkbox`;
              return (
                <label
                  className={"flex items-start gap-x-3 py-2"}
                  htmlFor={checkboxId}
                >
                  <Checkbox id={checkboxId} name={field.name} required />

                  <div className={"text-xs"}>
                    <Trans
                      components={{
                        TermsOfServiceLink: (
                          <Link
                            className={"underline"}
                            href={"/terms-of-service"}
                            target={"_blank"}
                          >
                            <Trans i18nKey={"auth:termsOfService"} />
                          </Link>
                        ),
                        PrivacyPolicyLink: (
                          <Link
                            className={"underline"}
                            href={"/privacy-policy"}
                            target={"_blank"}
                          >
                            <Trans i18nKey={"auth:privacyPolicy"} />
                          </Link>
                        ),
                      }}
                      i18nKey={"auth:acceptTermsAndConditions"}
                    />
                  </div>
                </label>
              );
            })()}
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
