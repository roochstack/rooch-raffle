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
      className="hover:bg-accent"
    >
      <Globe className="h-5 w-5" />
    </Button>
  );
} 