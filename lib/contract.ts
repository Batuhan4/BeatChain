import { getAbiItem, Address } from 'viem';
import abi from './abi.json';

// TODO: Replace with your deployed contract address
export const contractAddress: Address = `0x${"B25FC5Fd210058C96bc78593Cb29aC0e8642849e"}`; 

export const contractConfig = {
  address: contractAddress,
  abi,
};

// Export specific ABI items if needed for hooks
export const startBeatAbi = getAbiItem({ abi, name: 'startBeat' });
export const addSegmentAbi = getAbiItem({ abi, name: 'addSegment' });
export const mintAbi = getAbiItem({ abi, name: 'mint' });
