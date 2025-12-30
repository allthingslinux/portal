export function isBrowser() {
  return typeof window !== "undefined";
}

export function formatCurrency(params: {
  currencyCode: string;
  locale: string;
  value: string | number;
}) {
  const [lang, region] = params.locale.split("-");

  return new Intl.NumberFormat(region ?? lang, {
    style: "currency",
    currency: params.currencyCode,
  }).format(Number(params.value));
}
