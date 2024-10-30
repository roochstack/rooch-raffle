import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations();

  return (
    <div className="container mx-auto min-h-[calc(100vh-118px)] max-w-5xl p-6 pt-20">
      <div className="fixed left-0 top-0 z-[-1] h-44 w-full bg-gradient-to-b from-[#f0f4fa] to-muted/0"></div>

      <div className="mx-auto mt-16 max-w-2xl text-center">
        <div>
          <div className="">
            <h1 className="text-4xl font-bold sm:text-5xl">{t('home.title')}</h1>
            <div className="mt-5 text-lg">{t('home.description')}</div>
          </div>
          <div className="mt-9 flex justify-center gap-5">
            <Button>
              <Link href="/create">{t('activities.create.firstActivity')}</Link>
            </Button>
            <Button variant="secondary">
              <Link href="/activities" className="flex items-center">
                <span>{t('home.manage')}</span> <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
