import { useWalletHexAddress } from '@/hooks/app-hooks';
import { EnvelopeItem } from '@/interfaces';
import { ENVELOPE_USER_TABLE_HANDLE_ID_LIST } from '@/utils/constants';
import { formatEnvelopeData } from '@/utils/envelope';
import { RoochClient } from '@roochnetwork/rooch-sdk';
import { useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { get } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

async function getData(
  client: RoochClient,
  { tableHandleId, walletAddress }: { tableHandleId: string; walletAddress: string }
) {
  const userTableQueryResult = await client.listStates({
    accessPath: `table/${tableHandleId}`,
    limit: '200',
    stateOption: {
      decode: true,
      showDisplay: true,
    },
  });

  const currentState = userTableQueryResult.data.find(
    (d) => get(d, 'state.decoded_value.value.name') === walletAddress
  );

  if (!currentState) {
    return [];
  }

  const currentUserTableVecHandleId = get(
    currentState,
    'state.decoded_value.value.value.value.contents.value.handle.value.id'
  );

  if (!currentUserTableVecHandleId) {
    return [];
  }

  const objectIdQueryResult = await client.listStates({
    accessPath: `table/${currentUserTableVecHandleId}`,
    limit: '200',
    stateOption: {
      decode: true,
      showDisplay: true,
    },
  });

  const objectIds = objectIdQueryResult.data.map((item) => {
    return get(item, 'state.decoded_value.value.value') as string;
  });

  if (!objectIds.length) {
    return [];
  }

  const envelopeQueryResult = await client.queryObjectStates({
    filter: {
      object_id: objectIds.join(','),
    },
    limit: '200',
    queryOption: {
      decode: true,
      showDisplay: true,
    },
  });

  return envelopeQueryResult.data.map(formatEnvelopeData);
}

export const useEnvelopes = () => {
  const walletAddress = useWalletHexAddress();
  const client = useRoochClient();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<EnvelopeItem[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await Promise.all(
        ENVELOPE_USER_TABLE_HANDLE_ID_LIST.map(async (tableHandleId) => {
          return getData(client, { tableHandleId, walletAddress });
        })
      );
      setData(data.flat().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [client, walletAddress]);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    fetchData();
  }, [walletAddress, fetchData]);

  return {
    data,
    isLoading,
    refetch: fetchData,
  };
};
