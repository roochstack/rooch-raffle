import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { useWalletHexAddress } from './app-hooks';

interface CoinMetaInfo {
  coinType: string;
  name: string;
  decimals: number;
  imageUrl: string;
  symbol: string;
}

export const useCoinInfo = (coinType: string) => {
  const walletAddress = useWalletHexAddress();
  return useRoochClientQuery(
    'getBalance',
    {
      coinType,
      owner: walletAddress,
    },
    {
      enabled: !!walletAddress,
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
