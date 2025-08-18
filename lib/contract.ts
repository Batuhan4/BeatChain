import { getAbiItem, Address } from 'viem';
import abi from './abi.json';

// TODO: Replace with your deployed contract address
export const contractAddress: Address = `0x${"153D7Ec125fCf3Ae28a026c128Fc1BAF89a7c48D"}`; 

export const contractConfig = {
  address: contractAddress,
  abi,
};

// Export specific ABI items if needed for hooks
export const startBeatAbi = getAbiItem({ abi, name: 'startBeat' });
export const addSegmentAbi = getAbiItem({ abi, name: 'addSegment' });
export const mintAbi = getAbiItem({ abi, name: 'mint' });
