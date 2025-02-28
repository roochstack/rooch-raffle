import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk';
import { createNetworkConfig } from '@roochnetwork/rooch-sdk-kit';
import { normalizeCoinType } from './coin';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  mainnet: {
    url: getRoochNodeUrl('mainnet'),
  },
  devnet: {
    url: getRoochNodeUrl('devnet'),
  },
  testnet: {
    url: getRoochNodeUrl('testnet'),
  },
  localnet: {
    url: getRoochNodeUrl('localnet'),
  },
});

export { useNetworkVariable, useNetworkVariables, networkConfig, normalizeCoinType };
