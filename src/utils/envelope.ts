import { ActivityStatus, CoinEnvelopeItem, EnvelopeItem, NFTEnvelopeItem } from '@/interfaces';
import { fromUnixTime } from 'date-fns';
import { get } from 'lodash';
import { normalizeCoinType } from './coin';

function parseNftTypeFromObjectType(objectType: string) {
  const pattern = /<(0x[a-f0-9]+::[^:]+::[^>]+)>/;
  const match = objectType.match(pattern);
  if (!match) {
    return null;
  }
  return match[1];
}

function formatMetadata(item: any) {
  // {address}::{moduleName}::structName<CoinType>
  const objectType = item.object_type;
  const moduleName = objectType.split('::')[1];

  const sender = get(item, 'decoded_value.value.sender') as string;
  const name = get(item, 'decoded_value.value.meta.value.name') as string;
  const description = get(item, 'decoded_value.value.meta.value.desc') as string;
  const coverImageUrl = get(item, 'decoded_value.value.meta.value.image_url') as string;
  const themeMode = get(item, 'decoded_value.value.meta.value.theme_mode') as number;
  const colorMode = get(item, 'decoded_value.value.meta.value.color_mode') as number;

  const startTime = new Date(Number(get(item, 'decoded_value.value.start_time')));
  const endTime = new Date(Number(get(item, 'decoded_value.value.end_time')));

  const now = new Date();
  const status: ActivityStatus =
    startTime > now ? 'not-started' : endTime > now ? 'ongoing' : 'ended';

  const id = get(item, 'id');

  const createdAtTimestamp = get(item, 'created_at');
  const updatedAtTimestamp = get(item, 'updated_at');
  const createdAt = fromUnixTime(Number(createdAtTimestamp) / 1000);
  const updatedAt = fromUnixTime(Number(updatedAtTimestamp) / 1000);

  return {
    moduleName,
    sender,
    name,
    description,
    coverImageUrl,
    themeMode,
    colorMode,
    id,
    status,
    startTime,
    endTime,
    createdAt,
    updatedAt,
  };
}

export function formatNftEnvelopeData(item: any): NFTEnvelopeItem {
  const {
    moduleName,
    sender,
    name,
    description,
    coverImageUrl,
    themeMode,
    colorMode,
    id,
    status,
    startTime,
    endTime,
    createdAt,
    updatedAt,
  } = formatMetadata(item);

  const rawObjectType = get(item, 'object_type') as string;
  const nftType = parseNftTypeFromObjectType(rawObjectType)!;

  const claimedAddressList = get(item, 'decoded_value.value.claimed_address') as string[];
  const nftListTableHandleId = get(
    item,
    'decoded_value.value.nft.value.contents.value.handle.value.id'
  ) as string;

  return {
    moduleName,
    id,
    sender,
    name,
    description,
    coverImageUrl,
    themeMode,
    colorMode,
    assetType: 'nft' as const,
    nftType,
    claimedAddressList,
    nftListTableHandleId,
    startTime,
    endTime,
    status,
    createdAt,
    updatedAt,
  };
}

export function formatCoinEnvelopeData(item: any): CoinEnvelopeItem {
  const {
    moduleName,
    sender,
    name,
    description,
    coverImageUrl,
    themeMode,
    colorMode,
    id,
    status,
    startTime,
    endTime,
    createdAt,
    updatedAt,
  } = formatMetadata(item);

  const rawClaimType = get(item, 'decoded_value.value.claim_type') as number;
  const envelopeType = rawClaimType === 1 ? ('random' as const) : ('average' as const);
  const rawCoinType = get(item, 'decoded_value.value.coin_type') as string;
  const coinType = normalizeCoinType(rawCoinType);
  const coinStoreObjectId = get(item, 'decoded_value.value.coin_store.value.id') as string;
  const claimedAddressTableId = get(
    item,
    'decoded_value.value.claimed_address.value.handle.value.id'
  ) as string;
  const requireTwitterBinding = get(item, 'decoded_value.value.require_twitter_binding') as boolean;

  const totalCoin = Number(get(item, 'decoded_value.value.total_coin'));
  const remainingCoin = Number(get(item, 'decoded_value.value.remaining_coin'));
  const totalEnvelope = Number(get(item, 'decoded_value.value.total_envelope'));

  const formattedStatus = remainingCoin === 0 ? ('all-claimed' as const) : status;

  return {
    moduleName,
    id,
    sender,
    name,
    description,
    coverImageUrl,
    themeMode,
    colorMode,
    claimType: rawClaimType,
    envelopeType,
    assetType: 'coin' as const,
    coinType,
    coinStoreObjectId,
    claimedAddressTableId,
    totalCoin,
    remainingCoin,
    totalEnvelope,
    startTime,
    endTime,
    status: formattedStatus,
    createdAt,
    updatedAt,
    requireTwitterBinding,
  };
}

export function formatEnvelopeData(item: any): EnvelopeItem {
  if (item.decoded_value.value.nft) {
    return formatNftEnvelopeData(item);
  }
  return formatCoinEnvelopeData(item);
}
