'use client';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheckIcon, CircleXIcon, LoaderCircleIcon } from 'lucide-react';
import * as React from 'react';
import { Button, ButtonProps } from './button';

export type LoadingButtonStatus = 'idle' | 'loading' | 'success' | 'error';

interface LoadingButtonProps extends ButtonProps {
  status: LoadingButtonStatus;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  successIcon?: React.ReactNode;
  minLoadingDuration?: number;
}

//======================================
export function LoadingButton({
  children,
  status,
  loadingText,
  successText,
  errorText,
  successIcon = <CircleCheckIcon size="20" className="mr-2" />,
  minLoadingDuration = 800,
  ...rest
}: LoadingButtonProps) {
  const [internalStatus, setInternalStatus] = React.useState<LoadingButtonStatus>(status);

  React.useEffect(() => {
    if (status === 'loading') {
      setInternalStatus('loading');
    } else {
      const timer = setTimeout(() => {
        setInternalStatus(status);
      }, minLoadingDuration);

      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <Button
      disabled={internalStatus === 'loading'}
      {...rest}
      variant={internalStatus === 'error' ? 'destructive' : rest.variant}
      className={cn('w-36 overflow-hidden rounded-lg', rest.className)}
    >
      <AnimatePresence mode="wait">
        {/* //------------------------------IDLE */}
        {internalStatus === 'idle' && (
          <motion.span
            key={internalStatus}
            exit={{
              opacity: 0,
              y: -15,
              transition: { duration: 0.1, type: 'spring' },
            }}
          >
            {children}
          </motion.span>
        )}
        {/* //------------------------------LOADING */}
        {internalStatus === 'loading' && (
          <motion.span
            key={internalStatus}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 100, y: 0, transition: { delay: 0 } }}
            exit={{ opacity: 0, y: -15, transition: { duration: 0.1 } }}
            className="inline-flex items-center"
          >
            <LoaderCircleIcon className="mr-2 animate-spin" size="19" />
            {loadingText}
          </motion.span>
        )}

        {/* //------------------------------RESOLVED */}
        {['success', 'error'].includes(internalStatus) && (
          <motion.span
            key={internalStatus}
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: 100,
              y: 0,
              transition: { duration: 0.1 },
            }}
            exit={{ opacity: 0, y: -15, transition: { duration: 0.1 } }}
            className="inline-flex items-center"
          >
            {internalStatus === 'success' && successIcon}
            {internalStatus === 'error' && <CircleXIcon size="20" className="mr-2" />}
            {internalStatus === 'success' && successText}
            {internalStatus === 'error' && errorText}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
