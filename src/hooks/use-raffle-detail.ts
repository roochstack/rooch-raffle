import { formatRaffleData } from '@/utils/raffle';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';

export const useRaffleDetail = (id: string) => {
  return useRoochClientQuery(
    'getStates',
    {
      accessPath: `object/${id}`,
      stateOption: {
        decode: true,
        showDisplay: true,
      },
    },
    {
      select: (data) => formatRaffleData(data[0]),
    }
  );
};
