import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-chai-matchers';

const config: HardhatUserConfig = {
	solidity: '0.8.18',
	networks: {
		sepolia: {
			url: 'https://rpc.sepolia.org/',
			chainId: 11155111,
			accounts: [
				'b6844d8414cb4b811c5c758b8f07ed45f42cd616e7042fd995734a2bc1b03f0d',
			],
		},
	},
	etherscan: {
		apiKey: 'A5ECAE9VDFPG821YKW5R3V2HBSX92X3ASH',
	},
};

export default config;
