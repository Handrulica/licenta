import { ethers } from 'hardhat';

async function main() {
	const tokenAccount = await ethers.getContractFactory('ERC20Mock');
	let token = await tokenAccount.deploy('Test Token', 'TKN');
	console.log('ERC20: ' + (await token.getAddress()));

	const subscriptionStorage = await ethers.getContractFactory(
		'SubscriptionStorage'
	);
	let subscriptionStorageDeployed = await subscriptionStorage.deploy(
		'0x989A076a17796fd4f68572e00084667680371Ce7',
		'0x64320159B74b8B2fB6aa34F30b22FfF01B02900E'
	);
	console.log(
		'Subscription storage: ',
		await subscriptionStorageDeployed.getAddress()
	);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
