import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getDictionary, normalizeLocale } from "@/lib/i18n/dictionaries";

export async function getServerI18n() {
  const user = await getCurrentUser();
  const settings = user
    ? await prisma.userSettings.findUnique({
        where: { userId: user.id },
        select: { language: true }
      })
    : null;

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  const browserLocale = acceptLanguage?.toLowerCase().startsWith("zh")
    ? "zh"
    : acceptLanguage?.toLowerCase().startsWith("ja")
      ? "ja"
      : "en";
  const locale = normalizeLocale(settings?.language ?? browserLocale);

  return {
    locale,
    dictionary: getDictionary(locale),
    user
  };
}
