import { Locale } from '@/interfaces';
import { formatDate } from 'date-fns';
import { COVER_IMAGE_LIST } from './constants';

export function formatUnits(
  raw: bigint | string | number,
  decimals = 18,
  fractionDigits = decimals
) {
  raw = BigInt(raw);
  const base = BigInt(10 ** decimals);
  const integerPart = raw / base;
  const remainder = raw % base;

  // Format the decimal part, ensuring it has the number of digits specified by `decimals`
  let decimal = remainder.toString().padStart(decimals, '0');

  // Retain only the specified number of fraction digits
  if (fractionDigits < decimals) {
    decimal = decimal.slice(0, fractionDigits);
  }

  // Remove trailing zeros
  decimal = decimal.replace(/0+$/, '');

  return decimal.length > 0 ? `${integerPart}.${decimal}` : integerPart.toString();
}

export function formatCoinType(coinType: string) {
  const [address, module, struct] = coinType.split('::');
  let formattedAddress = address;

  if (address.length > 5) {
    formattedAddress = `${address.slice(0, 3)}...${address.slice(-3)}`;
  }

  return `${formattedAddress}::${module}::${struct}`;
}

export function formatRelativeTime(
  time: Date,
  thresholdUnit: 'minutes' | 'hours' | 'days' = 'hours',
  lang: Locale = 'zh'
): string {
  const now = Date.now();
  const diff = now - time.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const units = {
    zh: {
      second: '秒',
      minute: '分钟',
      hour: '小时',
      day: '天',
      ago: '前',
      later: '后',
    },
    en: {
      second: 'second',
      minute: 'minute',
      hour: 'hour',
      day: 'day',
      ago: 'ago',
      later: 'later',
    },
  };

  const { second, minute, hour, day, ago, later } = units[lang];
  const suffix = time.getTime() < now ? ago : later;

  // Helper function to handle plural forms in English
  const pluralize = (num: number, unit: string) => (lang === 'en' && num > 1 ? `${unit}s` : unit);

  if (thresholdUnit === 'minutes') {
    if (minutes < 1) {
      return `${seconds} ${pluralize(seconds, second)} ${suffix}`;
    } else if (minutes < 60) {
      return `${minutes} ${pluralize(minutes, minute)} ${suffix}`;
    }
  } else if (thresholdUnit === 'hours') {
    if (minutes < 1) {
      return `${seconds} ${pluralize(seconds, second)} ${suffix}`;
    } else if (hours < 1) {
      return `${minutes} ${pluralize(minutes, minute)} ${suffix}`;
    } else if (hours < 24) {
      return `${hours} ${pluralize(hours, hour)} ${suffix}`;
    }
  } else if (thresholdUnit === 'days') {
    if (minutes < 1) {
      return `${seconds} ${pluralize(seconds, second)} ${suffix}`;
    } else if (hours < 1) {
      return `${minutes} ${pluralize(minutes, minute)} ${suffix}`;
    } else if (days < 1) {
      return `${hours} ${pluralize(hours, hour)} ${suffix}`;
    } else if (days < 7) {
      return `${days} ${pluralize(days, day)} ${suffix}`;
    }
  }

  return formatDate(time, 'yyyy-MM-dd HH:mm');
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRandomCoverImageUrl() {
  const randomIndex = Math.floor(Math.random() * COVER_IMAGE_LIST.length);
  return `/${COVER_IMAGE_LIST[randomIndex]}`;
}

export function formatCoverImageUrl(path: string) {
  if (path && !path.startsWith('/')) {
    path = `/${path}`;
  }
  if (path && !path.includes('/covers')) {
    return `/covers${path}`;
  }

  return path;
}
