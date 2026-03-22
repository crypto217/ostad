import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const fontSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ostad | SaaS pour enseignants",
  description: "Simplifiez la gestion de vos classes et élèves.",
};

async function getProfileLanguage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Action handled in middleware
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "fr";

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_language")
    .eq("id", user.id)
    .single();

  return profile?.preferred_language || "fr";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLanguage = await getProfileLanguage();

  return (
    <html
      lang={initialLanguage}
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
      dir={initialLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLanguage={initialLanguage as any}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
