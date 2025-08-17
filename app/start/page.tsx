'use client';

import React from 'react';
import Sequencer from '../components/Sequencer';

const StartBeatPage = () => {

  const handleExportedAudio = (audioBlob: Blob) => {
    console.log('Received exported audio blob:', audioBlob);
    // Next step: upload this blob to Pinata via our backend
  };

  const handleStartBeat = () => {
    // This will be triggered after the audio is exported and uploaded
    console.log('Initiating startBeat on-chain transaction...');
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
        <p className="text-sm text-gray-500 mt-2">
          Click "Export WAV" in the sequencer to prepare your track for the chain.
        </p>
      </div>
    </div>
  );
};

export default StartBeatPage;
