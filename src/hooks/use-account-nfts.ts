import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { MODULE_ADDRESS, OG_NFT_MODULE_NAME } from '@/utils/constants';
import { useWalletHexAddress } from '@/hooks/app-hooks';
import { get } from 'lodash';
import { NFT } from '@/interfaces';

export function useAccountNfts() {
  const walletAddress = useWalletHexAddress();
  const queryResult = useRoochClientQuery('queryObjectStates', {
    filter: {
      object_type_with_owner: {
        object_type: `${MODULE_ADDRESS}::${OG_NFT_MODULE_NAME}::NFT`,
        owner: walletAddress,
      },
    },
    limit: '200',
    queryOption: {
      decode: true,
      showDisplay: true,
    },
  });

  const nfts: NFT[] | undefined = queryResult.data?.data.map((item) => {
    const id = item.id;
    const name = get(item, 'display_fields.fields.name') as string;
    const description = get(item, 'display_fields.fields.description') as string;
    const imageUrl = get(item, 'display_fields.fields.image_url') as string;
    const type = get(item, 'decoded_value.type') as string;
    return { id, name, description, imageUrl, type };
  });

  return {
    data: nfts,
    isLoading: queryResult.isLoading,
    refresh: queryResult.refetch,
  };
}
