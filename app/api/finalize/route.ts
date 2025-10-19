import { NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Initialize Pinata
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
});

// Helper to fetch from IPFS
const fetchFromIPFS = async (cid: string): Promise<Buffer> => {
  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch CID ${cid} from IPFS.`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export async function POST(request: Request) {
  if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
    return NextResponse.json({ error: 'Pinata API keys are not configured.' }, { status: 500 });
  }

  try {
    const { beatId, segmentCIDs, contributors } = await request.json();

    if (!beatId || !segmentCIDs || !contributors || segmentCIDs.length !== 3) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    // 1. Fetch audio files from IPFS
    const audioBuffers = await Promise.all(segmentCIDs.map(fetchFromIPFS));

    // 2. Use fluent-ffmpeg to concatenate the audio files
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'beatchain-'));
    const tempFilePaths = audioBuffers.map((buffer, i) => {
      const filePath = path.join(tempDir, `segment-${i}.wav`);
      fs.writeFileSync(filePath, buffer);
      return filePath;
    });

    const finalAudioPath = path.join(tempDir, 'final-beat.wav');

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg();
      tempFilePaths.forEach(filePath => command.input(filePath));
      command
        .on('error', (err) => reject(err))
        .on('end', () => resolve())
        .mergeToFile(finalAudioPath, tempDir);
    });
    
    // 3. Upload the final combined audio file to Pinata
    const finalAudioStream = fs.createReadStream(finalAudioPath);
    const audioPinResult = await pinata.pinFileToIPFS(finalAudioStream, {
      pinataMetadata: { name: `BeatChain Final Beat #${beatId}` }
    });
    const finalAudioCID = audioPinResult.IpfsHash;

    // 4. Create the ERC-721 metadata JSON object.
    const metadata = {
      name: `BeatChain Beat #${beatId}`,
      description: 'A collaborative on-chain musical composition created on BeatChain.',
      image: `ipfs://${finalAudioCID}`,
      attributes: [
        { trait_type: 'Contributor 1', value: contributors[0] },
        { trait_type: 'Contributor 2', value: contributors[1] },
        { trait_type: 'Contributor 3', value: contributors[2] },
      ],
    };

    // 5. Upload the metadata JSON to Pinata.
    const result = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: { name: `BeatChain Metadata #${beatId}` }
    });

    // Clean up temp files
    fs.rmSync(tempDir, { recursive: true, force: true });

    // 6. Return the metadata CID.
    return NextResponse.json({ metadataCID: result.IpfsHash }, { status: 200 });

  } catch (error) {
    console.error('Error in finalization:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to finalize beat: ${errorMessage}` }, { status: 500 });
  }
}
