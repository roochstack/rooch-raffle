import { Args, Transaction, TypeTag } from '@roochnetwork/rooch-sdk';
import { useAppSession } from './app-hooks';

import { useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { useCallback } from 'react';
import { ENVELOPE_MODULE_NAME, MODULE_ADDRESS } from '@/utils/constants';
import { ClaimDialogConfig, SocialLink } from '@/interfaces';

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
  socialLinks: SocialLink[];
  claimDialogConfig: ClaimDialogConfig | null;
}

export function useUpdateNotStartedEnvelope() {
  const client = useRoochClient();
  const { sessionOrWallet } = useAppSession();

  const updateNotStartedEnvelope = useCallback(
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

      // 更新链下数据库
      const dbResponse = await updateOffchainDatabase(id, {
        socialLinks: data.socialLinks,
        claimDialogConfig: data.claimDialogConfig,
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to update database', { cause: dbResponse });
      }
    },
    [client, sessionOrWallet]
  );

  return updateNotStartedEnvelope;
}

export function useUpdateOngoingEnvelope() {
  const client = useRoochClient();
  const { sessionOrWallet } = useAppSession();

  const updateOngoingEnvelope = useCallback(
    async (
      id: string,
      currentEndTime: Date,
      data: Pick<UpdateEnvelopeParams, 'endTime' | 'coinType' | 'socialLinks' | 'claimDialogConfig'>
    ) => {
      // 只有当当前结束时间小于新的结束时间时，才需要更新链上数据，否则不需要更新，如果更新则链上接口会校验报错
      if (currentEndTime < data.endTime) {
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
      }
      // 更新链下数据库
      const dbResponse = await updateOffchainDatabase(id, {
        socialLinks: data.socialLinks,
        claimDialogConfig: data.claimDialogConfig,
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to update database', { cause: dbResponse });
      }
    },
    [client, sessionOrWallet]
  );

  return updateOngoingEnvelope;
}

function updateOffchainDatabase(
  id: string,
  data: {
    socialLinks: SocialLink[];
    claimDialogConfig: ClaimDialogConfig | null;
  }
) {
  return fetch('/api/envelope-attributes', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      roochObjectId: id,
      socialLinks: data.socialLinks,
      claimDialogConfig: data.claimDialogConfig,
    }),
  });
}
