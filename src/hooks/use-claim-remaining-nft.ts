import { useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { useCallback } from 'react';
import { Args, Transaction } from '@roochnetwork/rooch-sdk';
import { MODULE_ADDRESS } from '@/utils/constants';
import { useAppSession } from './app-hooks';

interface ClaimRemainingNFTParams {
  moduleName: string;
  envelopeId: string;
  nftType: string;
}

export function useClaimRemainingNFT() {
  const client = useRoochClient();
  const { sessionOrWallet } = useAppSession();

  const claimRemainingNFT = useCallback(
    async ({ moduleName, envelopeId, nftType }: ClaimRemainingNFTParams) => {
      const tx = new Transaction();

      tx.callFunction({
        address: MODULE_ADDRESS,
        module: moduleName,
        function: 'recovery_nft_envelope',
        args: [Args.objectId(envelopeId)],
        typeArgs: [nftType],
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

  return claimRemainingNFT;
}
