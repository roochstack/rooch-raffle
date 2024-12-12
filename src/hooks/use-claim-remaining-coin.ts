import { useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { useCallback } from 'react';
import { Args, Transaction } from '@roochnetwork/rooch-sdk';
import { MODULE_ADDRESS } from '@/utils/constants';
import { useAppSession } from './app-hooks';

interface ClaimRemainingCoinParams {
  moduleName: string;
  envelopeId: string;
  coinType: string;
}

export function useClaimRemainingCoin() {
  const client = useRoochClient();
  const { sessionOrWallet } = useAppSession();

  const claimRemainingCoin = useCallback(
    async ({ moduleName, envelopeId, coinType }: ClaimRemainingCoinParams) => {
      const tx = new Transaction();

      tx.callFunction({
        address: MODULE_ADDRESS,
        module: moduleName,
        function: 'recovery_coin_envelope',
        args: [Args.objectId(envelopeId)],
        typeArgs: [coinType],
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

  return claimRemainingCoin;
}
