import { MODULE_ADDRESS } from '@/utils/constants';
import {
  useCreateSessionKey,
  useCurrentSession,
  useCurrentWallet,
} from '@roochnetwork/rooch-sdk-kit';
import { useState } from 'react';
import { useToast } from './use-toast';
import { useTranslations } from 'next-intl';

export function useAppSession() {
  const sessionKey = useCurrentSession();
  const { wallet } = useCurrentWallet();
  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const [sessionLoading, setSessionLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations();

  const handlerCreateSessionKey = () => {
    if (sessionLoading) {
      return;
    }
    setSessionLoading(true);

    const defaultScopes = [`${MODULE_ADDRESS}::*::*`];
    createSessionKey(
      {
        appName: 'rooch-raffle',
        appUrl: 'https://rooch-raffle.vercel.app',
        scopes: defaultScopes,
        maxInactiveInterval: 3 * 24 * 60 * 60, // 三天
      },
      {
        onSuccess: (result: any) => {
          console.log('session key', result);
        },
        onError: (error: any) => {
          console.error(error);
          if (error.message.includes('sub status 1004')) {
            toast({
              title: '❌ Error',
              description: t('common.errors.insufficientGas'),
            });
          }
        },
      }
    ).finally(() => setSessionLoading(false));
  };

  const sessionOrWallet = sessionKey || wallet;

  return {
    sessionKey,
    sessionOrWallet,
    handlerCreateSessionKey,
    sessionLoading,
  };
}

export const useWalletHexAddress = () => {
  const { wallet } = useCurrentWallet();
  return wallet?.getRoochAddress().toHexAddress() ?? '';
};
