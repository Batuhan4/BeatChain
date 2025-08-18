import { Address } from 'viem';

export enum BeatStatus {
  InProgress,
  Completed,
}

export interface BeatData {
  id: bigint;
  status: BeatStatus;
  contributors: Address[];
  segmentCIDs: string[];
  segmentCount: number;
  isMinted: boolean;
}
