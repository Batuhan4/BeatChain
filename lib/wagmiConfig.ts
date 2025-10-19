'use client';

import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import farcasterMiniApp from '@farcaster/miniapp-wagmi-connector';

const appName = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME ?? 'BeatChain';
const appLogoUrl = process.env.NEXT_PUBLIC_ICON_URL;

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  connectors: [
    farcasterMiniApp(),
    injected({ target: 'metaMask', shimDisconnect: true }),
    injected({ target: 'phantom', shimDisconnect: true }),
    coinbaseWallet({
      appName,
      appLogoUrl,
      preference: 'all',
    }),
  ],
  ssr: true,
});
