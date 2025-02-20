import { useWalletHexAddress } from '@/hooks/app-hooks';
import { EnvelopeItem } from '@/interfaces';
import { chunkArray } from '@/utils/array';
import { ENVELOPE_MODULE_NAME, MODULE_ADDRESS } from '@/utils/constants';
import { formatEnvelopeData } from '@/utils/envelope';
import { Args, RoochClient } from '@roochnetwork/rooch-sdk';
import { useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { get } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

async function getEnvelopesData(
  client: RoochClient,
  walletAddress: string
): Promise<EnvelopeItem[]> {
  const envelopeObjectIdsQueryResult = await client.executeViewFunction({
    address: MODULE_ADDRESS,
    module: ENVELOPE_MODULE_NAME,
    function: 'get_envelope_object_ids_of_user',
    args: [Args.address(walletAddress)],
  });

  const envelopeObjectIds = get(
    envelopeObjectIdsQueryResult,
    'return_values[0].decoded_value.value',
    []
  ) as string[];

  if (envelopeObjectIds.length === 0) {
    return [];
  }

  const chunkedEnvelopeObjectIds = chunkArray(envelopeObjectIds, 200);

  const envelopeQueryResults = await Promise.all(
    chunkedEnvelopeObjectIds.map(async (_envelopeObjectIds) => {
      return client.queryObjectStates({
        filter: {
          object_id: _envelopeObjectIds.join(','),
        },
        limit: '200',
        queryOption: {
          decode: true,
          showDisplay: true,
        },
      });
    })
  );

  return envelopeQueryResults.flatMap((envelopeQueryResult) =>
    envelopeQueryResult.data.map(formatEnvelopeData)
  );
}

export const useEnvelopes = () => {
  const walletAddress = useWalletHexAddress();
  const client = useRoochClient();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<EnvelopeItem[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const envelopes = await getEnvelopesData(client, walletAddress);
      setData(envelopes.flat().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
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
