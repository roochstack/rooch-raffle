import { Badge } from '../ui/badge';
import { ActivityStatus } from '@/interfaces';

interface StatusBadgeProps {
  status?: ActivityStatus;
}

const statusTextMapping: Record<string, string> = {
  ongoing: 'Ongoing',
  ended: 'Ended',
  'not-started': 'Upcoming',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;

  if (status === 'ongoing') {
    return (
      <Badge variant="outline" className="">
        <span className="relative mr-1 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
        </span>
        {statusTextMapping[status] || status}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="whitespace-nowrap">
      {statusTextMapping[status] || status}
    </Badge>
  );
}
