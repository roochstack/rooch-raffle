import { BalanceInfoView } from '@roochnetwork/rooch-sdk';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { useWalletHexAddress } from './app-hooks';
import { normalizeCoinType } from '@/utils';

interface CoinBalance {
  coinType: string;
  balance: bigint;
  decimals: number;
  name: string;
  symbol: string;
  iconString?: string;
}

export const useCoinBalances = () => {
  const walletAddress = useWalletHexAddress();

  const balancesResp = useRoochClientQuery('getBalances', {
    owner: walletAddress,
  });

  if (balancesResp.data?.data) {
    const data: CoinBalance[] = balancesResp.data.data.map((_item) => {
      // The type in rooch-sdk is missing fields
      const item = _item as BalanceInfoView & { icon_url?: string };
      return {
        coinType: normalizeCoinType(item.coin_type),
        balance: BigInt(item.balance),
        decimals: item.decimals,
        name: item.name,
        symbol: item.symbol,
        iconString: item.icon_url,
      };
    });

    return {
      data,
      isLoading: balancesResp.isLoading,
      isError: balancesResp.isError,
    };
  }

  return {
    data: [] as CoinBalance[],
    isLoading: balancesResp.isLoading,
    isError: balancesResp.isError,
    refetch: balancesResp.refetch,
  };
};
