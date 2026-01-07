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

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
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
            <Link href="/">{t("error.notFound.goHome")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app">{t("error.notFound.goToDashboard")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
