import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function ActivityFormLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-5 md:flex-row">{children}</div>;
}

function ImageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg shadow-sm md:h-[300px] md:w-[300px] md:min-w-[300px] xl:h-[400px] xl:w-[400px] xl:min-w-[400px]',
        className
      )}
    >
      {children}
    </div>
  );
}

function FormContainer({ children }: { children: ReactNode }) {
  return <div className="flex-1">{children}</div>;
}

ActivityFormLayout.ImageContainer = ImageContainer;
ActivityFormLayout.FormContainer = FormContainer;
