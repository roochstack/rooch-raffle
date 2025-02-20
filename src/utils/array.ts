export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  let index = 0;

  while (index < array.length) {
    const end = Math.min(index + chunkSize, array.length);
    result.push(array.slice(index, end));
    index = end;
  }

  return result;
}
