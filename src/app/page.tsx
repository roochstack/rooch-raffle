import { CoinList } from '@/components/coin-list';
import { TopRightActions } from '@/components/top-right-actions';

export default function Home() {
  return (
    <div>
      <h2>钱包</h2>
      <TopRightActions />

      <h2>Coin List</h2>
      <CoinList />
    </div>
  );
}
