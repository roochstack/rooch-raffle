'use client';

import { Twitter, Globe, MessageCircle, MessagesSquare, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { SocialLink, SocialPlatform } from '@/interfaces';

interface SocialLinksProps {
  links: SocialLink[];
  onChange?: (links: SocialLink[]) => void;
  editable?: boolean;
}

const PLATFORM_ICON = {
  [SocialPlatform.TWITTER]: <Twitter className="h-4 w-4 text-[#1DA1F2]" />,
  [SocialPlatform.TELEGRAM]: <MessageCircle className="h-4 w-4 text-[#0088cc]" />,
  [SocialPlatform.WEBSITE]: <Globe className="h-4 w-4 text-gray-700" />,
  [SocialPlatform.DISCORD]: <MessagesSquare className="h-4 w-4 text-[#5865F2]" />,
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
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200"
          >
            {PLATFORM_ICON[link.platform] || <ExternalLink className="h-4 w-4 text-gray-500" />}
          </a>
        );
      })}
    </div>
  );
}
