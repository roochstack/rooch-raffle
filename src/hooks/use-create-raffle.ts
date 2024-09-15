import { MODULE_ADDRESS, RAFFLE_ADMIN_CAP_OBJECT_ID, RAFFLE_MODULE_NAME } from '@/utils/constants';
import { CreateLuckDrawParams } from '@/interfaces';
import { Args, Transaction } from '@roochnetwork/rooch-sdk';
import { useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { useState } from 'react';
import { useAppSession } from './app-hooks';

export const useCreateRaffle = () => {
  const client = useRoochClient();
  const { sessionOrWallet } = useAppSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createRaffle = async (params: CreateLuckDrawParams): Promise<{ id: string }> => {
    const tx = new Transaction();
    tx.callFunction({
      target: `${MODULE_ADDRESS}::${RAFFLE_MODULE_NAME}::create_box`,
      args: [
        Args.string(params.activityName),
        Args.string(params.description),
        Args.string(params.coverImageUrl),
        Args.u8(params.themeMode), // themeMode
        Args.u8(params.colorMode), // colorMode
        // Args.objectId(RAFFLE_ADMIN_CAP_OBJECT_ID), // TODO _admin
        Args.string(params.rewardInfo), // reward_info
        Args.u64(BigInt(params.totalAmount)), // total_amount
        Args.u64(BigInt(params.rewardAmount)), // reward_amount
        Args.u64(BigInt(params.startTime.getTime())),
        Args.u64(BigInt(params.endTime.getTime())),
      ],
    });

    const response = await client.signAndExecuteTransaction({
      transaction: tx,
      signer: sessionOrWallet!,
    });

    if (response.execution_info.status.type !== 'executed') {
      throw new Error('Transaction failed');
    }

    // 0xxxx::red_envelope::CoinEnvelope<0x3::gas_coin::RGas>
    const newObjectCreatedChange = response.output!.changeset.changes.find((change) =>
      change.metadata.object_type.includes(`${RAFFLE_MODULE_NAME}::Box`)
    );

    if (!newObjectCreatedChange) {
      throw new Error('Failed to create raffle');
    }

    return {
      id: newObjectCreatedChange.metadata.id,
    };
  };

  return {
    isLoading,
    error,
    success,
    create: createRaffle,
  };
};
