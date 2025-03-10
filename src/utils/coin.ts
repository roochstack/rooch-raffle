/**
 * 规范化币种类型字符串
 *
 * @param coinType 需要规范化的币种类型字符串
 * @returns 规范化后的币种类型字符串
 */
export function normalizeCoinType(coinType: string): string {
  return coinType.replace(
    /0x0+([1-9a-f]|0+[1-9a-f])/i, // 匹配前导零（包括全零情况）
    (_match, p1) => {
      const significantPart = p1.toLowerCase();
      // 处理全零的特殊情况（如 0x0 → 0x0）
      return significantPart.startsWith('0')
        ? `0x0${significantPart.slice(-1)}`
        : `0x${significantPart}`;
    }
  );
}

/**
 * Format a number by removing trailing zeros after decimal point
 * @param value The number to format
 * @param decimals Number of decimal places
 * @returns Formatted string number without trailing zeros
 */
export function formatNumberWithoutTrailingZeros(value: number, decimals: number): string {
  return (
    value
      .toFixed(decimals)
      // Remove trailing zeros and decimal point if no decimals
      .replace(/\.?0+$/, '')
  );
}

/**
 * Format a coin amount by its decimals
 * @param amount The amount to format
 * @param decimals Number of decimal places
 * @returns Formatted string number
 */
export function formatCoinAmount(amount: number | bigint, decimals: number): string {
  const value = Number(amount) / 10 ** decimals;
  return formatNumberWithoutTrailingZeros(value, decimals);
}
