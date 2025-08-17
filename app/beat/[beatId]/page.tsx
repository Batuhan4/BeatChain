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

  const [isUploading, setIsUploading] = useState(false);

  // --- Contract Hooks ---
  const { data: beatData, isLoading: isReading, error: readError } = useReadContract({
    ...contractConfig,
    functionName: 'beats',
    args: [beatId],
    watch: true,
  });

  const { data: hash, error: writeError, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  // Manually construct the Beat object from the returned tuple
  const beat: Beat | null = beatData ? {
    id: (beatData as any[])[0],
    status: (beatData as any[])[1],
    contributors: (beatData as any[])[2],
    segmentCIDs: (beatData as any[])[3],
    segmentCount: (beatData as any[])[4],
    isMinted: (beatData as any[])[5],
  } : null;

  // --- Event Handlers ---
  const handleExportedAudio = (blob: Blob) => {
    if (beat?.status === BeatStatus.InProgress) {
      handleAddSegment(blob);
    }
  };

  const handleAddSegment = async (blob: Blob) => {
    setIsUploading(true);
    let cid = '';
    try {
      const formData = new FormData();
      formData.append('file', blob, 'beat-segment.wav');
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      cid = data.cid;
    } catch (e) {
      alert(`Error uploading to IPFS: ${(e as Error).message}`);
      setIsUploading(false);
      return;
    } finally {
      setIsUploading(false);
    }
    writeContract({ ...contractConfig, functionName: 'addSegment', args: [beatId, cid] });
  };

  const handleMint = async () => {
    if (!beat) return;
    setIsUploading(true);
    let metadataCID = '';
    try {
      const response = await fetch('/api/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beatId: beat.id.toString(),
          segmentCIDs: beat.segmentCIDs,
          contributors: beat.contributors,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Finalization failed');
      metadataCID = data.metadataCID;
    } catch (e) {
      alert(`Error finalizing beat: ${(e as Error).message}`);
      setIsUploading(false);
      return;
    } finally {
      setIsUploading(false);
    }
    writeContract({ ...contractConfig, functionName: 'mint', args: [beatId, metadataCID] });
  };

  // --- Render Logic ---
  if (isReading) {
    return <div className="text-center p-10 animate-pulse">Loading Beat from the chain...</div>;
  }

  if (readError || !beat || beat.id === 0n) {
    return (
      <div className="text-center p-10 text-red-500">
        Error loading beat. It may not exist.
        <p className="text-sm text-gray-500 mt-2">{readError?.shortMessage}</p>
      </div>
    );
  }

  const isCompleted = beat.status === BeatStatus.Completed;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-cyber-orange mb-2">
          Beat #{beat.id.toString()}
        </h1>
        <p className="text-lg text-gray-400">
          Status: <span className={isCompleted ? 'text-cyber-blue' : 'text-yellow-500'}>{BeatStatus[beat.status]}</span>
          {beat.isMinted && <span className="text-cyber-purple ml-2">(Minted as NFT)</span>}
        </p>
      </div>

      <div className="bg-black/30 p-4 md:p-6 rounded-lg border border-cyber-orange/30 mb-8 max-w-2xl mx-auto">
        <h3 className="text-2xl mb-4">Contributors</h3>
        <div className="flex flex-col space-y-2">
          {beat.contributors.map((c, i) => c !== '0x0000000000000000000000000000000000000000' && (
            <div key={i} className="bg-gray-800/50 p-3 rounded font-mono text-sm truncate">
              <span className="text-cyber-orange mr-2">#{i + 1}:</span> {c}
            </div>
          ))}
        </div>
      </div>

      {isCompleted ? (
        <div className="text-center">
          <h2 className="text-3xl mb-4">Beat Completed!</h2>
          <p className="text-gray-400 mb-6">This masterpiece is ready to be minted as a permanent NFT.</p>
          <button 
            onClick={handleMint}
            disabled={beat.isMinted || isPending || isConfirming || isUploading}
            className="bg-cyber-purple text-white font-bold py-3 px-10 rounded-md hover:bg-purple-500 transition-colors text-xl disabled:bg-gray-600"
          >
            {beat.isMinted ? 'Already Minted' : isUploading ? 'Finalizing...' : isPending ? 'Confirm...' : isConfirming ? 'Minting...' : 'Mint NFT'}
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl text-center mb-4">Add Your 4-Second Segment</h2>
          <Sequencer onExport={handleExportedAudio} />
        </div>
      )}

      <div className="mt-4 text-center h-10">
        {isUploading && <p className="text-cyber-blue animate-pulse">Uploading to IPFS...</p>}
        {isConfirming && <p className="text-cyber-blue animate-pulse">Writing to the chain...</p>}
        {isConfirmed && <p className="text-green-500">Transaction Successful!</p>}
        {writeError && (
          <div className="text-red-500 mt-4 bg-red-500/10 p-3 rounded-md max-w-md mx-auto">
            <p className="font-bold">Error:</p>
            <p className="text-sm">{writeError.shortMessage || writeError.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeatPage;