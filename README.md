# 🏆 BeatChain took 1st place at the [Ankara | Base Mini-App Hyperthon](https://luma.com/fjn8xpmt)! 🚀

## BeatChain 🎵⛓️

![BeatChain Logo](./public/logo.png)

**BeatChain** is a decentralized and collaborative music protocol built on Farcaster and the Base blockchain. It transforms music creation into a social, sequential, and ownable experience. Users collaboratively build 12-second musical tracks ("Beats") by adding 4-second layers. Each contribution is recorded on-chain, and the final, completed Beat can be minted as a permanent, co-authored NFT.

Our vision is to create a fully on-chain creative protocol where digital music is collaboratively built, verifiably owned, and seamlessly shared.

## Screenshot

![BeatChain Screenshot](./example/Screenshot%20from%202025-08-17%2020-55-06.png)

## Core User Flow

1.  **Initiation (User A):** A user clicks a "Start a new Beat!" Frame. They are directed to the BeatChain Mini App. They create their 4-second segment in the sequencer. Upon submission, the app uploads the audio segment to **Pinata (IPFS)**, gets the content identifier (CID), and prompts the user to sign a transaction to the **BeatChain smart contract**. This transaction creates the new Beat on-chain, storing the IPFS CID of the first segment. The user pays a gas fee. The Frame updates to show a "Continue the Beat!" button.
2.  **Collaboration (User B):** Clicks "Continue the Beat!". In the app, they create the next 4-second segment. Upon submission, the audio is uploaded to Pinata, and User B is prompted to sign a transaction that calls the `addSegment` function on the smart contract, passing the new IPFS CID. They pay a gas fee.
3.  **Completion (User C):** Repeats the process for the final segment. When their transaction is confirmed, the smart contract automatically marks the Beat as **"Completed"** and ready for minting.
4.  **Frame Update:** The Farcaster Frame now updates its button to say **"Mint this Beat!"**.
5.  **Minting (Any User):** A user clicks the "Mint this Beat!" button and is taken to the completed track page. They click a "Mint NFT" button, sign a final transaction, and pay a gas fee. The smart contract mints the Beat NFT to their wallet. The NFT's metadata points to the final audio file and lists the three contributors.

## Features

*   **Decentralized & Collaborative:** Music creation as a social experience on the Base blockchain.
*   **On-Chain Ownership:** Each contribution is recorded on-chain, and completed Beats can be minted as NFTs.
*   **Farcaster Integration:** Seamless user experience from a Farcaster Frame to the dApp.
*   **IPFS Storage:** All audio segments and metadata are stored on IPFS via Pinata.
*   **ERC-721 NFTs:** Completed Beats are minted as ERC-721 NFTs.

## Technical Stack

*   **Frontend:** Next.js, React, TypeScript, Wagmi, Tone.js
*   **Smart Contract:** Solidity, OpenZeppelin
*   **Blockchain:** Base
*   **Storage:** Pinata (IPFS)
*   **Backend:** Node.js (Serverless Functions on Vercel)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js
*   pnpm

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username_/BeatChain.git
    ```
2.  Install NPM packages
    ```sh
    pnpm install
    ```
3.  Start the development server
    ```sh
    pnpm dev
    ```

## License

Distributed under the MIT License. See `LICENSE` for more information.
