# BeatChain Development Tasks

This document breaks down the development work for the BeatChain project based on the Product Requirements Document (PRD v2.0).

---

### Phase 1: Frontend Setup & Core Components

- [x] **Project Setup:** Initialize Next.js project, install dependencies, and set up Git repository.
- [x] **UI/UX Theme:** Implement the black and orange cyberpunk theme.
    - [x] Global styles (background, fonts, colors).
    - [x] Themed `Header` component.
    - [x] Themed `Footer` component.
- [ ] **Smart Contract Integration Setup:**
    - [ ] Get the deployed smart contract address and ABI.
    - [ ] Configure Wagmi and OnchainKit to connect to the Base network and the `BeatChain` contract.
    - [ ] Create a centralized file (`/lib/contract.ts`) to hold the contract address, ABI, and Wagmi hooks for interacting with it.
- [x] **Sequencer Component (`/components/Sequencer.tsx`):**
    - [x] Create a grid-based UI for arranging samples.
    - [x] Integrate `Tone.js` for audio playback.
    - [x] Implement play/stop functionality.
    - [ ] Implement client-side audio rendering to export the 4-second loop as a `.wav` or `.mp3` file.

---

### Phase 2: Core User Flow - On-Chain Interaction

- [ ] **Start Beat Page (`/start`):**
    - [x] Integrate the `Sequencer` component.
    - [ ] Implement the `handleStartBeat` function:
        - [ ] 1. Render the user's sequence to an audio file.
        - [ ] 2. **(Backend Task)** Upload the audio file to Pinata to get a CID.
        - [ ] 3. Prompt the user to sign the `startBeat` transaction via Wagmi, passing the new CID.
        - [ ] 4. On success, redirect the user to the "collaboration" page for the new beat (`/beat/[beatId]`).
- [ ] **Collaboration Page (`/beat/[beatId]`):**
    - [ ] Create a dynamic page that fetches the beat's data from the smart contract using its ID.
    - [ ] Display the existing segments and contributors.
    - [ ] Include the `Sequencer` for the user to create their addition.
    - [ ] Implement the `handleAddSegment` function:
        - [ ] 1. Render the new audio segment.
        - [ ] 2. **(Backend Task)** Upload the audio file to Pinata.
        - [ ] 3. Prompt the user to sign the `addSegment` transaction.
        - [ ] 4. On success, update the UI to show the new contribution.
- [ ] **Completed Beat / Minting Page (`/beat/[beatId]`):**
    - [ ] If the fetched beat status is `Completed`, change the page's state.
    - [ ] Display the full 12-second track (requires combining audio).
    - [ ] Show all three contributors.
    - [ ] Implement the `handleMint` function:
        - [ ] 1. **(Backend Task)** Combine the three segment audio files into one.
        - [ ] 2. **(Backend Task)** Upload the final track and metadata JSON to Pinata.
        - [ ] 3. Prompt the user to sign the `mint` transaction with the metadata CID.
        - [ ] 4. On success, show a confirmation message with a link to view the NFT on OpenSea or another marketplace.

---

### Phase 3: Backend (Helper Service)

- [ ] **Setup Serverless Functions:** Create API endpoints within the Next.js app (`/api/*`).
- [ ] **Pinata Upload Endpoint (`/api/upload`):**
    - [ ] Create an endpoint that accepts an audio file.
    - [ ] Use the Pinata SDK to upload the file to IPFS.
    - [ ] Return the IPFS CID in the response.
- [ ] **Metadata & Finalization Endpoint (`/api/finalize`):**
    - [ ] Create an endpoint that takes three segment CIDs.
    - [ ] Fetch the audio files from IPFS.
    - [ ] Combine them into a single 12-second audio file.
    - [ ] Upload the final audio file to Pinata.
    - [ ] Generate the ERC-721 metadata JSON file.
    - [ ] Upload the metadata JSON to Pinata.
    - [ ] Return the CID of the metadata file.

---

### Phase 4: Farcaster Integration & General UI

- [ ] **Tracks Page (`/tracks`):**
    - [ ] Create a page to display a list of in-progress and completed beats.
    - [ ] Fetch data directly from the smart contract or use an indexing service like The Graph if needed for performance.
- [ ] **Farcaster Frame:**
    - [ ] Create a Frame that points to the `/start` page.
    - [ ] Dynamically update the Frame's image and buttons based on a beat's on-chain status (`InProgress` vs. `Completed`).
- [ ] **Mobile Responsiveness:**
    - [ ] Ensure the entire application, especially the sequencer, is usable and looks good on mobile devices.
- [ ] **General UI Polish:**
    - [ ] Add loading states for transactions and data fetching.
    - [ ] Implement clear error handling and user feedback.
    - [ ] Refine the UI based on the cyberpunk theme.
