
interface CoinImageProps {
  imageUrl: string;
  className?: string;
}

export function CoinImage({ imageUrl, className }: CoinImageProps) {
  if (!imageUrl) {
    return null;
  }


  if (imageUrl.startsWith('<svg')) {
    return <span dangerouslySetInnerHTML={{ __html: imageUrl }} className={className} />;
  }

  return <img src={imageUrl} alt="coin" className={className} />;
}
