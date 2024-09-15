'use client';

import { useWalletAddress } from '@/hooks';
import { MODULE_ADDRESS } from '@/utils/constants';
import { Args, Transaction } from '@roochnetwork/rooch-sdk';
import { useCurrentWallet, useRoochClientQuery, useRoochClient } from '@roochnetwork/rooch-sdk-kit';
import { useEffect } from 'react';

export const CoinList = () => {
  const client = useRoochClient();
  const { wallet } = useCurrentWallet();
  const walletAddress = useWalletAddress();
  const balancesResp = useRoochClientQuery('getBalances', {
    owner: walletAddress,
  });
  const envelopesResp = useRoochClientQuery('queryObjectStates', {
    filter: {
      // object_type_with_owner: {
      //   object_type: `${MODULE_ADDRESS}::red_envelope::CoinEnvelope`,
      //   owner: walletAddress,
      // },
      object_type: `${MODULE_ADDRESS}::red_envelope::CoinEnvelope`,
    },
  });

  console.log('coin list balances', balancesResp.data);
  console.log('coin list envelopes', envelopesResp.data);

  const getUserEnvelopes = async () => {
    const accessPath = `/resource/${MODULE_ADDRESS}/${MODULE_ADDRESS}::red_envelope::EnvelopeTable`;
    const states = await client.getStates({
      accessPath,
      stateOption: { decode: true, showDisplay: true },
    });

    // console.log('getUserEnvelopes states', (states as any)[0].decoded_value.value.value.value);
    const tableId = (states as any)[0].decoded_value.value.value.value.user_table.value.handle.value
      .id;
    const tableStates = await client.listStates({
      accessPath: `/table/${tableId}/${walletAddress}`,
      stateOption: { decode: true, showDisplay: true },
    });

    const tableVecId = (tableStates as any).data[0].state.decoded_value.value.value.value.contents
      .value.handle.value.id;
    const tableVecStates = await client.listStates({
      accessPath: `/table/${tableVecId}`,
      stateOption: { decode: true, showDisplay: true },
    });
    // console.log('getUserEnvelopes tableVecStates', tableVecStates);
    const objectIds = tableVecStates.data.map((d: any) => d.state.decoded_value.value.value);
    console.log('getUserEnvelopes objectIds', objectIds);

    const objectStates = await client.getStates({
      accessPath: `/object/${objectIds.join(',')}`,
      stateOption: { decode: true, showDisplay: true },
    });

    console.log('getUserEnvelopes objectStates', objectStates);
  };

  useEffect(() => {
    getUserEnvelopes();
  }, []);

  const createCoinEnvelope = async () => {
    const tx = new Transaction();
    tx.callFunction({
      target: `${MODULE_ADDRESS}::red_envelope::create_coin_envelope`,
      args: [
        Args.u8(0),
        Args.u64(10n),
        Args.u256(100n),
        Args.u64(BigInt(Date.now())),
        Args.u64(BigInt(Date.now() + 1000 * 60 * 60 * 24)),
      ],
      typeArgs: ['0x3::gas_coin::RGas'],
    });
    const res = await client.signAndExecuteTransaction({
      transaction: tx,
      signer: wallet!,
    });
    console.log('res', res);
  };

  return (
    <div>
      <button onClick={createCoinEnvelope}>Create Coin Envelope</button>
    </div>
  );
};
