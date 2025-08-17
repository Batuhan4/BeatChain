'use client';

import React from 'react';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { contractConfig } from '../../lib/contract';
import { Address } from 'viem';

// --- Types ---
enum BeatStatus { InProgress, Completed }
type Beat = {
  id: bigint;
  status: BeatStatus;
  contributors: Address[];
  segmentCIDs: string[];
  segmentCount: number;
  isMinted: boolean;
};

// --- BeatCard Component ---
const BeatCard = ({ beatId }: { beatId: bigint }) => {
  const { data: beat, isLoading, error } = useReadContract({
    ...contractConfig,
    functionName: 'beats',
    args: [beatId],
  }) as { data: Beat, isLoading: boolean, error: Error | null };

  if (isLoading) {
    return <div className="bg-gray-800 p-4 rounded-lg animate-pulse h-36"></div>;
  }

  if (error || !beat || beat.id === 0n) {
    return <div className="bg-gray-800 p-4 rounded-lg border border-red-500/50">Error loading Beat #{beatId.toString()}</div>;
  }

  const isCompleted = beat.status === BeatStatus.Completed;
  const cardColor = isCompleted ? 'border-green-500/50' : 'border-yellow-500/50';

  return (
    <Link href={`/beat/${beat.id.toString()}`}>
      <div className={`bg-gray-900/50 p-4 rounded-lg border ${cardColor} hover:bg-gray-800 transition-colors`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-2xl font-bold text-orange-500">Beat #{beat.id.toString()}</h3>
          <span className={`text-sm font-bold ${isCompleted ? 'text-green-500' : 'text-yellow-500'}`}>
            {BeatStatus[beat.status]}
          </span>
        </div>
        <p className="text-gray-400">
          {beat.segmentCount} / 3 Segments
        </p>
        {beat.isMinted && <p className="text-purple-400 text-xs mt-1">Minted NFT</p>}
      </div>
    </Link>
  );
};


// --- Tracks Page ---
const TracksPage = () => {
  // NOTE: The current contract doesn't have a way to get the total number of beats.
  // This is a crucial feature for this page. I am simulating it with a hardcoded value.
  // The ideal solution is to add `_beatIdCounter.current()` to the contract as a public view function.
  const MOCK_TOTAL_BEATS = 5; // Simulate 5 beats having been created

  const beatIds = Array.from({ length: MOCK_TOTAL_BEATS }, (_, i) => BigInt(i + 1));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">All Tracks</h1>
        <p className="text-lg text-gray-400">
          Explore all the in-progress and completed beats on-chain.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beatIds.map(id => (
          <BeatCard key={id.toString()} beatId={id} />
        ))}
      </div>
    </div>
  );
};

export default TracksPage;