import { Args, Transaction, TypeTag } from '@roochnetwork/rooch-sdk';
import { useAppSession } from './app-hooks';

import { useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { useCallback } from 'react';
import { ENVELOPE_MODULE_NAME, MODULE_ADDRESS } from '@/utils/constants';

interface UpdateEnvelopeParams {
  activityName: string;
  description: string;
  coverImageUrl: string;
  themeMode: number;
  colorMode: number;
  startTime: Date;
  endTime: Date;
  requireTwitterBinding: boolean;
  coinType: string;
}

export function useUpdateEnvelope() {
  const client = useRoochClient();
  const { sessionOrWallet } = useAppSession();

  const updateEnvelope = useCallback(
    async (id: string, data: UpdateEnvelopeParams) => {
      const tx = new Transaction();

      tx.callFunction({
        address: MODULE_ADDRESS,
        module: ENVELOPE_MODULE_NAME,
        function: 'update_coin_envelope',
        args: [
          Args.objectId(id),
          Args.string(data.activityName),
          Args.string(data.description),
          Args.string(data.coverImageUrl),
          Args.u8(data.themeMode),
          Args.u8(data.colorMode),
          Args.u64(BigInt(data.startTime.getTime())),
          Args.u64(BigInt(data.endTime.getTime())),
          Args.bool(data.requireTwitterBinding),
        ],
        typeArgs: [data.coinType],
      });

      const response = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: sessionOrWallet!,
      });

      if (response.execution_info.status.type !== 'executed') {
        throw new Error('Transaction failed');
      }
    },
    [client, sessionOrWallet]
  );

  return updateEnvelope;
}

export function useExtendEnvelopeEndTime() {
  const client = useRoochClient();
  const { sessionOrWallet } = useAppSession();

  const extendEnvelopeEndTime = useCallback(
    async (id: string, data: Pick<UpdateEnvelopeParams, 'endTime' | 'coinType'>) => {
      const tx = new Transaction();

      tx.callFunction({
        address: MODULE_ADDRESS,
        module: ENVELOPE_MODULE_NAME,
        function: 'extend_coin_envelope_end_time',
        args: [Args.objectId(id), Args.u64(BigInt(data.endTime.getTime()))],
        typeArgs: [data.coinType],
      });

      const response = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: sessionOrWallet!,
      });

      if (response.execution_info.status.type !== 'executed') {
        throw new Error('Transaction failed');
      }
    },
    [client, sessionOrWallet]
  );

  return extendEnvelopeEndTime;
}
