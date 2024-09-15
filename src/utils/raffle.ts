import { RaffleItem } from '@/interfaces';
import { fromUnixTime } from 'date-fns';
import { get } from 'lodash';

export function formatRaffleData(rawItem: any): RaffleItem {
  const id = rawItem.id;
  const createdAtTimestamp = rawItem.created_at;
  const updatedAtTimestamp = rawItem.updated_at;
  const createdAt = fromUnixTime(Number(createdAtTimestamp) / 1000);
  const updatedAt = fromUnixTime(Number(updatedAtTimestamp) / 1000);

  const name = get(rawItem, 'decoded_value.value.meta.value.name') as string;
  const imageUrl = get(rawItem, 'decoded_value.value.meta.value.image_url') as string;
  const colorMode = get(rawItem, 'decoded_value.value.meta.value.color_mode') as number;
  const themeMode = get(rawItem, 'decoded_value.value.meta.value.theme_mode') as number;

  const totalAmountString = get(rawItem, 'decoded_value.value.total_amount') as string;
  const rewardAmountString = get(rawItem, 'decoded_value.value.reward_amount') as string;
  const totalAmount = Number(totalAmountString);
  const rewardAmount = Number(rewardAmountString);

  const rewardInfo = get(rawItem, 'decoded_value.value.reward_info') as string;
  const isEnd = get(rawItem, 'decoded_value.value.is_end') as boolean;
  const rewardAddress = get(rawItem, 'decoded_value.value.reward_address') as string[];
  const rawClaimedAddress = get(rawItem, 'decoded_value.value.claimed_address') as string[];
  const opened = isEnd || rewardAddress.length > 0;

  // After open_box, the selected addresses will be removed from claimed_address and moved to reward_address
  const claimedAddress = Array.from(new Set([...rawClaimedAddress, ...rewardAddress]));

  const startTimeString = get(rawItem, 'decoded_value.value.start_time') as string;
  const endTimeString = get(rawItem, 'decoded_value.value.end_time') as string;
  const startTime = fromUnixTime(Number(startTimeString) / 1000);
  const endTime = fromUnixTime(Number(endTimeString) / 1000);

  const now = new Date();
  const status = startTime > now ? 'not-started' : endTime > now ? 'ongoing' : 'ended';

  return {
    id,
    createdAt,
    updatedAt,
    name,
    description: rewardInfo,
    coverImageUrl: imageUrl,
    colorMode,
    themeMode,
    totalAmount,
    rewardAmount,
    opened,
    claimedAddressList: claimedAddress,
    rewardAddressList: rewardAddress,
    startTime,
    endTime,
    status,
  } as RaffleItem;
}
