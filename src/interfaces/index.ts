export type CreateActivityType = 'envelope' | 'raffle';

export interface CreateCoinEnvelopeParams {
  assetType: 'coin';
  activityName: string;
  description: string;
  coverImageUrl: string;
  themeMode: number;
  colorMode: number;
  envelopeType: 'random' | 'average';
  coinType: string;
  totalCoin: number | string;
  totalEnvelope: number | string;
  startTime: Date;
  endTime: Date;
  requireTwitterBinding: boolean;
}

export interface CreateNFTEnvelopeParams {
  assetType: 'nft';
  activityName: string;
  description: string;
  coverImageUrl: string;
  themeMode: number;
  colorMode: number;
  nftType: string;
  nfts: string[];
  startTime: Date;
  endTime: Date;
}

export type CreateEnvelopeParams = CreateCoinEnvelopeParams | CreateNFTEnvelopeParams;

export interface CreateLuckDrawParams {
  activityName: string;
  description: string;
  coverImageUrl: string;
  themeMode: number;
  colorMode: number;
  rewardInfo: string;
  totalAmount: number | string;
  rewardAmount: number | string;
  startTime: Date;
  endTime: Date;
}

export interface CoinBalance {
  coinType: string;
  name: string;
  symbol: string;
  iconUrl: string;
  decimals: number;
  supply: string;
  balance: string;
}

export interface ClaimedItem {
  address: string;
  amount: number;
  claimedAt: Date;
}

export interface NFTEnvelopeItem {
  assetType: 'nft';
  moduleName: string;
  nftType: string;
  id: string;
  sender: string;
  name: string;
  description: string;
  status: ActivityStatus;
  coverImageUrl: string;
  themeMode: number;
  colorMode: number;
  claimedAddressList: string[];
  nftListTableHandleId: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoinEnvelopeItem {
  assetType: 'coin';
  moduleName: string;
  id: string;
  sender: string;
  name: string;
  description: string;
  status: ActivityStatus;
  coverImageUrl: string;
  themeMode: number;
  colorMode: number;
  claimType: number;
  envelopeType: 'random' | 'average';
  coinType: string;
  coinStoreObjectId: string;
  claimedAddressTableId: string;
  totalCoin: number | string;
  remainingCoin: number;
  totalEnvelope: number | string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
  requireTwitterBinding: boolean;
}

export type EnvelopeItem = CoinEnvelopeItem | NFTEnvelopeItem;

export type ActivityStatus = 'not-started' | 'ongoing' | 'ended' | 'all-claimed';

export interface RaffleItem {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  colorMode: number;
  themeMode: number;
  startTime: Date;
  endTime: Date;
  status: ActivityStatus;
  totalAmount: number;
  rewardAmount: number;
  opened: boolean;
  claimedAddressList: string[];
  rewardAddressList: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: string;
}

export type Locale = 'zh' | 'en';

export interface CoinMetaInfo {
  coinType: string;
  name: string;
  decimals: number;
  imageUrl: string;
  symbol: string;
}
