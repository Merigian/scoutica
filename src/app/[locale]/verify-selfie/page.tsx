import { getTranslations } from "next-intl/server";
import { SelfieCapture } from "@/components/verification/selfie-capture";
import { ShieldCheck, AlertCircle } from "lucide-react";

export default async function VerifySelfiePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = await getTranslations("pages.verifySelfie");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-6 text-center space-y-2">
        <ShieldCheck className="mx-auto h-7 w-7 text-[var(--accent)]" />
        <h1 className="text-h2 text-[var(--ink)]">{t("title")}</h1>
        <p className="text-meta text-[var(--ink-3)]">{t("description")}</p>
      </div>

      {token ? (
        <SelfieCapture token={token} />
      ) : (
        <div className="border border-[var(--rule)] p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-6 w-6 text-[var(--ink-3)]" />
          <p className="text-body text-[var(--ink-2)]">{t("missingToken")}</p>
        </div>
      )}

      <p className="mt-6 text-center text-meta text-[var(--ink-3)]">{t("privacyNote")}</p>
    </main>
  );
}
