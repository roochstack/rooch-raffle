import { sleep } from "@/utils/kit";
import { useConnectWallet, Wallet } from "@roochnetwork/rooch-sdk-kit";
import { CheckCircleIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";

interface WalletRowProps {
  wallet: Wallet;
  closeModal: () => void;
}

export const WalletRow = ({ wallet, closeModal }: WalletRowProps) => {
  const { mutateAsync: connectWallet } = useConnectWallet();
  const [isCheckingInstalled, setIsCheckingInstalled] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    wallet.checkInstalled().then(setIsInstalled).finally(() => setIsCheckingInstalled(false));
  }, [wallet]);

  return (
    <div
      onClick={async () => {
        try {
          if (!isCheckingInstalled && !isInstalled) {
            window.open(wallet.getInstallUrl(), '_blank', 'noreferrer noopener');
          } else {
            setIsConnecting(true);
            await connectWallet({ wallet });
            await sleep(800);
            closeModal();
          }
        } catch (error) {
          if (!isCheckingInstalled && !isInstalled) {
            window.open(wallet.getInstallUrl(), '_blank', 'noreferrer noopener');
            return;
          }
          console.error(error);
        } finally {
          setIsConnecting(false);
        }
      }}
      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg p-1.5 transition-all hover:bg-gray-200/80"
    >
      <div className="flex items-center gap-3">
        <img
          src={wallet.getIcon()}
          alt={wallet.getName()}
          className="h-7 w-7 rounded-lg border border-gray-100"
        />
        <span className="font-semibold">{wallet.getName()}</span>
      </div>
      {isConnecting ? (
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Loader2Icon className="w-3 h-3 animate-spin" /> 连接中
        </span>
      ) : isInstalled ? (
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <CheckCircleIcon className="w-3 h-3" /> 已安装
        </span>
      ) : (
        <span className="text-xs text-gray-500">未安装</span>
      )}
    </div>
  );
};
