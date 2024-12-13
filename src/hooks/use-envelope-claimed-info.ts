import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { ClaimedItem } from '@/interfaces';
import { get } from 'lodash';
import { fromUnixTime } from 'date-fns';
import { useMemo } from 'react';

const emptyList: ClaimedItem[] = [];

export function useEnvelopeClaimedInfo(tableHandleId: string) {
  const { data, isLoading, refetch } = useRoochClientQuery('listStates', {
    accessPath: `table/${tableHandleId}`,
    limit: tableHandleId ? '200' : '0',
    stateOption: {
      decode: true,
      showDisplay: true,
    },
  });

  const formattedClaimedData: ClaimedItem[] = useMemo(() => {
    return (
      data?.data
        .map((item) => {
          return {
            id: get(item, 'id'),
            address: get(item, 'state.decoded_value.value.name') as string,
            amount: Number(get(item, 'state.decoded_value.value.value')) as number,
            claimedAt: fromUnixTime(Number(get(item, 'state.created_at')) / 1000),
          };
        })
        .sort((a, b) => b.claimedAt.getTime() - a.claimedAt.getTime()) || emptyList
    );
  }, [data]);

  return {
    data: formattedClaimedData,
    isLoading,
    refetch,
  };
}
