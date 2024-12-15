import { ClaimedItem } from '@/interfaces';
import { RoochClient, StateKVView } from '@roochnetwork/rooch-sdk';
import { useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { fromUnixTime } from 'date-fns';
import { get } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

const formatClaimedItem = (item: StateKVView): ClaimedItem => {
  return {
    address: get(item, 'state.decoded_value.value.name') as string,
    amount: Number(get(item, 'state.decoded_value.value.value')) as number,
    claimedAt: fromUnixTime(Number(get(item, 'state.created_at')) / 1000),
  };
};

const getClaimedInfo = async (
  client: RoochClient,
  tableHandleId: string,
  cursor?: string | null
): Promise<ClaimedItem[]> => {
  const result = await client.listStates({
    accessPath: `table/${tableHandleId}`,
    limit: '200',
    stateOption: {
      decode: true,
    },
    cursor,
  });

  if (result.has_next_page) {
    return [
      ...result.data.map(formatClaimedItem),
      ...(await getClaimedInfo(client, tableHandleId, result.next_cursor)),
    ];
  }

  return result.data.map(formatClaimedItem);
};

export function useEnvelopeClaimedInfo(tableHandleId: string) {
  const client = useRoochClient();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ClaimedItem[]>([]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    getClaimedInfo(client, tableHandleId)
      .then((data) => {
        setData(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [client, tableHandleId]);

  useEffect(() => {
    if (tableHandleId) {
      refetch();
    }
  }, [tableHandleId, refetch]);

  return {
    data,
    isLoading,
    refetch,
  };
}
