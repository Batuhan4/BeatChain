import { NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

// Initialize Pinata
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
});

export async function POST(request: Request) {
  if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
    return NextResponse.json(
      { error: 'Pinata API keys are not configured.' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Convert Blob to a readable stream
    const stream = Readable.from(Buffer.from(await file.arrayBuffer()));

    const options = {
      pinataMetadata: {
        name: `BeatChain Segment - ${new Date().toISOString()}`,
      },
      pinataOptions: {
        cidVersion: 0 as const,
      },
    };

    const result = await pinata.pinFileToIPFS(stream, options);

    return NextResponse.json({ cid: result.IpfsHash }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    return NextResponse.json(
      { error: 'Failed to upload file to IPFS.' },
      { status: 500 }
    );
  }
}
