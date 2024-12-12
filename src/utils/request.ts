import { CoinEnvelopeItem, CoinMetaInfo } from '@/interfaces';
import { formatEnvelopeData } from './envelope';
import { MODULE_ADDRESS } from './constants';

export const fetchEnvelopeData = async (id: string) => {
  const res = await fetch(`https://main-seed.rooch.network/`, {
    method: 'POST',
    cache: 'force-cache',
    next: {
      revalidate: false,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'rooch_queryObjectStates',
      params: [{ object_id: id }, null, null, { decode: true, showDisplay: true }],
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch envelope data, status: ${res.status}, message: ${await res.text()}`
    );
  }

  const data = await res.json();
  const objectData = data.result.data[0];
  const detail = formatEnvelopeData(objectData) as CoinEnvelopeItem;
  return detail;
};

export const fetchCoinInfo = async (coinType: string) => {
  const res = await fetch('https://main-seed.rooch.network/', {
    cache: 'force-cache',
    next: {
      revalidate: false,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'rooch_getBalance',
      params: [MODULE_ADDRESS, coinType],
    }),
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch coin info, status: ${res.status}, message: ${await res.text()}`
    );
  }

  const data = await res.json();
  const coinMetaInfo: CoinMetaInfo = {
    coinType,
    name: data.result.name,
    decimals: data.result.decimals,
    imageUrl: data.result.icon_url,
    symbol: data.result.symbol,
  };
  return coinMetaInfo;
};
