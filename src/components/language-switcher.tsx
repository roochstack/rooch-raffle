'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

type SupportedLocale = 'en' | 'zh';

export function LanguageSwitcher() {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale: SupportedLocale = locale === 'en' ? 'zh' : 'en';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLocale}
      className="hover:bg-accent text-foreground/60 hover:text-foreground/80"
    >
      <Globe className="min-h-4 min-w-4" />
      <span className="ml-1 text-xs">{locale === 'en' ? 'EN' : '中文'}</span>
    </Button>
  );
} 