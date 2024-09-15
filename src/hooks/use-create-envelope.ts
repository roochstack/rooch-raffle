import { ENVELOPE_MODULE_NAME, MODULE_ADDRESS } from '@/utils/constants';
import { Args, Transaction } from '@roochnetwork/rooch-sdk';
import { useState } from 'react';
import { useWalletHexAddress } from './app-hooks';
import { useCurrentWallet, useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { CreateEnvelopeParams } from '@/interfaces';

export const useCreateEnvelope = () => {
  const client = useRoochClient();
  const { wallet } = useCurrentWallet();
  const walletAddress = useWalletHexAddress();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createEnvelope = async (params: CreateEnvelopeParams): Promise<{ id: string }> => {
    const tx = new Transaction();

    if (params.assetType === 'nft') {
      tx.callFunction({
        target: `${MODULE_ADDRESS}::${ENVELOPE_MODULE_NAME}::create_nft_envelope`,
        args: [
          Args.string(params.activityName),
          Args.string(params.description),
          Args.string(params.coverImageUrl),
          Args.u8(params.themeMode), // themeMode
          Args.u8(params.colorMode), // colorMode
          Args.u64(BigInt(params.startTime.getTime())),
          Args.u64(BigInt(params.endTime.getTime())),
          Args.vec('objectId', params.nfts),
        ],
        typeArgs: [params.nftType],
      });
    } else if (params.assetType === 'coin') {
      tx.callFunction({
        target: `${MODULE_ADDRESS}::${ENVELOPE_MODULE_NAME}::create_coin_envelope`,
        args: [
          Args.string(params.activityName),
          Args.string(params.description),
          Args.string(params.coverImageUrl),
          Args.u8(params.themeMode), // themeMode
          Args.u8(params.colorMode), // colorMode
          Args.u8(params.assetType === 'coin' ? 0 : 1), // claimType
          Args.u64(BigInt(params.totalEnvelope)), // total_envelope
          Args.u256(BigInt(params.totalCoin)), // total_coin
          Args.u64(BigInt(params.startTime.getTime())),
          Args.u64(BigInt(params.endTime.getTime())),
        ],
        // typeArgs: [params.coinType],
        typeArgs: ['0x3::gas_coin::RGas'],
      });
    }

    const response = await client.signAndExecuteTransaction({
      transaction: tx,
      signer: wallet!,
    });

    if (response.execution_info.status.type !== 'executed') {
      throw new Error('Transaction failed');
    }

    // 0xxxx::red_envelope::CoinEnvelope<0x3::gas_coin::RGas>
    const newObjectCreatedChange = response.output!.changeset.changes.find(
      (change) =>
        change.metadata.object_type.includes(`${ENVELOPE_MODULE_NAME}::CoinEnvelope`) ||
        change.metadata.object_type.includes(`${ENVELOPE_MODULE_NAME}::NFTEnvelope`)
    );

    if (!newObjectCreatedChange) {
      throw new Error('Failed to create envelope');
    }

    return {
      id: newObjectCreatedChange.metadata.id,
    };
  };

  return {
    isLoading,
    error,
    success,
    create: createEnvelope,
  };
};
