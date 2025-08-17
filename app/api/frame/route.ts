import { NextRequest, NextResponse } from 'next/server';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const { NEXT_PUBLIC_URL } = process.env;
  
  // TODO: This could be dynamic based on a specific beatId
  const imageUrl = `${NEXT_PUBLIC_URL}/splash.png`; 
  const postUrl = `${NEXT_PUBLIC_URL}/api/frame`; // The frame will post back to itself

  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>BeatChain Frame</title>
        <meta property="og:title" content="BeatChain Frame" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:post_url" content="${postUrl}" />
        <meta property="fc:frame:button:1" content="Start a New Beat" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="${NEXT_PUBLIC_URL}/start" />
      </head>
      <body>
        <h1>BeatChain Frame</h1>
        <p>This is a Farcaster Frame. View it in a compatible client.</p>
      </body>
    </html>
  `);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
