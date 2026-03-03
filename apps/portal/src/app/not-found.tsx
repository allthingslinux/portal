import Link from "next/link";
import { connection } from "next/server";
import { Button } from "@portal/ui/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@portal/ui/ui/card";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  await connection();
  const t = await getTranslations();

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
          <Button render={<Link href="/" />} variant="default">
            {t("error.notFound.goHome")}
          </Button>
          <Button render={<Link href="/app" />} variant="outline">
            {t("error.notFound.goToDashboard")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
