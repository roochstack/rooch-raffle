import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { useMemo } from 'react';
import { get } from 'lodash';
import { NFT } from '@/interfaces';

export const useEnvelopeNFTs = (tableHandleId: string) => {
  const tableVecQueryResult = useRoochClientQuery(
    'listStates',
    {
      accessPath: `table/${tableHandleId}`,
      limit: '200',
      stateOption: {
        decode: true,
        showDisplay: true,
      },
    },
    {
      enabled: !!tableHandleId,
    }
  );

  const nftObjectIds = useMemo(() => {
    return tableVecQueryResult.data?.data
      .sort((a, b) => {
        const indexKey = 'state.decoded_value.value.index';
        const aIndex = Number(get(a, indexKey));
        const bIndex = Number(get(b, indexKey));
        return aIndex - bIndex;
      })
      .map((item) => get(item, 'state.decoded_value.value.value.value.id') as string);
  }, [tableVecQueryResult.data]);

  const nftObjectQueryResult = useRoochClientQuery(
    'getStates',
    {
      accessPath: `object/${nftObjectIds?.join(',')}`,
      stateOption: {
        decode: true,
        showDisplay: true,
      },
    },
    {
      enabled: !!nftObjectIds && nftObjectIds.length > 0,
    }
  );

  const nfts: NFT[] | undefined = useMemo(() => {
    return nftObjectQueryResult.data?.map((item) => {
      const name = get(item, 'display_fields.fields.name') as string;
      const description = get(item, 'display_fields.fields.description') as string;
      const imageUrl = get(item, 'display_fields.fields.image_url') as string;
      const type = item.object_type as string;
      const id = item.id;

      return {
        id,
        name,
        description,
        imageUrl,
        type,
      };
    });
  }, [nftObjectQueryResult.data]);

  return {
    data: nfts,
    isPending: tableVecQueryResult.isPending || nftObjectQueryResult.isPending,
    isLoading: tableVecQueryResult.isLoading || nftObjectQueryResult.isLoading,
    refetch: async () => {
      await Promise.all([tableVecQueryResult.refetch(), nftObjectQueryResult.refetch()]);
    },
  };
};
