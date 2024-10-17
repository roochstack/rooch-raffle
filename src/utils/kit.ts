import { formatDate } from 'date-fns';

export function formatUnits(raw: bigint | string | number, decimals = 18) {
  raw = BigInt(raw);
  const base = BigInt(10 ** decimals);
  const integerPart = raw / base;
  const remainder = raw % base;

  // Format the decimal part, ensuring it has the number of digits specified by `decimals`
  const decimal = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');

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
  thresholdUnit: 'minutes' | 'hours' | 'days' = 'hours'
): string {
  const now = Date.now();
  const diff = now - time.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const suffix = time.getTime() < now ? '前' : '后';

  if (thresholdUnit === 'minutes') {
    if (minutes < 1) {
      return `${seconds} 秒${suffix}`;
    } else if (minutes < 60) {
      return `${minutes} 分钟${suffix}`;
    } else {
      return formatDate(time, 'yyyy-MM-dd HH:mm');
    }
  } else if (thresholdUnit === 'hours') {
    if (minutes < 1) {
      return `${seconds} 秒${suffix}`;
    } else if (hours < 1) {
      return `${minutes} 分钟${suffix}`;
    } else if (hours < 24) {
      return `${hours} 小时${suffix}`;
    } else {
      return formatDate(time, 'yyyy-MM-dd HH:mm');
    }
  } else if (thresholdUnit === 'days') {
    if (minutes < 1) {
      return `${seconds} 秒${suffix}`;
    } else if (hours < 1) {
      return `${minutes} 分钟${suffix}`;
    } else if (days < 1) {
      return `${hours} 小时${suffix}`;
    } else if (days < 7) {
      return `${days} 天${suffix}`;
    } else {
      return formatDate(time, 'yyyy-MM-dd HH:mm');
    }
  }

  return formatDate(time, 'yyyy-MM-dd HH:mm');
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
