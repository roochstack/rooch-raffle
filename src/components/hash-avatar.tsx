import { useMemo } from 'react';
import { minidenticon } from 'minidenticons';
import { Avatar, AvatarImage } from './ui/avatar';
import { AvatarProps } from '@radix-ui/react-avatar';

export function HashAvatar({ address, ...rest }: { address: string } & AvatarProps) {
  const svgURI = useMemo(
    () => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(address)),
    [address]
  );
  return (
    <Avatar {...rest}>
      <AvatarImage src={svgURI} alt={address} />
    </Avatar>
  );
}
