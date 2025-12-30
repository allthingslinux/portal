"use client";

import { ThemeProvider } from "next-themes";
import { useMemo } from "react";
import { AnalyticsProvider } from "~/components/analytics-provider";
import { AuthProvider } from "~/components/auth-provider";
import { If } from "~/components/if";
import { VersionUpdater } from "~/components/version-updater";
import { I18nProvider } from "~/core/i18n/i18n-provider";
import { MonitoringProvider } from "~/core/monitoring/api/components/provider";
import appConfig from "~/lib/config/app.config";
import featuresFlagConfig from "~/lib/config/feature-flags.config";
import { AppEventsProvider } from "~/shared/events";
import { i18nResolver } from "~/shared/lib/i18n/i18n.resolver";
import { getI18nSettings } from "~/shared/lib/i18n/i18n.settings";

import { ReactQueryProvider } from "./react-query-provider";

type RootProvidersProps = React.PropsWithChildren<{
  lang?: string;
  theme?: string;
  nonce?: string;
}>;

export function RootProviders({
  lang,
  theme = appConfig.theme,
  nonce,
  children,
}: RootProvidersProps) {
  const i18nSettings = useMemo(() => getI18nSettings(lang), [lang]);

  return (
    <MonitoringProvider>
      <AppEventsProvider>
        <AnalyticsProvider>
          <ReactQueryProvider>
            <I18nProvider resolver={i18nResolver} settings={i18nSettings}>
              <AuthProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme={theme}
                  disableTransitionOnChange
                  enableColorScheme={false}
                  enableSystem
                  nonce={nonce}
                >
                  {children}
                </ThemeProvider>
              </AuthProvider>

              <If condition={featuresFlagConfig.enableVersionUpdater}>
                <VersionUpdater />
              </If>
            </I18nProvider>
          </ReactQueryProvider>
        </AnalyticsProvider>
      </AppEventsProvider>
    </MonitoringProvider>
  );
}
