"use client";

import { useEffect, useState } from "react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { getLocaleFromBrowser, type Locale } from "../lib/i18n";

const headerText: Record<Locale, { signIn: string; signUp: string }> = {
  ja: { signIn: "サインイン", signUp: "新規登録" },
  en: { signIn: "Sign In", signUp: "Sign Up" },
};

export default function HeaderButtons() {
  const [locale, setLocale] = useState<Locale>("ja");
  useEffect(() => setLocale(getLocaleFromBrowser()), []);
  const t = headerText[locale];
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <SignInButton mode="modal">
        <button className="flex-shrink-0 whitespace-nowrap rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.08]">
          {t.signIn}
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="flex-shrink-0 whitespace-nowrap rounded-lg bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-black transition-colors hover:bg-zinc-100">
          {t.signUp}
        </button>
      </SignUpButton>
      <UserButton />
    </div>
  );
}
