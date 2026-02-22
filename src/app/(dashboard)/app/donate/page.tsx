import { BarChart3, BookOpen, Code, MessageSquare, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  SiBitcoin,
  SiCashapp,
  SiOpencollective,
  SiPaypal,
  SiStripe,
} from "react-icons/si";

import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageContent, PageHeader } from "@/components/layout/page";
import { verifySession } from "@/auth/dal";
import { DONATION_OPTIONS } from "@/config/donate";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { getRouteMetadata } from "@/shared/seo";

const DONATION_ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  opencollective: SiOpencollective,
  paypal: SiPaypal,
  "stripe-monthly": SiStripe,
  "stripe-onetime": SiStripe,
  "every-org": SiBitcoin,
  cashapp: SiCashapp,
};

export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app/donate", routeConfig, resolver);
}

export default async function DonatePage() {
  await verifySession();
  const resolver = await getServerRouteResolver();

  return (
    <PageContent>
      <PageHeader pathname="/app/donate" resolver={resolver} />

      <div className="space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-xl border border-primary/10">
          <div
            className="absolute inset-0 opacity-20 dark:opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-3 font-semibold text-foreground text-xl sm:text-2xl">
                Support All Things Linux
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Your donations help us maintain infrastructure, run events, and
                grow our community. Every contribution makes a difference.
              </p>
            </div>
          </div>
        </div>

        {/* Financial Donations */}
        <Card className="border-2 transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <BarChart3 className="size-6 text-green-600 dark:text-green-500" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">
                Donate financially
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              Your donations help us maintain infrastructure, run events, and
              grow our community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {DONATION_OPTIONS.map((option) => {
                const Icon = DONATION_ICON_MAP[option.id];
                return (
                  <a
                    className={buttonVariants({
                      variant:
                        option.id === "opencollective" ? "default" : "outline",
                      size: "default",
                      className:
                        "inline-flex w-full items-center justify-center gap-2",
                    })}
                    href={option.href}
                    key={option.id}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {Icon && <Icon className="size-4 shrink-0" />}
                    <span>{option.name}</span>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Other ways to contribute */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="flex flex-col border-2 transition-shadow hover:shadow-lg">
            <CardHeader className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <Users className="size-6 text-purple-600 dark:text-purple-500" />
                </div>
                <CardTitle className="text-lg">Volunteer your time</CardTitle>
              </div>
              <CardDescription>
                Join our team and help manage the community, create content, and
                organize events.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className:
                    "inline-flex w-full items-center justify-center gap-2",
                })}
                href="/app/connect"
              >
                <Users className="size-4" />
                Connect with us
              </Link>
            </CardContent>
          </Card>

          <Card className="flex flex-col border-2 transition-shadow hover:shadow-lg">
            <CardHeader className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/10 p-2">
                  <BookOpen className="size-6 text-cyan-600 dark:text-cyan-500" />
                </div>
                <CardTitle className="text-lg">
                  Contribute your knowledge
                </CardTitle>
              </div>
              <CardDescription>
                Share your knowledge by contributing, editing or writing
                articles and guides.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <a
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className:
                    "inline-flex w-full items-center justify-center gap-2",
                })}
                href="https://wiki.atl.dev"
                rel="noopener noreferrer"
                target="_blank"
              >
                <BookOpen className="size-4" />
                Visit Wiki
              </a>
            </CardContent>
          </Card>

          <Card className="flex flex-col border-2 transition-shadow hover:shadow-lg">
            <CardHeader className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Code className="size-6 text-blue-600 dark:text-blue-500" />
                </div>
                <CardTitle className="text-lg">Contribute your code</CardTitle>
              </div>
              <CardDescription>
                Help us build and improve our open-source projects and
                infrastructure.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <a
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className:
                    "inline-flex w-full items-center justify-center gap-2",
                })}
                href="https://github.com/allthingslinux"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Code className="size-4" />
                View on GitHub
              </a>
            </CardContent>
          </Card>

          <Card className="flex flex-col border-2 transition-shadow hover:shadow-lg">
            <CardHeader className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <MessageSquare className="size-6 text-orange-600 dark:text-orange-500" />
                </div>
                <CardTitle className="text-lg">Help and support</CardTitle>
              </div>
              <CardDescription>
                Help others learn Linux, answer questions, and share your
                knowledge in our community.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className:
                    "inline-flex w-full items-center justify-center gap-2",
                })}
                href="/app/connect"
              >
                <MessageSquare className="size-4" />
                Join our community
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Transparency */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              We practice radical transparency
            </CardTitle>
            <CardDescription className="text-center text-base">
              As a non-profit, we&apos;re committed to complete transparency. We
              publish financials and share decisions openly with the community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="text-center">
                <div className="font-bold text-2xl text-primary">20+</div>
                <p className="text-muted-foreground text-sm">
                  Dedicated volunteers
                </p>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-primary">100%</div>
                <p className="text-muted-foreground text-sm">
                  Open source and non-profit
                </p>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-primary">24/7</div>
                <p className="text-muted-foreground text-sm">
                  Community support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
