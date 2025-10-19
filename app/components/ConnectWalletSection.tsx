'use client';

import { baseSepolia } from 'wagmi/chains';
import WalletConnectButton from './WalletConnectButton';
import { useAccount } from 'wagmi';

const ConnectWalletSection = () => {
  const { address } = useAccount();

  return (
    <section className="bg-black/40 border border-cyber-orange/20 rounded-2xl shadow-lg shadow-cyber-orange/10 max-w-4xl mx-auto px-6 py-10 md:px-10 md:py-14">
      <div className="flex flex-col gap-6 text-center">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyber-blue mb-2">Wallet</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Connect to Build on Base Sepolia
          </h2>
        </div>
        <p className="text-base md:text-lg text-gray-300">
          Link your wallet to start collaborating on-chain. We&apos;ll automatically align your session
          with the {baseSepolia.name} test network so every beat you create lands where it belongs.
        </p>
        <div className="flex flex-col items-center gap-3">
          <WalletConnectButton />
          <div className="text-xs md:text-sm text-gray-400">
            <span className="font-semibold text-cyber-orange">Current Network:</span>{' '}
            {baseSepolia.name}
            {address ? ' · Connected' : ' · Awaiting Connection'}
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Need Base Sepolia ETH? Use the official faucet at{' '}
          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyber-blue hover:text-cyber-orange transition-colors"
          >
            circle.com
          </a>
          {' '}before minting or contributing.
        </p>
      </div>
    </section>
  );
};

export default ConnectWalletSection;
