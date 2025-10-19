'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

function truncateAddress(address: `0x${string}` | undefined) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const WalletConnectButton = () => {
  const { address, isConnecting, isReconnecting } = useAccount();
  const connectedChainId = useChainId();
  const [connectError, setConnectError] = useState<string | null>(null);
  const { connectAsync, connectors, error, status, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitching, error: switchError } = useSwitchChain();

  const preferredConnector = useMemo(() => {
    const preferredOrder = ['metaMask', 'farcaster', 'phantom', 'coinbaseWalletSDK'];

    for (const id of preferredOrder) {
      const match = connectors.find((connector) => connector.id === id);
      if (match) return match;
    }

    return connectors[0];
  }, [connectors]);

  useEffect(() => {
    setConnectError(null);
  }, [preferredConnector]);

  const hasAnyConnector = connectors.length > 0;
  const isOnBaseSepolia = !address || connectedChainId === baseSepolia.id;

  useEffect(() => {
    if (!address || !switchChainAsync || isOnBaseSepolia) return;

    void switchChainAsync({ chainId: baseSepolia.id }).catch(() => {
      // switch errors are exposed via switchError state
    });
  }, [address, isOnBaseSepolia, switchChainAsync]);

  const handleConnect = () => {
    if (!preferredConnector) {
      return;
    }

    setConnectError(null);

    connectAsync({ connector: preferredConnector, chainId: baseSepolia.id }).catch((err) => {
      setConnectError(err?.message ?? 'Failed to connect wallet.');
    });
  };

  if (address) {
    return (
      <button
        onClick={() => disconnect()}
        className="bg-cyber-blue/20 border border-cyber-blue text-cyber-blue px-4 py-2 rounded-md text-sm md:text-base font-semibold hover:bg-cyber-blue/30 transition-colors"
      >
        {truncateAddress(address)} | Disconnect
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleConnect}
        disabled={!hasAnyConnector || isPending || isConnecting || isReconnecting || isSwitching}
        className="bg-cyber-orange text-black px-5 py-2 rounded-md text-sm md:text-base font-semibold hover:bg-orange-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending || isConnecting || isReconnecting
          ? 'Connecting...'
          : isSwitching
            ? 'Switching Networks...'
            : 'Connect Wallet'}
      </button>
      {error && (
        <p className="text-xs text-red-400 text-center max-w-xs">
          {error.message}
        </p>
      )}
      {connectError && (
        <p className="text-xs text-red-400 text-center max-w-xs">
          {connectError}
        </p>
      )}
      {switchError && (
        <p className="text-xs text-red-400 text-center max-w-xs">
          {switchError.message}
        </p>
      )}
      {!isOnBaseSepolia && !isSwitching && (
        <p className="text-xs text-yellow-400 text-center max-w-xs">
          Please approve the network switch to Base Sepolia.
        </p>
      )}
      {!hasAnyConnector && status !== 'pending' && (
        <p className="text-xs text-gray-400 text-center max-w-xs">
          No supported wallet detected. Open a browser wallet and try again.
        </p>
      )}
    </div>
  );
};

export default WalletConnectButton;
