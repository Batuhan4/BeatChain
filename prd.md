---

### **BeatChain - MVP Product Requirements Document**

* **Product:** BeatChain
* **Version:** 1.1 (MVP)
* **Date:** August 17, 2025
* **Author:** Batuhan4

### 1. Introduction & Vision

**BeatChain** is a collaborative social music platform built on Farcaster. It transforms music creation from a solitary act into a fun, sequential, and social game. Users collaboratively build 12-second musical tracks, called "Beats," by adding 4-second layers one after another using a simple, in-browser sequencer with a library of pre-made sounds.

The entire experience is driven through Farcaster Frames, making discovery and participation seamless within the social feed. Our vision is to create a new primitive for on-chain creative collaboration.

### 2. Product Goals & Success Metrics

* **Goal 1: Launch a functional MVP.**
    * **Metric:** A deployed, working application that allows users to create and listen to a complete 12-second Beat.
* **Goal 2: Create a viral, shareable user experience.**
    * **Metrics:** Number of completed Beats created, total plays across all completed Beats, number of unique contributors.
* **Goal 3: Demonstrate a stateful Farcaster Frame application.**
    * **Metric:** Farcaster Frames correctly update their button and link from an "In-Progress" state to a "Completed" state after the third contribution.

### 3. Target Audience

* **Primary:** Farcaster users, crypto-natives, and hobbyist musicians looking for novel ways to interact and create.
* **Secondary:** General social media users who are drawn to creative and collaborative games.

### 4. Core User Flow

1.  **Initiation (User A):** A user clicks a "Start a new Beat!" Frame on Farcaster. They are directed to the BeatChain Mini App, which displays a simple sequencer UI. User A arranges sounds on the 4-second timeline and submits. A new Frame is generated and cast to Farcaster, containing their 4-second audio loop. The Frame's button says, "**Continue the Beat!**"
2.  **Collaboration (User B):** Sees User A's cast and clicks "Continue the Beat!". They are taken to the sequencer, hear User A's loop, and create the *next* 4-second segment (from 4s to 8s). Upon submission, the backend appends their segment to the first one. The original Frame on Farcaster now plays the combined 8-second audio. The button still says, "**Continue the Beat!**"
3.  **Completion (User C):** Sees the same cast, now with an 8-second loop. They click the button and add the final 4-second segment (from 8s to 12s).
4.  **Publication:** Upon User C's submission, the backend creates the final 12-second track and marks the Beat as **"Completed."** The Farcaster Frame automatically updates a final time. The button now says, "**Listen to the Final Beat!**" and links to the completed track's public page on the BeatChain website.
5.  **Listening (User D):** Discovers the completed Beat's Frame. They click the button and are taken to the track's dedicated page, where they can listen to the full track, see the contributors, and view the play count.

### 5. Functional Requirements (MVP Scope)

**FR-1: Sequencer Interface**
* The interface must provide a pre-defined library of 5-6 complementary audio samples (e.g., Kick, Snare, Bass, Synth).
* The interface must feature a grid-based, 4-second timeline for arranging sounds.
* Users must be able to preview their 4-second creation before submitting.
* The interface must render the user's arrangement into an audio file on the client-side.

**FR-2: Backend & Track Logic**
* A "Beat" is strictly defined as being composed of 3 user-submitted segments (12 seconds total).
* The backend must be able to append a new audio segment to an existing track file.
* The backend must track the state of each Beat ("In-Progress" or "Completed").
* The backend must store metadata for each Beat, including the list of contributor wallet addresses and the play count.

**FR-3: Farcaster Frame Integration**
* An "In-Progress" track's Frame must display a button with the text "Continue the Beat!" which links to the sequencer UI.
* A "Completed" track's Frame must display a button with the text "Listen to the Final Beat!" which links to that track's unique page.
* The Frame must play the current version of the audio track when the play button is pressed.

**FR-4: Completed Track Page**
* Each completed Beat must have a unique, public URL on the BeatChain website.
* The page must feature an audio player for the final 12-second track.
* The page must display the Farcaster wallet addresses of the 3 contributors.
* The page must display a simple counter for the total number of plays.

### 6. Technical Requirements & Stack

* **Frontend:**
    * **Framework:** `Vite + React + TypeScript`. Chosen for its extremely fast development server and type safety.
    * **Wallet Connection:** `Wagmi`. To handle the connection to the user's wallet (e.g., the one integrated into their Farcaster client) to retrieve their public address, which will serve as their unique identifier.
    * **Web Audio Library:** `Tone.js`. Critical for accurately scheduling audio samples in the sequencer and rendering the user's composition into an audio file on the client-side.
    * **Farcaster Frames Library:** `Frames.js` or `Frog`. To easily generate and serve the dynamic Frame metadata.

* **Backend:**
    * **Runtime & Deployment:** `Node.js` deployed as **Serverless Functions** (e.g., on Vercel). This avoids server management, ideal for a hackathon.
    * **Core Logic:** An API endpoint to receive submissions and a function to concatenate audio files (e.g., using `FFmpeg`).

* **Database:**
    * **Type:** Serverless Key-Value Store. Chosen for its near-instant setup time.
    * **Recommended Services:** `Vercel KV` or `Upstash (Redis)`. To store track metadata (contributors, status) and increment the play counter.

* **Storage:**
    * **Type:** Object Storage. To store the generated audio files (`.mp3` or `.wav`).
    * **Recommended Services:** `Vercel Blob`, `Cloudflare R2`, or `Pinata`.

### 7. Out of Scope for MVP (Future Roadmap)

To ensure focus and completion, the following features are explicitly **out of scope** for this initial version:

* Like/Dislike buttons.
* On-chain NFT minting of completed tracks.
* User profiles, galleries, or leaderboards.
* Uploading or recording custom sounds.
* Adding new sound packs or in-app instruments.
* Advanced audio controls (volume, effects, pitch).
