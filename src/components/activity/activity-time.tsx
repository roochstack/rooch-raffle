'use client';

import React, { useState, useEffect } from 'react';
import { formatDate } from 'date-fns';
import { ActivityStatus, Locale } from '@/interfaces';
import { formatRelativeTime } from '@/utils/kit';
import { useLocale, useTranslations } from 'next-intl';

interface ActivityTimeProps {
  startTime: Date;
  endTime: Date;
  status: ActivityStatus;
}

const formatTime = (seconds: number, lang: 'en' | 'zh' = 'zh') => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  if (days > 0) {
    return lang === 'zh'
      ? `${days}天 ${timeStr}`
      : `${days} day${days > 1 ? 's' : ''} ${timeStr}`;
  } else {
    return timeStr;
  }
};

const getElapsedTime = (startTime: Date, endTime: Date) => {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
};

export default function ActivityTime({ startTime, endTime, status }: ActivityTimeProps) {
  const t = useTranslations('time');
  const locale = useLocale() as Locale;
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
    return <span className="text-sm text-gray-700">{t('endIn', { time: formatTime(elapsedTime, locale === 'zh' ? 'zh' : 'en') })}</span>;
  }

  if (status === 'ended') {
    return (
      <span className="text-sm text-gray-500">
        {t('endedAt', { time: formatRelativeTime(endTime, 'hours', locale) })}
      </span>
    );
  }

  if (status === 'not-started') {
    return (
      <span className="text-sm text-gray-500">
        {t('startAt', { time: formatRelativeTime(startTime, 'hours', locale) })}
      </span>
    );
  }

  return (
    <span className="text-sm text-gray-500">
      {formatDate(startTime, 'yyyy-MM-dd HH:mm')} - {formatDate(endTime, 'yyyy-MM-dd HH:mm')}
    </span>
  );
}
