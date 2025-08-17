'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

// --- Constants ---
const NUM_STEPS = 16; // 16 steps for a 4-second loop at 120 BPM
const NUM_TRACKS = 6;
const SAMPLE_NAMES = ['Kick', 'Snare', 'Hi-Hat', 'Clap', 'Cowbell', 'Tom'];

// --- Tone.js Setup ---
// Using a ref to ensure Tone.js objects are not re-created on every render
const useTonePlayers = () => {
  const players = useRef<Tone.Players | null>(null);

  useEffect(() => {
    // This setup runs once on component mount
    players.current = new Tone.Players({
      urls: {
        Kick: '/samples/kick.wav',
        Snare: '/samples/snare.wav',
        'Hi-Hat': '/samples/hihat.wav',
        Clap: '/samples/clap.wav',
        Cowbell: '/samples/cowbell.wav',
        Tom: '/samples/tom.wav',
      },
      baseUrl: 'https://tonejs.github.io/audio/drum-samples/acoustic-kit/',
      onload: () => {
        console.log('Samples loaded');
      },
    }).toDestination();

    // Cleanup on unmount
    return () => {
      players.current?.dispose();
    };
  }, []);

  return players;
};

// --- Sequencer Component ---
const Sequencer = () => {
  const [grid, setGrid] = useState(() =>
    Array(NUM_TRACKS)
      .fill(null)
      .map(() => Array(NUM_STEPS).fill(false))
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const players = useTonePlayers();
  const stepRef = useRef(currentStep);

  // Function to toggle a step in the grid
  const toggleStep = (trackIndex: number, stepIndex: number) => {
    const newGrid = grid.map((track, i) =>
      i === trackIndex
        ? track.map((step, j) => (j === stepIndex ? !step : step))
        : track
    );
    setGrid(newGrid);
  };

  // Effect to handle playback scheduling
  useEffect(() => {
    stepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    const loop = new Tone.Sequence(
      (time, step) => {
        // This callback is invoked for each step of the sequence
        grid.forEach((track, trackIndex) => {
          if (track[step] && players.current) {
            const sampleName = SAMPLE_NAMES[trackIndex];
            players.current.player(sampleName).start(time);
          }
        });
        // Update UI to show current step
        setCurrentStep(step);
      },
      Array.from({ length: NUM_STEPS }, (_, i) => i),
      '16n'
    ).start(0);

    return () => {
      loop.dispose();
      setCurrentStep(0);
    };
  }, [grid, players]);

  // Function to start/stop playback
  const togglePlayback = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-gray-900 p-4 md:p-8 rounded-lg shadow-lg border border-orange-500/30">
      <div className="grid grid-cols-16 gap-1 md:gap-2">
        {grid.map((track, trackIndex) => (
          <React.Fragment key={trackIndex}>
            {track.map((step, stepIndex) => (
              <div
                key={`${trackIndex}-${stepIndex}`}
                onClick={() => toggleStep(trackIndex, stepIndex)}
                className={`w-6 h-10 md:w-10 md:h-16 rounded cursor-pointer transition-all duration-150
                  ${stepIndex === currentStep && isPlaying ? 'bg-orange-400 scale-105' : ''}
                  ${step ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}
                `}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <button
          onClick={togglePlayback}
          className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-500 transition-colors"
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
      </div>
    </div>
  );
};

export default Sequencer;
