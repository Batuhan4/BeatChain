'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Sequencer from '../../components/Sequencer';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractConfig } from '../../../lib/contract';
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

const BeatPage = () => {
  const params = useParams();
  const beatId = params.beatId ? BigInt(params.beatId as string) : 0n;

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- Contract Hooks ---
  const { data: beat, isLoading: isReading, error: readError } = useReadContract({
    ...contractConfig,
    functionName: 'beats',
    args: [beatId],
    // Watch for changes to the contract state
    watch: true,
  }) as { data: Beat | null, isLoading: boolean, error: Error | null };

  const { data: hash, error: writeError, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  // --- Event Handlers ---
  const handleExportedAudio = (blob: Blob) => {
    setAudioBlob(blob);
    
    // Based on beat status, decide which action to take
    if (beat?.status === BeatStatus.InProgress) {
      handleAddSegment(blob);
    } else if (beat?.status === BeatStatus.Completed) {
      handleMint(blob);
    }
  };

  const handleAddSegment = async (blob: Blob) => {
    setIsUploading(true);
    console.log('Simulating upload for addSegment...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockCid = `QmPlaceholderCidForSegment${beat?.segmentCount || 0 + 1}`;
    setIsUploading(false);

    writeContract({
      ...contractConfig,
      functionName: 'addSegment',
      args: [beatId, mockCid],
    });
  };

  const handleMint = async (blob: Blob) => {
    setIsUploading(true);
    console.log('Simulating final metadata upload for mint...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockMetadataCid = 'QmPlaceholderForFinalMetadata';
    setIsUploading(false);

    writeContract({
      ...contractConfig,
      functionName: 'mint',
      args: [beatId, mockMetadataCid],
    });
  };

  // --- Render Logic ---
  if (isReading) {
    return <div className="text-center p-10">Loading Beat from the chain...</div>;
  }

  if (readError || !beat || beat.id === 0n) {
    return <div className="text-center p-10 text-red-500">
      Error loading beat. It may not exist or there was a network issue.
      <p className="text-sm text-gray-500 mt-2">{readError?.shortMessage}</p>
    </div>;
  }

  const isCompleted = beat.status === BeatStatus.Completed;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">
          Beat #{beat.id.toString()}
        </h1>
        <p className="text-lg text-gray-400">
          Status: <span className={isCompleted ? 'text-green-500' : 'text-yellow-500'}>{BeatStatus[beat.status]}</span>
          {beat.isMinted && <span className="text-purple-400 ml-2">(Minted as NFT)</span>}
        </p>
      </div>

      <div className="bg-gray-900/50 p-6 rounded-lg border border-orange-500/30 mb-8">
        <h3 className="text-2xl mb-4">Contributors</h3>
        <div className="flex flex-col space-y-2">
          {beat.contributors.map((c, i) => c !== '0x0000000000000000000000000000000000000000' && (
            <div key={i} className="bg-gray-800 p-3 rounded font-mono text-sm truncate">
              <span className="text-orange-400 mr-2">#{i + 1}:</span> {c}
            </div>
          ))}
        </div>
      </div>

      {isCompleted ? (
        <div className="text-center">
          <h2 className="text-3xl mb-4">Beat Completed!</h2>
          <p className="text-gray-400 mb-6">This masterpiece is ready to be minted as an NFT.</p>
          {/* TODO: Add audio player for the final track */}
          <button 
            onClick={() => handleMint(new Blob())} // Placeholder blob
            disabled={beat.isMinted || isPending || isConfirming}
            className="bg-purple-600 text-white font-bold py-3 px-10 rounded-full hover:bg-purple-500 transition-colors text-xl disabled:bg-gray-500"
          >
            {beat.isMinted ? 'Already Minted' : isPending ? 'Confirm...' : isConfirming ? 'Minting...' : 'Mint NFT'}
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-3xl text-center mb-4">Add the Next Segment</h2>
          <Sequencer onExport={handleExportedAudio} />
        </div>
      )}

      <div className="mt-4 text-center">
        {isConfirmed && <p className="text-green-500">Transaction Successful!</p>}
        {writeError && (
          <div className="text-red-500 mt-2">
            <p>Error: {writeError.shortMessage || writeError.message}</p>
            <p>Note: This will fail until a valid contract address is provided.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeatPage;
