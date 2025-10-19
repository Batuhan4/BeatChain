"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { sdk } from '@farcaster/miniapp-sdk';
import ConnectWalletSection from './components/ConnectWalletSection';

const Home = () => {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <>
      <div className="container mx-auto px-4 py-12 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          Welcome to BeatChain
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          A decentralized and collaborative music protocol. Create, contribute to, and own musical moments on the Base blockchain.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link
            href="/start"
            className="bg-cyber-orange text-black px-8 py-3 rounded-md text-lg font-bold hover:bg-orange-400 transition-colors w-full md:w-auto"
          >
            Create a New Beat
          </Link>
          <Link
            href="/tracks"
            className="bg-transparent border-2 border-cyber-blue text-cyber-blue px-8 py-3 rounded-md text-lg font-bold hover:bg-cyber-blue hover:text-black transition-colors w-full md:w-auto"
          >
            Explore All Beats
          </Link>
        </div>
      </div>
      <div className="px-4 pb-16">
        <ConnectWalletSection />
      </div>
    </>
  );
};

export default Home;
