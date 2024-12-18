import { Dialog, DialogContent } from '@/components/ui/dialog';
import { COVER_IMAGE_LIST } from '@/utils/constants';
import Image from 'next/image';
import { formatCoverImageUrl } from '@/utils/kit';

interface CoverImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageUrl: string) => void;
}

export function CoverImageDialog({ open, onOpenChange, onSelect }: CoverImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
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
