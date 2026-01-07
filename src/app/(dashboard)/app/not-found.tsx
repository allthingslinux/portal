import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AppNotFound() {
  // Use single useTranslations() call with dot notation for full key paths
  // This helps i18n-ally detect the complete namespace.key path
  const t = useTranslations();

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="font-bold text-6xl">404</CardTitle>
          <CardDescription className="text-lg">
            {t("error.notFound.title")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("error.notFound.description")}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Button asChild variant="default">
            <Link href="/app">{t("navigation.backToDashboard")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t("error.notFound.goHome")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
