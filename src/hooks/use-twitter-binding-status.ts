import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';

export function useTwitterBindingStatus(userAddress: string) {
  const queryResult = useRoochClientQuery(
    'queryObjectStates',
    {
      filter: {
        object_type_with_owner: {
          object_type: `0x701c21bf1c8cd5af8c42983890d8ca55e7a820171b8e744c13f2d9998bf76cc3::twitter_account::TwitterAccount`,
          owner: userAddress,
        },
      },
      limit: '1',
      queryOption: {
        decode: true,
      },
    },
    {
      select: (data) => {
        return data.data.length > 0;
      },
    }
  );

  return {
    isPending: queryResult.isLoading,
    binded: queryResult.data,
  };
}
