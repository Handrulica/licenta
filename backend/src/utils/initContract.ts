import fs from 'fs';
import { env } from './env';
import { ethers } from 'ethers';

const BLOCKAIN_ARTIFACTS_PATH = `${__dirname}/../../../blockchain/artifacts/contracts/SubscriptionStorage.sol/SubscriptionStorage.json`;

export const initContract = async () => {
	const provider = new ethers.providers.InfuraProvider(
		env.ETHEREUM_NETWORK,
		env.INFURA_API_KEY
	);

	let wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);

	const smartContract = await fs.promises.readFile(
		BLOCKAIN_ARTIFACTS_PATH,
		'utf-8'
	);
	const smartContractAsJSON = JSON.parse(smartContract);
	const abi = smartContractAsJSON.abi;

	const ethereumAddress = env.ETHEREUM_ADDRESS;

	const contract = new ethers.Contract(ethereumAddress, abi, wallet);

	return contract;
};
