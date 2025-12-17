import { ArrowRightIcon, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  CtaButton,
  EcosystemShowcase,
  FeatureCard,
  FeatureGrid,
  FeatureShowcase,
  FeatureShowcaseIconContainer,
  Hero,
  Pill,
  PillActionButton,
} from "~/components/portal/marketing";
import { Trans } from "~/components/portal/trans";

import { withI18n } from "~/shared/lib/i18n/with-i18n";

function Home() {
  return (
    <div className={"mt-4 flex flex-col space-y-24 py-14"}>
      <div className={"mx-auto"}>
        <Hero
          cta={<MainCallToActionButton />}
          image={
            <Image
              alt={"App Image"}
              className={
                "w-full rounded-lg border border-gray-200 dark:border-primary/10"
              }
              height={2222}
              priority
              src={"/images/dashboard.webp"}
              width={3558}
            />
          }
          pill={
            <Pill label={"New"}>
              <span>The SaaS Starter Kit for ambitious developers</span>
              <PillActionButton asChild>
                <Link href={"/auth/sign-up"}>
                  <ArrowRightIcon className={"h-4 w-4"} />
                </Link>
              </PillActionButton>
            </Pill>
          }
          subtitle={
            <span>
              Portal gives you a production-ready boilerplate to build your SaaS
              faster than ever before. Get started in minutes.
            </span>
          }
          title={
            <span className="text-secondary-foreground">
              <span>Ship a SaaS faster than ever.</span>
            </span>
          }
        />
      </div>

      <div className={"container mx-auto"}>
        <div className={"py-4 xl:py-8"}>
          <FeatureShowcase
            heading={
              <>
                <b className="font-medium tracking-tight dark:text-white">
                  The ultimate SaaS Starter Kit
                </b>
                .{" "}
                <span className="block font-normal text-secondary-foreground/70 tracking-tight">
                  Unleash your creativity and build your SaaS faster than ever
                  with Portal.
                </span>
              </>
            }
            icon={
              <FeatureShowcaseIconContainer>
                <LayoutDashboard className="h-4 w-4" />
                <span>All-in-one solution</span>
              </FeatureShowcaseIconContainer>
            }
          >
            <FeatureGrid>
              <FeatureCard
                className={"relative col-span-1 overflow-hidden"}
                description={
                  "A beautiful dashboard to manage your SaaS business."
                }
                label={"Beautiful Dashboard"}
              />

              <FeatureCard
                className={"relative col-span-1 w-full overflow-hidden"}
                description={
                  "Multiple authentication providers to allow your users to sign in."
                }
                label={"Authentication"}
              />

              <FeatureCard
                className={"relative col-span-1 overflow-hidden"}
                description={"Multi tenant memberships for your SaaS business."}
                label={"Multi Tenancy"}
              />

              <FeatureCard
                className={"relative col-span-1 overflow-hidden"}
                description={
                  "Extend your SaaS with plugins that you can install using the CLI."
                }
                label={"Plugins"}
              />

              <FeatureCard
                className={"relative col-span-1 overflow-hidden"}
                description={
                  "Comprehensive documentation to help you get started."
                }
                label={"Documentation"}
              />
            </FeatureGrid>
          </FeatureShowcase>
        </div>
      </div>

      <div className={"container mx-auto"}>
        <EcosystemShowcase
          description="Unleash your creativity and build your SaaS faster than ever with Portal. Get started in minutes and ship your SaaS in no time."
          heading="The ultimate SaaS Starter Kit for founders."
        >
          <Image
            alt="Sign in"
            className="rounded-md"
            height={1000}
            src={"/images/sign-in.webp"}
            width={1000}
          />
        </EcosystemShowcase>
      </div>
    </div>
  );
}

export default withI18n(Home);

function MainCallToActionButton() {
  return (
    <div className={"flex space-x-2.5"}>
      <CtaButton className="h-10 text-sm">
        <Link href={"/auth/sign-up"}>
          <span className={"flex items-center space-x-0.5"}>
            <span>
              <Trans i18nKey={"common:getStarted"} />
            </span>

            <ArrowRightIcon
              className={
                "fade-in slide-in-from-left-8 h-4 animate-in" +
                "zoom-in fill-mode-both delay-1000 duration-1000"
              }
            />
          </span>
        </Link>
      </CtaButton>
    </div>
  );
}
