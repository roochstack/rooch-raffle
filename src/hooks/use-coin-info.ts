import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { MODULE_ADDRESS } from '@/utils/constants';
import { CoinMetaInfo } from '@/interfaces';
export const useCoinInfo = (coinType: string) => {
  return useRoochClientQuery(
    'getBalance',
    {
      coinType,
      owner: MODULE_ADDRESS,
    },
    {
      select(data) {
        const coinMetaInfo: CoinMetaInfo = {
          coinType,
          name: data.name,
          decimals: data.decimals,
          imageUrl: (data as any).icon_url,
          symbol: data.symbol,
        };
        return coinMetaInfo;
      },
    }
  );
};
