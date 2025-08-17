import React from 'react';
import Sequencer from '../components/Sequencer';

const StartBeatPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">Create a New Beat</h1>
        <p className="text-lg text-gray-400">
          Lay down the first 4-second track. Click the grid to create your rhythm.
        </p>
      </div>
      
      <Sequencer />

      <div className="mt-8 text-center">
        <button 
          className="bg-green-600 text-white font-bold py-3 px-10 rounded-full hover:bg-green-500 transition-colors text-xl"
          // onClick={handleStartBeat} // This will be implemented next
        >
          Start Beat on-chain
        </button>
        <p className="text-sm text-gray-500 mt-2">
          This will require a transaction to publish your beat.
        </p>
      </div>
    </div>
  );
};

export default StartBeatPage;
