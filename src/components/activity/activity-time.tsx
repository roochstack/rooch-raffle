import React, { useState, useEffect } from 'react';
import { formatDate } from 'date-fns';
import { ActivityStatus } from '@/interfaces';
import { formatRelativeTime } from '@/utils/kit';

interface ActivityTimeProps {
  startTime: Date;
  endTime: Date;
  status: ActivityStatus;
}

const formatTime = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}天 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

const getElapsedTime = (startTime: Date, endTime: Date) => {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
};

export default function ActivityTime({ startTime, endTime, status }: ActivityTimeProps) {
  const [elapsedTime, setElapsedTime] = useState(() => getElapsedTime(new Date(), endTime!));

  useEffect(() => {
    if (status === 'ongoing' && endTime) {
      const timer = setInterval(() => {
        setElapsedTime(getElapsedTime(new Date(), endTime!));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, endTime]);

  if (status === 'ongoing') {
    return <span className="text-sm text-gray-700">还有 {formatTime(elapsedTime)} 结束</span>;
  }

  if (status === 'ended') {
    return (
      <span className="text-sm text-gray-500">
        已于
        <span className="mx-0.5">{formatRelativeTime(endTime)}</span>
        结束
      </span>
    );
  }

  if (status === 'not-started') {
    return (
      <span className="text-sm text-gray-500">
        将于
        <span className="mx-0.5">{formatRelativeTime(startTime)}</span>
        开始
      </span>
    );
  }

  return (
    <span className="text-sm text-gray-500">
      {formatDate(startTime, 'yyyy-MM-dd HH:mm')} - {formatDate(endTime, 'yyyy-MM-dd HH:mm')}
    </span>
  );
}
