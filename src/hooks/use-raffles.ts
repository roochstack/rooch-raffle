import { RaffleItem } from '@/interfaces';
import { RAFFLE_BOX_TABLE_HANDLE_ID } from '@/utils/constants';
import { formatRaffleData } from '@/utils/raffle';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { get } from 'lodash';
import { useMemo } from 'react';

export const useRaffles = () => {
  const { data: raffleData, isLoading: isRaffleLoading } = useRoochClientQuery('listStates', {
    accessPath: `table/${RAFFLE_BOX_TABLE_HANDLE_ID}`,
    limit: '200',
    stateOption: {
      decode: true,
      showDisplay: true,
    },
  });

  const raffleObjectIdList = raffleData?.data
    .map((item) => {
      const id = get(item, 'state.decoded_value.value.value');
      const indexString = get(item, 'state.decoded_value.value.name');
      const index = indexString ? parseInt(indexString as string, 10) : 0;
      return { id, index };
    })
    .sort((a, b) => a.index - b.index)
    .map((item) => item.id);

  const { data: raffleObjectData, isLoading: isRaffleObjectLoading } = useRoochClientQuery(
    'queryObjectStates',
    {
      filter: {
        object_id: raffleObjectIdList?.join(',') || '',
      },
      queryOption: {
        decode: true,
        showDisplay: true,
      },
    }
  );

  const raffleList: RaffleItem[] | undefined = useMemo(() => {
    return raffleObjectData?.data
      .map(formatRaffleData)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [raffleObjectData]);

  return {
    data: raffleList,
    isLoading: isRaffleLoading || isRaffleObjectLoading,
  };
};
