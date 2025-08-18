---

### **BeatChain - Product Requirements Document (On-Chain Version)**

* **Product:** BeatChain
* **Version:** 2.0
* **Date:** August 17, 2025
* **Status:** Official Plan

### 1. Introduction & Vision

**BeatChain** is a decentralized and collaborative music protocol built on Farcaster and the Base blockchain. It transforms music creation into a social, sequential, and ownable experience. Users collaboratively build 12-second musical tracks ("Beats") by adding 4-second layers. Each contribution is recorded on-chain, and the final, completed Beat can be minted as a permanent, co-authored NFT.

Our vision is to create a fully on-chain creative protocol where digital music is collaboratively built, verifiably owned, and seamlessly shared.

### 2. Product Goals & Success Metrics

* **Goal 1: Launch a functional dApp (Decentralized Application).**
    * **Metric:** A deployed application where users can successfully contribute to a Beat via a smart contract transaction and mint a completed Beat as an ERC-721 NFT.
* **Goal 2: Drive on-chain creative activity on the Base network.**
    * **Metrics:** Number of `addSegment` transactions on the smart contract, number of Beats minted as NFTs, number of unique wallets interacting with the contract.
* **Goal 3: Create a seamless "Frame-to-dApp-to-On-Chain" user experience.**
    * **Metric:** High conversion rate from users clicking the Frame to successfully submitting an on-chain contribution.

### 3. Target Audience

* **Primary:** Farcaster users, crypto-natives, on-chain artists, and hobbyist musicians looking for novel ways to create and own digital assets.
* **Secondary:** NFT collectors and participants in the broader Web3 ecosystem.

### 4. Core User Flow

1.  **Initiation (User A):** A user clicks a "Start a new Beat!" Frame. They are directed to the BeatChain Mini App. They create their 4-second segment in the sequencer. Upon submission, the app uploads the audio segment to **Pinata (IPFS)**, gets the content identifier (CID), and prompts the user to sign a transaction to the **BeatChain smart contract**. This transaction creates the new Beat on-chain, storing the IPFS CID of the first segment. The user pays a gas fee. The Frame updates to show a "Continue the Beat!" button.
2.  **Collaboration (User B):** Clicks "Continue the Beat!". In the app, they create the next 4-second segment. Upon submission, the audio is uploaded to Pinata, and User B is prompted to sign a transaction that calls the `addSegment` function on the smart contract, passing the new IPFS CID. They pay a gas fee.
3.  **Completion (User C):** Repeats the process for the final segment. When their transaction is confirmed, the smart contract automatically marks the Beat as **"Completed"** and ready for minting.
4.  **Frame Update:** The Farcaster Frame now updates its button to say **"Mint this Beat!"**.
5.  **Minting (Any User):** A user clicks the "Mint this Beat!" button and is taken to the completed track page. They click a "Mint NFT" button, sign a final transaction, and pay a gas fee. The smart contract mints the Beat NFT to their wallet. The NFT's metadata points to the final audio file and lists the three contributors.

### 5. Functional Requirements (MVP Scope)

**FR-1: Smart Contract (on Base)**
* Must be written in Solidity and deployed on the Base network.
* Must implement the ERC-721 standard for NFTs.
* Must have a data structure (`struct`) to store Beat metadata: a list of contributor addresses, an array of the IPFS CIDs for each of the 3 audio segments, and a status (In-Progress/Completed).
* Must have a public `startBeat(string memory segmentCID)` function that creates a new Beat and records the first contributor.
* Must have a public `addSegment(uint256 beatId, string memory segmentCID)` function that allows a new user to add their segment's IPFS CID.
* Must have a public `mint(uint256 beatId)` function that allows a user to mint a *completed* Beat as an NFT.
* The NFT's `tokenURI` must point to a metadata JSON file (also on IPFS) that includes the final audio and the list of creators.

**FR-2: Sequencer & Web App**
* The interface must provide a pre-defined library of 5-6 audio samples.
* The interface must feature a grid-based, 4-second timeline.
* The app must render the user's arrangement into an audio file on the client-side.

**FR-3: Backend Service (Off-Chain Helper)**
* The backend's primary role is to upload audio files to **Pinata** and return the IPFS CID to the frontend.
* It will also be used to combine the three audio segments into a final track, upload *that* to Pinata, and generate the final metadata JSON for the NFT.

**FR-4: Farcaster Frame Integration**
* The Frame's state must be driven by data read from the smart contract.
* It must display "Continue the Beat!" for in-progress Beats and "Mint this Beat!" for completed ones.

**FR-5: Completed Track Page**
* Must display an audio player for the final 12-second track.
* Must display the Farcaster wallet addresses of the 3 contributors by reading them from the smart contract.
* Must feature a "Mint NFT" button that initiates the minting transaction via Wagmi.

### 6. Technical Requirements & Stack

* **Frontend:**
    * **Framework:** `Vite + React + TypeScript`.
    * **Wallet Connection:** `Wagmi`. Used to get the user's address and to prompt them to sign all required smart contract transactions.
    * **Web Audio Library:** `Tone.js`. For client-side audio sequencing and rendering.
    * **Farcaster Frames Library:** `Frames.js` or `Frog`.

* **Smart Contract:**
    * **Blockchain:** `Base`.
    * **Language:** `Solidity`.
    * **Development Environment:** `Foundry` or `Hardhat`.
    * **NFT Standard:** `ERC-721`.

* **Storage (Decentralized):**
    * **Service:** `Pinata`. To store all audio segments, the final combined audio track, and the NFT metadata JSON files via IPFS.

* **Backend (Helper Service):**
    * **Runtime & Deployment:** `Node.js` deployed as **Serverless Functions** (e.g., on Vercel).
    * **SDKs:** `Pinata SDK` for uploading files.

### 7. Design & Theme

* **Platform:** This will be a mobile-first application. The design must be responsive and optimized for mobile devices.
* **Theme:** The application will have a black and orange cyberpunk theme. Additional colors can be used to complement this theme.

### 8. Out of Scope for MVP (Future Roadmap)

* **Royalty Splits:** The smart contract will not automatically split minting fees or secondary sales royalties among the three creators.
* **Marketplace:** There will be no built-in marketplace to trade BeatChain NFTs. Users will use platforms like OpenSea.
* **DAO Governance:** The platform will not be governed by a DAO in the MVP.
* Advanced social features, user profiles, or leaderboards.
* Adding new sound packs or uploading custom sounds.
