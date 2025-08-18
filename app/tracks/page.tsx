'use client';

import React from 'react';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { contractConfig } from '../../lib/contract';
import { Address } from 'viem';

import { BeatStatus, BeatData } from '../../lib/types';

type BeatTuple = [bigint, BeatStatus, Address[], string[], number, boolean];

// --- BeatCard Component ---
const BeatCard = ({ beatId }: { beatId: bigint }) => {
  const { data: beatData, isLoading, error } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'beats',
    args: [beatId],
  });

  if (isLoading) {
    return <div className="bg-gray-800 p-4 rounded-lg animate-pulse h-36"></div>;
  }

  // Manually construct the Beat object from the returned tuple
  const beat: BeatData | null = beatData ? {
    id: (beatData as BeatTuple)[0],
    status: (beatData as BeatTuple)[1],
    // contributors and segmentCIDs are nested arrays in the tuple
    contributors: (beatData as BeatTuple)[2], 
    segmentCIDs: (beatData as BeatTuple)[3],
    segmentCount: (beatData as BeatTuple)[4],
    isMinted: (beatData as BeatTuple)[5],
  } : null;

  if (error || !beat || beat.id === 0n) {
    return <div className="bg-gray-800 p-4 rounded-lg border border-red-500/50">Error loading Beat #{beatId.toString()}</div>;
  }

  const isCompleted = beat.status === BeatStatus.Completed;
  const cardColor = isCompleted ? 'border-cyber-blue/50' : 'border-cyber-orange/50';

  return (
    <Link href={`/beat/${beat.id.toString()}`} className="block">
      <div className={`bg-black/30 p-4 rounded-lg border ${cardColor} hover:bg-gray-900/80 transition-colors h-full`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl md:text-2xl font-bold text-cyber-orange">Beat #{beat.id.toString()}</h3>
          <span className={`text-xs md:text-sm font-bold px-2 py-1 rounded-md ${isCompleted ? 'bg-cyber-blue/20 text-cyber-blue' : 'bg-yellow-500/20 text-yellow-500'}`}>
            {BeatStatus[beat.status]}
          </span>
        </div>
        <p className="text-gray-400 text-sm md:text-base">
          {beat.segmentCount} / 3 Segments
        </p>
        {beat.isMinted && <p className="text-cyber-purple text-xs mt-1 font-bold">Minted NFT</p>}
      </div>
    </Link>
  );
};


// --- Tracks Page ---
const TracksPage = () => {
  const { data: totalBeats, isLoading, error } = useReadContract({
    ...contractConfig,
    functionName: 'getTotalBeats',
  });

  if (isLoading) {
    return <div className="text-center p-10 animate-pulse">Loading total beats...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error loading beats: {error.message}</div>;
  }

  const totalBeatsNum = totalBeats ? Number(totalBeats) : 0;
  const beatIds = Array.from({ length: totalBeatsNum }, (_, i) => BigInt(i + 1)).reverse();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-cyber-orange mb-2">All Beats</h1>
        <p className="text-lg text-gray-400">
          Explore all on-chain beats. Click one to contribute or mint.
        </p>
      </div>

      {beatIds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {beatIds.map(id => (
            <BeatCard key={id.toString()} beatId={id} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No beats have been created yet.</p>
      )}
    </div>
  );
};

export default TracksPage;