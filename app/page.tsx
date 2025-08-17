"use client";

import React from 'react';
import Link from 'next/link';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-5xl font-bold mb-4">Welcome to BeatChain</h1>
      <p className="text-xl mb-8">
        The decentralized music platform for artists and fans.
      </p>
      <Link
        href="/tracks"
        className="bg-cyber-orange text-black px-8 py-3 rounded-md text-lg font-bold hover:bg-orange-400 transition-colors"
      >
        Explore Tracks
      </Link>
    </div>
  );
};

export default Home;
