'use client';

import { TopRightActions } from './top-right-actions';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

export function GlobalHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between transition-colors ${
        isScrolled ? 'border-b border-gray-100/20 shadow-sm backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex w-full max-w-5xl items-center justify-between px-6">
        <div className="z-10 flex items-center gap-5">
          <div className="text-sm text-primary hover:text-foreground/80">
            <Link href="/" className="inline-flex items-center space-x-1">
              <Image src="/logo.png" alt="logo" width={16} height={16} className="rounded-sm" />
              <div className="space-x-1">
                {/* <span className="text-lg font-semibold tracking-tighter">RAFFLE</span>
                <span className="text-xs font-semibold tracking-tighter text-muted-foreground">
                  by Rooch
                </span> */}

                <span className="text-lg font-semibold">Rooffle</span>
              </div>
            </Link>
          </div>
        </div>
        <div>
          <TopRightActions />
        </div>
      </div>
    </header>
  );
}
