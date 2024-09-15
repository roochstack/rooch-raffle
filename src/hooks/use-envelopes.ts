import { useWalletHexAddress } from '@/hooks/app-hooks';
import { EnvelopeItem } from '@/interfaces';
import { ENVELOPE_USER_TABLE_HANDLE_ID } from '@/utils/constants';
import { formatEnvelopeData } from '@/utils/envelope';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { get } from 'lodash';
import { useCallback, useMemo } from 'react';

export const useEnvelopes = () => {
  const walletAddress = useWalletHexAddress();
  const userTableQueryResult = useRoochClientQuery('listStates', {
    accessPath: `table/${ENVELOPE_USER_TABLE_HANDLE_ID}`,
    limit: '200',
    stateOption: {
      decode: true,
      showDisplay: true,
    },
  });


  const currentUserTableVecHandleId = useMemo(() => {
    const currentState = userTableQueryResult.data?.data.find(
      (d) => get(d, 'state.decoded_value.value.name') === walletAddress
    );


    return get(
      currentState,
      'state.decoded_value.value.value.value.contents.value.handle.value.id'
    );
  }, [userTableQueryResult.data, walletAddress]);

  console.log('cur', currentUserTableVecHandleId);

  const objectIdQueryResult = useRoochClientQuery(
    'listStates',
    {
      accessPath: `table/${currentUserTableVecHandleId || ''}`,
      limit: currentUserTableVecHandleId ?  '200' : '0',
      stateOption: {
        decode: true,
        showDisplay: true,
      },
    }
  );

  const objectIds = useMemo(() => {
    return objectIdQueryResult.data?.data.map((item) => {
      return get(item, 'state.decoded_value.value.value') as string;
    });
  }, [objectIdQueryResult.data]);

  const envelopeQueryResult = useRoochClientQuery(
    'queryObjectStates',
    {
      filter: {
        object_id: objectIds?.join(',') || '',
      },
      limit: !!objectIds?.length ?  '200' : '0',
      queryOption: {
        decode: true,
        showDisplay: true,
      },
    }
  );

  const formattedData: EnvelopeItem[] | undefined = useMemo(() => {
    return envelopeQueryResult.data?.data
      .map(formatEnvelopeData)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [envelopeQueryResult.data]);

  const refetch = useCallback(() => {
    envelopeQueryResult.refetch();
    objectIdQueryResult.refetch();
  }, [envelopeQueryResult.refetch, objectIdQueryResult.refetch]);

  return {
    data: formattedData,
    isLoading:
      envelopeQueryResult.isPending ||
      objectIdQueryResult.isPending ||
      userTableQueryResult.isPending,
    refetch,
  };
};
