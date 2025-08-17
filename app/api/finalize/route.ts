import { NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';

// Initialize Pinata
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
});

export async function POST(request: Request) {
  if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
    return NextResponse.json({ error: 'Pinata API keys are not configured.' }, { status: 500 });
  }

  try {
    const { beatId, segmentCIDs, contributors } = await request.json();

    if (!beatId || !segmentCIDs || !contributors || segmentCIDs.length !== 3) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    // --- Placeholder Logic ---
    // In a real implementation, you would:
    // 1. Fetch each audio file from IPFS using the segmentCIDs.
    // 2. Use a library like `fluent-ffmpeg` to concatenate the audio files.
    // 3. Upload the final combined audio file to Pinata to get a finalAudioCID.
    const finalAudioCID = 'QmPlaceholderFinalAudioCid'; // Mock CID

    // 4. Create the ERC-721 metadata JSON object.
    const metadata = {
      name: `BeatChain Beat #${beatId}`,
      description: 'A collaborative on-chain musical composition created on BeatChain.',
      image: `ipfs://QmPlaceholderFinalAudioCid`, // Should be the final audio CID
      attributes: [
        {
          trait_type: 'Contributor 1',
          value: contributors[0],
        },
        {
          trait_type: 'Contributor 2',
          value: contributors[1],
        },
        {
          trait_type: 'Contributor 3',
          value: contributors[2],
        },
      ],
    };

    // 5. Upload the metadata JSON to Pinata.
    const options = {
      pinataMetadata: {
        name: `BeatChain Metadata #${beatId}`,
      },
      pinataOptions: {
        cidVersion: 0 as const,
      },
    };
    const result = await pinata.pinJSONToIPFS(metadata, options);

    // 6. Return the metadata CID.
    return NextResponse.json({ metadataCID: result.IpfsHash }, { status: 200 });

  } catch (error) {
    console.error('Error in finalization:', error);
    return NextResponse.json({ error: 'Failed to finalize beat.' }, { status: 500 });
  }
}
