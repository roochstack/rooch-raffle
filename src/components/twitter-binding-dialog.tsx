import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ArrowUpRightIcon, CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

interface TwitterBindingDialogProps {
  creatorAddress: string;
  open: boolean;
  onClose: () => void;
}

export default function TwitterBindingDialog({ creatorAddress, open, onClose }: TwitterBindingDialogProps) {
  const t = useTranslations('activities.envelope.twitterBindingDialog');
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-sm">
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
            aria-hidden="true"
          >
            <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            window.open(`https://portal.rooch.network/inviter/${creatorAddress}`, '_blank');
          }}>{t('confirm')} <ArrowUpRightIcon className="w-4 h-4 ml-1" /></AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
