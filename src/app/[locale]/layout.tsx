import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { Providers } from "@/components/providers";
import localFont from "next/font/local";
import { Metadata } from "next";
import GlobalFooter from "@/components/global-footer";
import { Toaster } from "@/components/ui/toaster";
import { GlobalHeader } from "@/components/global-header";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic';

const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Rooch Raffle',
  description: 'Rooch Raffle - create your own activities using Rooch',
};

// 定义支持的语言类型
type SupportedLocale = 'en' | 'zh';

// 验证支持的语言
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }] as const;
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: SupportedLocale };
}) {
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${inter.className} ${geistSans.variable} ${geistMono.variable} relative min-h-screen antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <GlobalHeader />
            {children}
            <GlobalFooter />
          </Providers>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 