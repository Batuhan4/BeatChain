'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

// --- Helper function to convert AudioBuffer to WAV ---
const audioBufferToWav = (buffer: Tone.ToneAudioBuffer): Blob => {
  const audioBuffer = buffer.get() as AudioBuffer;
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [];
  let i = 0;
  let sample = 0;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(audioBuffer.sampleRate);
  setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this demo)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // write 16-bit sample
      pos += 2;
    }
    offset++; // next source sample
  }

  return new Blob([view], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
};


// --- Constants ---
const NUM_STEPS = 16; // 16 steps for a 4-second loop at 120 BPM
const DURATION_SECONDS = 4;
const NUM_TRACKS = 5;
const SAMPLE_NAMES = ['Kick', 'Snare', 'Hi-Hat', 'Clap', 'Cowbell'];
const SAMPLE_URLS = {
  Kick: '/samples/kick.wav',
  Snare: '/samples/snare.wav',
  'Hi-Hat': '/samples/hi-hat.wav',
  Clap: '/samples/clap.wav',
  Cowbell: '/samples/cowbell.wav',
};

// --- Sequencer Component ---
const Sequencer = ({ onExport }: { onExport: (audioBlob: Blob) => void }) => {
  const [grid, setGrid] = useState(() => Array(NUM_TRACKS).fill(null).map(() => Array(NUM_STEPS).fill(false)));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const players = useRef<Tone.Players | null>(null);
  const sequence = useRef<Tone.Sequence | null>(null);
  const gridRef = useRef(grid);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  useEffect(() => {
    players.current = new Tone.Players({
      urls: SAMPLE_URLS,
      onload: () => {
        setIsLoaded(true);
        console.log('Samples loaded');
      },
    }).toDestination();

    return () => {
      players.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    sequence.current = new Tone.Sequence(
      (time, step) => {
        const currentGrid = gridRef.current;
        currentGrid.forEach((track, trackIndex) => {
          if (track[step] && players.current) {
            const sampleName = SAMPLE_NAMES[trackIndex];
            players.current.player(sampleName).start(time);
          }
        });
        Tone.Draw.schedule(() => setCurrentStep(step), time);
      },
      Array.from({ length: NUM_STEPS }, (_, i) => i),
      '16n'
    ).start(0);

    return () => {
      sequence.current?.dispose();
      setCurrentStep(0);
    };
  }, [isLoaded]);

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    const newGrid = grid.map((track, i) =>
      i === trackIndex ? track.map((step, j) => (j === stepIndex ? !step : step)) : track
    );
    setGrid(newGrid);
  };

  const togglePlayback = async () => {
    if (!isLoaded) return;
    if (Tone.context.state !== 'running') await Tone.start();
    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const handleExport = useCallback(async () => {
    if (!isLoaded || !players.current) return;
    setIsRendering(true);
    
    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
    }

    try {
      const gridSnapshot = grid.map((track) => [...track]);
      const livePlayers = players.current;

      const buffer = await Tone.Offline(({ transport }) => {
        if (!livePlayers) {
          throw new Error('Players not initialized');
        }

        const loadedBuffers = SAMPLE_NAMES.reduce<Record<string, Tone.ToneAudioBuffer>>((acc, sampleName) => {
          const player = livePlayers.player(sampleName);
          if (!player.buffer || !player.buffer.loaded) {
            throw new Error(`Sample ${sampleName} failed to load`);
          }
          acc[sampleName] = player.buffer;
          return acc;
        }, {});

        const offlinePlayers = new Tone.Players(loadedBuffers).toDestination();

        new Tone.Sequence(
          (time, step) => {
            gridSnapshot.forEach((track, trackIndex) => {
              if (track[step]) {
                const sampleName = SAMPLE_NAMES[trackIndex];
                offlinePlayers.player(sampleName).start(time);
              }
            });
          },
          Array.from({ length: NUM_STEPS }, (_, i) => i),
          '16n'
        ).start(0);
        
        transport.start();
      }, DURATION_SECONDS);

      const wavBlob = audioBufferToWav(new Tone.ToneAudioBuffer(buffer));
      setDownloadUrl((previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }
        return URL.createObjectURL(wavBlob);
      });
      onExport(wavBlob);

    } catch (error) {
      console.error("Error rendering audio:", error);
    } finally {
      setIsRendering(false);
    }
  }, [isLoaded, grid, isPlaying, onExport]);

  return (
    <div className="bg-black/30 p-2 md:p-6 rounded-lg shadow-lg border border-cyber-orange/30 w-full">
      <div className="flex gap-2">
        {/* Sample Labels */}
        <div className="hidden md:flex flex-col gap-1 md:gap-2 w-24">
          {SAMPLE_NAMES.map((name) => (
            <div key={name} className="bg-gray-800/50 rounded flex items-center justify-center h-12 text-sm text-cyber-orange">
              {name}
            </div>
          ))}
        </div>

        {/* Sequencer Grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="grid grid-cols-16 gap-1 md:gap-2 min-w-[480px]">
            {grid.map((track, trackIndex) => (
              <React.Fragment key={trackIndex}>
                {track.map((step, stepIndex) => (
                  <div
                    key={`${trackIndex}-${stepIndex}`}
                    onClick={() => toggleStep(trackIndex, stepIndex)}
                    className={`w-full h-14 md:h-12 rounded cursor-pointer transition-all duration-150 border-2
                      ${stepIndex === currentStep && isPlaying ? 'border-cyber-blue scale-105' : 'border-transparent'}
                      ${step ? 'bg-cyber-orange' : 'bg-gray-700/50 hover:bg-gray-600/50'}
                    `}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex justify-center items-center space-x-4">
        <button
          onClick={togglePlayback}
          disabled={!isLoaded || isRendering}
          className="bg-cyber-orange text-black font-bold py-3 px-8 rounded-md hover:bg-orange-400 transition-colors disabled:bg-gray-600"
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
        <button
          onClick={handleExport}
          disabled={!isLoaded || isRendering}
          className="bg-cyber-blue text-black font-bold py-3 px-8 rounded-md hover:bg-blue-300 transition-colors disabled:bg-gray-600"
        >
          {isRendering ? 'Rendering...' : 'Export WAV'}
        </button>
      </div>
      {downloadUrl && (
        <div className="mt-4 text-center">
          <a
            href={downloadUrl}
            download="beat-segment.wav"
            className="inline-block bg-cyber-blue/80 hover:bg-cyber-blue text-black font-semibold py-2 px-6 rounded-md transition-colors"
          >
            Download Last Export
          </a>
        </div>
      )}
      {!isLoaded && <p className="text-center mt-4 text-gray-400 animate-pulse">Loading Samples...</p>}
    </div>
  );
};

export default Sequencer;
