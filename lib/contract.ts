import { getAbiItem } from 'viem';
import abi from './abi.json';

// TODO: Replace with your deployed contract address
export const contractAddress = '0x...'; 

export const contractConfig = {
  address: contractAddress,
  abi,
};

// Export specific ABI items if needed for hooks
export const startBeatAbi = getAbiItem({ abi, name: 'startBeat' });
export const addSegmentAbi = getAbiItem({ abi, name: 'addSegment' });
export const mintAbi = getAbiItem({ abi, name: 'mint' });
