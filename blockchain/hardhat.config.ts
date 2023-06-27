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
				'fd09d9503a96261bf3da42f902e6871c8164d2dd8185e3a13f9273443fa377a7',
			],
		},
	},
	etherscan: {
		apiKey: 'A5ECAE9VDFPG821YKW5R3V2HBSX92X3ASH',
	},
};

export default config;
