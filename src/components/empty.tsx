import { PackageOpenIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyProps {
  title?: string;
  description?: ReactNode;
}

export function Empty({
  title = 'No data',
  description = 'Create your first activity',
}: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <PackageOpenIcon className="h-40 w-40 text-gray-200" />
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="text-2xl font-semibold text-gray-500/80">{title}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
    </div>
  );
}
