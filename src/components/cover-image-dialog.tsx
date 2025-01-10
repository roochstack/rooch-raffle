import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/hooks';
import { COVER_IMAGE_LIST } from '@/utils/constants';
import { formatCoverImageUrl, preloadImage } from '@/utils/kit';
import { CloudUpload, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
interface CoverImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageUrl: string) => void;
}

export function CoverImageDialog({ open, onOpenChange, onSelect }: CoverImageDialogProps) {
  const t = useTranslations();
  const ref = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(() => {
    ref.current?.click();
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const size = file.size / 1024 / 1024;
      if (size > 3) {
        toast({
          title: t('teal_pink_panda_spark'),
          description: t('busy_clear_kangaroo_win'),
          variant: 'destructive',
        });
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          toast({
            title: t('knotty_east_horse_fulfill'),
            description: t('jolly_acidic_fox_quell'),
          });
          return;
        }

        const { path } = await response.json();
        await preloadImage(formatCoverImageUrl(path));

        onSelect(path);
        onOpenChange(false);
      } catch (error) {
        toast({
          title: t('knotty_east_horse_fulfill'),
          description: t('jolly_acidic_fox_quell'),
        });
      } finally {
        setIsUploading(false);
      }
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-0.75rem)] max-w-3xl overflow-y-auto">
        <div className="p-4">
          <div
            className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/80 transition-colors hover:bg-gray-200"
            onClick={handleUpload}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="mt-1 text-sm text-muted-foreground">{t('key_late_wasp_race')}</p>
              </>
            ) : (
              <>
                <CloudUpload className="h-6 w-6 text-muted-foreground" />
                <p className="mt-1 text-sm text-muted-foreground">{t('moving_frail_flea_buzz')}</p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={ref}
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4">
          {COVER_IMAGE_LIST.map((image) => (
            <button
              key={image}
              className="relative aspect-square w-full overflow-hidden rounded-lg border transition-colors hover:border-primary"
              onClick={() => {
                onSelect(`/${image}`);
                onOpenChange(false);
              }}
            >
              <Image
                src={formatCoverImageUrl(image)}
                alt={image}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
