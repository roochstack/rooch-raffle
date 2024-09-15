import { MODULE_ADDRESS, RAFFLE_MODULE_NAME } from '@/utils/constants';
import { Args, Transaction } from '@roochnetwork/rooch-sdk';
import { useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { useAppSession } from './app-hooks';
import { AppError } from '@/utils/error';
import { useCallback } from 'react';

export const useOpenBox = () => {
  const client = useRoochClient();
  const { sessionOrWallet } = useAppSession();
  const tx = new Transaction();

  const openBox = useCallback(
    async (id: string) => {
      tx.callFunction({
        target: `${MODULE_ADDRESS}::${RAFFLE_MODULE_NAME}::open_box`,
        args: [Args.objectId(id)],
      });
      const res = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: sessionOrWallet!,
      });

      if (res.execution_info.status.type !== 'executed') {
        throw new AppError('Open Box failed');
      }
    },
    [client, sessionOrWallet]
  );

  return openBox;
};
