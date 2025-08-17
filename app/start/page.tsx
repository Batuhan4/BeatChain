'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sequencer from '../components/Sequencer';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractConfig } from '../../lib/contract';

const StartBeatPage = () => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
      onSuccess(data) {
        console.log('Transaction confirmed:', data);
        // TODO: Parse the event log to get the new beatId
        const newBeatId = 1; // Placeholder
        router.push(`/beat/${newBeatId}`);
      },
    });

  const handleExportedAudio = (blob: Blob) => {
    console.log('Received exported audio blob:', blob);
    setAudioBlob(blob);
  };

  const handleStartBeat = async () => {
    if (!audioBlob) {
      alert('Please export your audio track first!');
      return;
    }

    setIsUploading(true);
    
    // --- Mock Backend Upload ---
    console.log('Simulating upload to Pinata...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    const mockCid = 'QmPlaceholderCidForNewBeat';
    console.log('Mock CID received:', mockCid);
    setIsUploading(false);
    // --- End Mock ---

    // Call the smart contract
    writeContract({
      ...contractConfig,
      functionName: 'startBeat',
      args: [mockCid],
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">Create a New Beat</h1>
        <p className="text-lg text-gray-400">
          Lay down the first 4-second track. Click the grid to create your rhythm.
        </p>
      </div>
      
      <Sequencer onExport={handleExportedAudio} />

      <div className="mt-8 text-center">
        {audioBlob && (
          <div className="mb-4">
            <p className="text-green-500">Audio exported successfully!</p>
            <button 
              onClick={handleStartBeat}
              disabled={isUploading || isPending || isConfirming}
              className="bg-green-600 text-white font-bold py-3 px-10 rounded-full hover:bg-green-500 transition-colors text-xl disabled:bg-gray-500 mt-2"
            >
              {isUploading ? 'Uploading...' : isPending ? 'Confirm in wallet...' : isConfirming ? 'Writing to chain...' : 'Start Beat On-Chain'}
            </button>
          </div>
        )}
        {isConfirmed && <p className="text-green-500">Success! Your Beat is on-chain.</p>}
        {error && (
          <div className="text-red-500 mt-2">
            <p>Error: {error.shortMessage || error.message}</p>
            <p>Note: This will fail until a valid contract address is provided.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartBeatPage;
