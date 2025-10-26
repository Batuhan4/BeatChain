'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sequencer from '../components/Sequencer';
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { contractConfig } from '../../lib/contract';
import { BeatStatus } from '../../lib/types';
import { decodeEventLog, Address } from 'viem';

const StartBeatPage = () => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMintFinalizing, setIsMintFinalizing] = useState(false);
  const [mintBeatIdInput, setMintBeatIdInput] = useState('');
  const [mintLocalError, setMintLocalError] = useState<string | null>(null);
  const router = useRouter();
  const publicClient = usePublicClient();

  const {
    data: startHash,
    error: startError,
    isPending: isStartPending,
    writeContract: writeStartContract,
  } = useWriteContract();

  const {
    data: startReceipt,
    isLoading: isStartConfirming,
    isSuccess: isStartConfirmed,
  } = useWaitForTransactionReceipt({ hash: startHash });

  const {
    data: mintHash,
    error: mintError,
    isPending: isMintPending,
    writeContract: writeMintContract,
  } = useWriteContract();

  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } =
    useWaitForTransactionReceipt({ hash: mintHash });

  useEffect(() => {
    if (isStartConfirmed && startReceipt) {
      console.log('Transaction confirmed:', startReceipt);
      // Parse the event log to get the new beatId
      try {
        const extractBeatIdFromEventArgs = (args: unknown): bigint | null => {
          if (Array.isArray(args)) {
            const firstArg = args[0];
            if (typeof firstArg === 'bigint') return firstArg;
            if (typeof firstArg === 'string') {
              try {
                return BigInt(firstArg);
              } catch {
                return null;
              }
            }
            return null;
          }
          if (args && typeof args === 'object') {
            const record = args as Record<string, unknown>;
            if ('beatId' in record) {
              const potentialBeatId = record.beatId;
              if (typeof potentialBeatId === 'bigint') return potentialBeatId;
              if (typeof potentialBeatId === 'string') {
                try {
                  return BigInt(potentialBeatId);
                } catch {
                  return null;
                }
              }
            }
          }
          return null;
        };

        const beatStartedEvent = startReceipt.logs
          .map(log => {
            try {
              return decodeEventLog({
                abi: contractConfig.abi,
                data: log.data,
                topics: log.topics,
              });
            } catch {
              return null;
            }
          })
          .find(event => event?.eventName === 'BeatStarted');

        if (beatStartedEvent) {
          const newBeatId = extractBeatIdFromEventArgs(beatStartedEvent.args);
          if (newBeatId !== null) {
            router.push(`/beat/${newBeatId}`);
          } else {
            console.warn('BeatStarted event found, but beatId could not be parsed from args:', beatStartedEvent.args);
          }
        }
      } catch (e) {
        console.error('Error parsing event log:', e);
      }
    }
  }, [isStartConfirmed, startReceipt, router]);

  useEffect(() => {
    if (isMintConfirmed) {
      setMintBeatIdInput('');
    }
  }, [isMintConfirmed]);

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
    let cid = '';

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'beat-segment.wav');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      cid = data.cid;
      console.log('Successfully uploaded to Pinata. CID:', cid);

    } catch (uploadError) {
      console.error(uploadError);
      alert(`Error uploading to IPFS: ${(uploadError as Error).message}`);
      setIsUploading(false);
      return;
    } finally {
      setIsUploading(false);
    }

    // Call the smart contract
    writeStartContract({
      ...contractConfig,
      functionName: 'startBeat',
      args: [cid],
    });
  };

  const handleMintExistingBeat = async () => {
    setMintLocalError(null);

    if (!mintBeatIdInput.trim()) {
      setMintLocalError('Enter a Beat ID to mint.');
      return;
    }

    if (!publicClient) {
      setMintLocalError('Blockchain client not ready.');
      return;
    }

    let beatId: bigint;
    try {
      beatId = BigInt(mintBeatIdInput.trim());
    } catch {
      setMintLocalError('Beat ID must be a valid number.');
      return;
    }

    setIsMintFinalizing(true);

    try {
      const beatDetails = await publicClient.readContract({
        ...contractConfig,
        functionName: 'getBeatDetails',
        args: [beatId],
      }) as [bigint, number, readonly Address[], readonly string[], number, boolean];

      const [id, status, contributors, segmentCIDs, , alreadyMinted] = beatDetails;

      if (id === 0n) {
        throw new Error('Beat not found on-chain.');
      }

      if (Number(status) !== BeatStatus.Completed) {
        throw new Error('Beat is not completed yet.');
      }

      if (alreadyMinted) {
        throw new Error('Beat has already been minted.');
      }

      const filteredContributors = contributors.filter(
        (c) => c !== '0x0000000000000000000000000000000000000000'
      );

      const filteredCids = segmentCIDs.filter((cid) => cid);

      if (filteredCids.length !== 3) {
        throw new Error('Beat is missing segment audio on IPFS.');
      }

      const finalizeResponse = await fetch('/api/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beatId: beatId.toString(),
          segmentCIDs: filteredCids,
          contributors: filteredContributors,
        }),
      });

      const finalizeData = await finalizeResponse.json();

      if (!finalizeResponse.ok) {
        throw new Error(finalizeData.error || 'Failed to prepare metadata for minting.');
      }

      writeMintContract({
        ...contractConfig,
        functionName: 'mint',
        args: [beatId, finalizeData.metadataCID],
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error while preparing mint.';
      setMintLocalError(message);
    } finally {
      setIsMintFinalizing(false);
    }
  };

  const mintButtonLabel = () => {
    if (isMintFinalizing) return 'Preparing metadata...';
    if (isMintPending) return 'Confirm in wallet...';
    if (isMintConfirming) return 'Minting on-chain...';
    return 'Mint as NFT';
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
            <p className="text-cyber-blue">Audio exported successfully!</p>
            <button 
              onClick={handleStartBeat}
              disabled={isUploading || isStartPending || isStartConfirming}
              className="bg-cyber-blue text-black font-bold py-3 px-10 rounded-md hover:bg-blue-300 transition-colors text-lg disabled:bg-gray-600 mt-2"
            >
              {isUploading ? 'Uploading to IPFS...' : isStartPending ? 'Confirm in wallet...' : isStartConfirming ? 'Writing to chain...' : 'Start Beat On-Chain'}
            </button>
          </div>
        )}
        {isStartConfirmed && <p className="text-green-500 mt-4">Success! Your Beat is on-chain. Redirecting...</p>}
        {startError && (
          <div className="text-red-500 mt-4 bg-red-500/10 p-3 rounded-md">
            <p className="font-bold">Error:</p>
            <p className="text-sm">{startError.message}</p>
          </div>
        )}
      </div>

      <div className="mt-12 max-w-2xl mx-auto bg-black/30 border border-cyber-orange/30 rounded-lg p-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-cyber-orange mb-3 text-center">
          Mint a Completed Beat as an NFT
        </h2>
        <p className="text-sm md:text-base text-gray-400 text-center mb-6">
          Already finished a beat? Enter its on-chain ID to bundle the audio from IPFS and mint the official BeatChain NFT.
        </p>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={mintBeatIdInput}
            onChange={(event) => setMintBeatIdInput(event.target.value)}
            placeholder="Enter completed Beat ID"
            className="flex-1 bg-black/50 border border-gray-700 rounded-md px-4 py-2 text-sm md:text-base focus:outline-none focus:border-cyber-blue transition-colors"
          />
          <button 
            onClick={handleMintExistingBeat}
            disabled={!mintBeatIdInput.trim() || isMintFinalizing || isMintPending || isMintConfirming}
            className="bg-cyber-purple text-white font-bold py-2.5 px-6 rounded-md hover:bg-purple-500 transition-colors disabled:bg-gray-700 disabled:text-gray-300"
          >
            {mintButtonLabel()}
          </button>
        </div>
        {(mintLocalError || mintError) && (
          <div className="text-red-400 bg-red-500/10 mt-4 px-4 py-3 rounded-md text-sm">
            {mintLocalError || mintError?.message}
          </div>
        )}
        {isMintConfirmed && (
          <p className="text-green-500 mt-4 text-center">
            Mint transaction submitted! Check your wallet for confirmation.
          </p>
        )}
      </div>
    </div>
  );
};

export default StartBeatPage;
