'use client';

import { SocialLink, SocialPlatform } from '@/interfaces';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RiDiscordFill, RiTelegram2Fill, RiTwitterXFill } from 'react-icons/ri';
import { TbWorld } from 'react-icons/tb';

interface SocialLinksProps {
  links: SocialLink[];
  onChange?: (links: SocialLink[]) => void;
  editable?: boolean;
}

const PLATFORM_ICON = {
  [SocialPlatform.TWITTER]: (
    <RiTwitterXFill className="h-4.5 w-4.5 text-gray-500 hover:text-gray-700" />
  ),
  [SocialPlatform.TELEGRAM]: (
    <RiTelegram2Fill className="h-4.5 w-4.5 text-gray-500 hover:text-gray-700" />
  ),
  [SocialPlatform.WEBSITE]: <TbWorld className="h-4.5 w-4.5 text-gray-500 hover:text-gray-700" />,
  [SocialPlatform.DISCORD]: (
    <RiDiscordFill className="h-4.5 w-4.5 text-gray-500 hover:text-gray-700" />
  ),
};

export function SocialLinks({ links = [], onChange, editable = false }: SocialLinksProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(links);

  // 使用useEffect处理props更新
  useEffect(() => {
    setSocialLinks(links);
  }, [links]);

  // 确保我们有一个数组
  const linksToRender = Array.isArray(socialLinks) ? socialLinks : [];

  if (linksToRender.length === 0) return null;

  // 平台配置：图标、颜色、URL处理

  return (
    <div className={cn('flex items-center space-x-3')}>
      {linksToRender.map((link, index) => {
        return (
          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="">
            {PLATFORM_ICON[link.platform] || (
              <ExternalLink className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            )}
          </a>
        );
      })}
    </div>
  );
}
