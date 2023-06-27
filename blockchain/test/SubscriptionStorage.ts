import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { assert, expect } from 'chai';
import { ethers } from 'hardhat';
import { SubscriptionStorage } from '../typechain-types';
import { ERC20Mock } from '../typechain-types';
import {
	parseEther,
	AbiCoder,
	zeroPadValue,
	BytesLike,
	Typed,
	id,
} from 'ethers';
import { AddressLike } from 'ethers';

describe('Subscription Storage tests', function () {
	let owner: HardhatEthersSigner,
		vault: HardhatEthersSigner,
		manager: HardhatEthersSigner;
	let subscriptionStorage: SubscriptionStorage, erc20: ERC20Mock;

	describe('createSubscription function tests', function () {
		let ownerAddress: AddressLike,
			vaultAddress: AddressLike,
			managerAddress: AddressLike;
		let recurringAmount: any, initialAmount: any, period: number;
		let data: string, tokenAddress: any;

		before(async function () {
			[owner, vault, manager] = await ethers.getSigners();
			ownerAddress = await owner.getAddress();
			vaultAddress = await vault.getAddress();
			managerAddress = await manager.getAddress();
			recurringAmount = parseEther('1.0'); // 1 ETH
			initialAmount = parseEther('0.5'); // 0.5 ETH
			period = 86401; // Just over 1 day in seconds
			data = 'Sample subscription data';

			const SubscriptionStorage = await ethers.getContractFactory(
				'SubscriptionStorage'
			);
			const Erc20 = await ethers.getContractFactory('ERC20Mock');
			subscriptionStorage = await SubscriptionStorage.deploy(
				vaultAddress,
				managerAddress
			);
			erc20 = await Erc20.deploy('Test Token', 'TKN');
			tokenAddress = await erc20.getAddress(); // Assuming the tokenAddress is the address of erc20
		});

		it('Should fail if the period is less than or equal to 86400 seconds', async function () {
			return await expect(
				subscriptionStorage
					.connect(owner)
					.createSubscription(
						vaultAddress,
						tokenAddress,
						recurringAmount,
						initialAmount,
						86400,
						data
					)
			).to.be.revertedWith('The minimum period for a subscription is 1 day');
		});

		it('Should fail if the vault address is 0x0', async function () {
			return await expect(
				subscriptionStorage
					.connect(owner)
					.createSubscription(
						'0x0000000000000000000000000000000000000000',
						tokenAddress,
						recurringAmount,
						initialAmount,
						period,
						data
					)
			).to.be.revertedWith('Vault address cannot be address 0x0');
		});

		it('Should fail if the token address is 0x0', async function () {
			return await expect(
				subscriptionStorage
					.connect(owner)
					.createSubscription(
						vaultAddress,
						'0x0000000000000000000000000000000000000000',
						recurringAmount,
						initialAmount,
						period,
						data
					)
			).to.be.revertedWith('Token address cannot be address 0x0');
		});

		it('Should create a new subscription successfully', async function () {
			const tx = await subscriptionStorage
				.connect(owner)
				.createSubscription(
					vaultAddress,
					tokenAddress,
					recurringAmount,
					initialAmount,
					period,
					data
				);
			await tx.wait();

			const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
			const eventSignature = ethers.id(
				'SubscriptionCreated(address,bytes32,address,address,address,uint256,uint256,uint256,string)'
			);
			const eventTopic = zeroPadValue(eventSignature, 32);
			const eventLog = txReceipt?.logs.find((log) =>
				log.topics.includes(eventTopic)
			);

			expect(eventLog).to.not.be.undefined;

			const abiCoder = new AbiCoder();

			if (eventLog && eventLog.data) {
				const event = abiCoder.decode(
					[
						'address',
						'bytes32',
						'address',
						'address',
						'address',
						'uint256',
						'uint256',
						'uint256',
						'string',
					],
					eventLog.data
				);

				expect(event[0]).to.equal(ownerAddress);
				expect(event[2]).to.equal(ownerAddress);
				expect(event[3]).to.equal(vaultAddress);
				expect(event[4]).to.equal(tokenAddress);
				expect(event[5]).to.equal(recurringAmount);
				expect(event[6]).to.equal(initialAmount);
				expect(event[7]).to.equal(period);
				expect(event[8]).to.equal(data);
			}
		});
	});

	describe('updateSubscription function tests', function () {
		let subscriptionId: Typed | BytesLike;
		let ownerAddress: string, vaultAddress: AddressLike, managerAddress;
		let recurringAmount: any, initialAmount: any, period: number;
		let data: string, tokenAddress: any;

		before(async function () {
			[owner, vault, manager] = await ethers.getSigners();
			ownerAddress = await owner.getAddress();
			vaultAddress = await vault.getAddress();
			managerAddress = await manager.getAddress();
			recurringAmount = parseEther('1.0'); // 1 ETH
			initialAmount = parseEther('0.5'); // 0.5 ETH
			period = 86401; // Just over 1 day in seconds
			data = 'Sample subscription data';

			const SubscriptionStorage = await ethers.getContractFactory(
				'SubscriptionStorage'
			);
			const Erc20 = await ethers.getContractFactory('ERC20Mock');
			subscriptionStorage = await SubscriptionStorage.deploy(
				vaultAddress,
				managerAddress
			);
			erc20 = await Erc20.deploy('Test Token', 'Tkn');
			tokenAddress = await erc20.getAddress();

			const tx = await subscriptionStorage
				.connect(owner)
				.createSubscription(
					vaultAddress,
					tokenAddress,
					recurringAmount,
					initialAmount,
					period,
					data
				);
			await tx.wait();

			const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
			const eventSignature = ethers.id(
				'SubscriptionCreated(address,bytes32,address,address,address,uint256,uint256,uint256,string)'
			);
			const eventTopic = zeroPadValue(eventSignature, 32);
			const eventLog = txReceipt!.logs.find((log) =>
				log.topics.includes(eventTopic)
			);
			const abiCoder = new AbiCoder();
			const event = abiCoder.decode(
				[
					'address',
					'bytes32',
					'address',
					'address',
					'address',
					'uint256',
					'uint256',
					'uint256',
					'string',
				],
				eventLog!.data
			);
			subscriptionId = event[1];
		});

		it('Should fail if a non-owner tries to update the subscription', async function () {
			await expect(
				subscriptionStorage
					.connect(vault)
					.updateSubscription(
						subscriptionId,
						vaultAddress,
						tokenAddress,
						recurringAmount,
						initialAmount,
						period,
						data
					)
			).to.be.revertedWith('Only the owner of the subscription can update it');
		});

		it('Should update the subscription successfully', async function () {
			const tx = await subscriptionStorage
				.connect(owner)
				.updateSubscription(
					subscriptionId,
					vaultAddress,
					tokenAddress,
					recurringAmount,
					initialAmount,
					period,
					data
				);
			await tx.wait();

			const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
			const eventSignature = id(
				'SubscriptionUpdated(address,bytes32,address,address,address,uint256,uint256,uint256,string)'
			);
			const eventTopic = zeroPadValue(eventSignature, 32);
			const eventLog = txReceipt!.logs.find((log) =>
				log.topics.includes(eventTopic)
			);

			expect(eventLog).to.not.be.undefined;
			const abiCoder = new AbiCoder();
			const event = abiCoder.decode(
				[
					'address',
					'bytes32',
					'address',
					'address',
					'address',
					'uint256',
					'uint256',
					'uint256',
					'string',
				],
				eventLog!.data
			);

			expect(event[0]).to.equal(ownerAddress);
			expect(event[1]).to.equal(subscriptionId);
			expect(event[2]).to.equal(ownerAddress);
			expect(event[3]).to.equal(vaultAddress);
			expect(event[4]).to.equal(tokenAddress);
			expect(event[5]).to.equal(recurringAmount);
			expect(event[6]).to.equal(initialAmount);
			expect(event[7]).to.equal(period);
			expect(event[8]).to.equal(data);
		});
	});

	describe('deleteSubscription function tests', function () {
		let subscriptionId: Typed | BytesLike;
		let ownerAddress: string, vaultAddress: AddressLike, managerAddress;
		let recurringAmount: any, initialAmount: any, period: number;
		let data: string, tokenAddress: any;
		let abiCoder = new AbiCoder();

		before(async function () {
			[owner, vault, manager] = await ethers.getSigners();
			ownerAddress = await owner.getAddress();
			vaultAddress = await vault.getAddress();
			managerAddress = await manager.getAddress();
			recurringAmount = parseEther('1.0'); // 1 ETH
			initialAmount = parseEther('0.5'); // 0.5 ETH
			period = 86401; // Just over 1 day in seconds
			data = 'Sample subscription data';

			const SubscriptionStorage = await ethers.getContractFactory(
				'SubscriptionStorage'
			);
			const Erc20 = await ethers.getContractFactory('ERC20Mock');
			subscriptionStorage = await SubscriptionStorage.deploy(
				vaultAddress,
				managerAddress
			);
			erc20 = await Erc20.deploy('Test Token', 'Tkn');
			tokenAddress = await erc20.getAddress();

			const tx = await subscriptionStorage
				.connect(owner)
				.createSubscription(
					vaultAddress,
					tokenAddress,
					recurringAmount,
					initialAmount,
					period,
					data
				);
			await tx.wait();

			const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
			const eventSignature = ethers.id(
				'SubscriptionCreated(address,bytes32,address,address,address,uint256,uint256,uint256,string)'
			);
			const eventTopic = zeroPadValue(eventSignature, 32);
			const eventLog = txReceipt!.logs.find((log) =>
				log.topics.includes(eventTopic)
			);
			const abiCoder = new AbiCoder();
			const event = abiCoder.decode(
				[
					'address',
					'bytes32',
					'address',
					'address',
					'address',
					'uint256',
					'uint256',
					'uint256',
					'string',
				],
				eventLog!.data
			);
			subscriptionId = event[1];
		});

		it('Should fail if a non-owner/non-operator tries to delete the subscription', async function () {
			await expect(
				subscriptionStorage.connect(vault).deleteSubscription(subscriptionId)
			).to.be.revertedWith(
				'Only the owner or the operator of the subscription can delete it'
			);
		});

		it('Should delete the subscription successfully', async function () {
			const tx = await subscriptionStorage
				.connect(owner)
				.deleteSubscription(subscriptionId);
			await tx.wait();

			const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
			const eventSignature = ethers.id('SubscriptionDeleted(address,bytes32)');
			const eventTopic = zeroPadValue(eventSignature, 32);
			const eventLog = txReceipt!.logs.find((log) =>
				log.topics.includes(eventTopic)
			);

			expect(eventLog).to.not.be.undefined;

			const event = abiCoder.decode(['address', 'bytes32'], eventLog!.data);

			expect(event[0]).to.equal(ownerAddress);
			expect(event[1]).to.equal(subscriptionId);

			// Fetching the subscription data after deletion should fail
			await expect(subscriptionStorage.getSubscription(subscriptionId)).to.be
				.reverted;
		});
	});

	describe('createSubscriptionInstance function tests', function () {
		let subscriptionId: Typed | BytesLike;
		let ownerAddress: string, vaultAddress: AddressLike, managerAddress;
		let data: string, tokenAddress: any, subscriptionStorageAddress: any;
		let erc20Balance = parseEther('1000');
		let initialAmount = parseEther('50');
		let recurringAmount = parseEther('10');
		let period = 60 * 60 * 24 * 30; // 30 days

		beforeEach(async function () {
			[owner, vault, manager] = await ethers.getSigners();
			ownerAddress = await owner.getAddress();
			vaultAddress = await vault.getAddress();
			managerAddress = await manager.getAddress();
			recurringAmount = parseEther('1.0'); // 1 ETH
			initialAmount = parseEther('0.5'); // 0.5 ETH
			period = 86401; // Just over 1 day in seconds
			data = 'Sample subscription data';

			const SubscriptionStorage = await ethers.getContractFactory(
				'SubscriptionStorage'
			);
			const Erc20 = await ethers.getContractFactory('ERC20Mock');

			subscriptionStorage = await SubscriptionStorage.deploy(
				vaultAddress,
				managerAddress
			);
			subscriptionStorageAddress = await subscriptionStorage.getAddress();
			erc20 = await Erc20.deploy('Test Token', 'Tkn');
			tokenAddress = await erc20.getAddress();

			const tx = await subscriptionStorage
				.connect(owner)
				.createSubscription(
					vaultAddress,
					tokenAddress,
					recurringAmount,
					initialAmount,
					period,
					data
				);
			await tx.wait();

			const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
			const eventSignature = ethers.id(
				'SubscriptionCreated(address,bytes32,address,address,address,uint256,uint256,uint256,string)'
			);
			const eventTopic = zeroPadValue(eventSignature, 32);
			const eventLog = txReceipt!.logs.find((log) =>
				log.topics.includes(eventTopic)
			);
			const abiCoder = new AbiCoder();
			const event = abiCoder.decode(
				[
					'address',
					'bytes32',
					'address',
					'address',
					'address',
					'uint256',
					'uint256',
					'uint256',
					'string',
				],
				eventLog!.data
			);
			subscriptionId = event[1];

			await erc20.mint(owner.address, erc20Balance);
			await erc20
				.connect(owner)
				.approve(subscriptionStorageAddress, erc20Balance);
		});

		it('should revert if trying to create an instance for a non-existent subscription', async function () {
			let randomId = ethers.randomBytes(32);
			await expect(
				subscriptionStorage.connect(owner).createSubscriptionInstance(randomId)
			).to.be.revertedWith(
				"Can't create an instance for a subscription that doesn't exist"
			);
		});

		it('should revert if trying to create a duplicate subscription instance', async function () {
			await subscriptionStorage
				.connect(owner)
				.createSubscriptionInstance(subscriptionId);

			await expect(
				subscriptionStorage
					.connect(owner)
					.createSubscriptionInstance(subscriptionId)
			).to.be.revertedWith("Can't create an instance that already exists");
		});

		it('should revert if the user has insufficient balance', async function () {
			let largeAmount = parseEther('10000');
			await erc20
				.connect(manager)
				.approve(subscriptionStorageAddress, largeAmount);

			await expect(
				subscriptionStorage
					.connect(manager)
					.createSubscriptionInstance(subscriptionId)
			).to.be.revertedWith('Insufficient balance!');
		});

		it('should revert if the user has insufficient allowance', async function () {
			let smallAllowance = parseEther('1');
			await erc20
				.connect(owner)
				.approve(subscriptionStorageAddress, smallAllowance);

			await expect(
				subscriptionStorage
					.connect(owner)
					.createSubscriptionInstance(subscriptionId)
			).to.be.revertedWith('Insufficient allowance!');
		});

		it('should create a subscription instance and emit events', async function () {
			let tx = await subscriptionStorage
				.connect(owner)
				.createSubscriptionInstance(subscriptionId);
			await tx.wait();

			const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
			const eventSignature = id(
				'SubscriptionInstanceCreated(address,bytes32,bytes32,address,uint256,uint8,uint256,string)'
			);
			const eventTopic = zeroPadValue(eventSignature, 32);
			const eventLog = txReceipt!.logs.find((log) =>
				log.topics.includes(eventTopic)
			);

			expect(eventLog).to.not.be.undefined;
		});
	});

	describe('updateSubscriptionInstance function tests', function () {
		let subscriptionId: Typed | BytesLike;
		let subscriptionInstanceId: Typed | BytesLike;
		let ownerAddress: string, vaultAddress: AddressLike, managerAddress;
		let data: string, tokenAddress: any, subscriptionStorageAddress: any;
		let erc20Balance = parseEther('1000');
		let initialAmount = parseEther('50');
		let recurringAmount = parseEther('10');
		let period = 60 * 60 * 24 * 30; // 30 days

		beforeEach(async function () {
			[owner, vault, manager] = await ethers.getSigners();
			ownerAddress = await owner.getAddress();
			vaultAddress = await vault.getAddress();
			managerAddress = await manager.getAddress();
			recurringAmount = parseEther('1.0'); // 1 ETH
			initialAmount = parseEther('0.5'); // 0.5 ETH
			period = 86401; // Just over 1 day in seconds
			data = 'Sample subscription data';

			const SubscriptionStorage = await ethers.getContractFactory(
				'SubscriptionStorage'
			);
			const Erc20 = await ethers.getContractFactory('ERC20Mock');

			subscriptionStorage = await SubscriptionStorage.deploy(
				vaultAddress,
				managerAddress
			);
			subscriptionStorageAddress = await subscriptionStorage.getAddress();
			erc20 = await Erc20.deploy('Test Token', 'Tkn');
			tokenAddress = await erc20.getAddress();

			await erc20.mint(owner.address, erc20Balance);
			await erc20
				.connect(owner)
				.approve(subscriptionStorageAddress, erc20Balance);

			const subscriptionTx = await subscriptionStorage
				.connect(owner)
				.createSubscription(
					vaultAddress,
					tokenAddress,
					recurringAmount,
					initialAmount,
					period,
					data
				);
			await subscriptionTx.wait();

			const subscriptionTxReceipt = await ethers.provider.getTransactionReceipt(
				subscriptionTx.hash
			);
			const subscriptionEventSignature = ethers.id(
				'SubscriptionCreated(address,bytes32,address,address,address,uint256,uint256,uint256,string)'
			);
			const subscriptionEventTopic = zeroPadValue(
				subscriptionEventSignature,
				32
			);
			const subscriptionEventLog = subscriptionTxReceipt!.logs.find((log) =>
				log.topics.includes(subscriptionEventTopic)
			);
			const abiCoder = new AbiCoder();
			const event = abiCoder.decode(
				[
					'address',
					'bytes32',
					'address',
					'address',
					'address',
					'uint256',
					'uint256',
					'uint256',
					'string',
				],
				subscriptionEventLog!.data
			);
			subscriptionId = event[1];

			let instanceTx = await subscriptionStorage
				.connect(owner)
				.createSubscriptionInstance(subscriptionId);
			await instanceTx.wait();

			const instanceTxReceipt = await ethers.provider.getTransactionReceipt(
				instanceTx.hash
			);
			const instanceEventSignature = id(
				'SubscriptionInstanceCreated(address,bytes32,bytes32,address,uint256,uint8,uint256,string)'
			);
			const instanceEventTopic = zeroPadValue(instanceEventSignature, 32);
			const instanceEventLog = instanceTxReceipt!.logs.find((log) =>
				log.topics.includes(instanceEventTopic)
			);
			const instanceEvent = abiCoder.decode(
				[
					'address',
					'bytes32',
					'bytes32',
					'address',
					'uint256',
					'uint8',
					'uint256',
					'string',
				],
				instanceEventLog!.data
			);
			subscriptionInstanceId = instanceEvent[1];
		});

		it('Should update the subscription instance successfully', async function () {
			const newDiscount = 10; // 10%
			const newData = 'Updated data';

			await subscriptionStorage
				.connect(owner)
				.updateSubscriptionInstance(
					subscriptionInstanceId,
					subscriptionId,
					newDiscount,
					newData
				);

			// Assuming a function getSubscriptionInstance that retrieves the subscription instance details
			const updatedSubscriptionInstance =
				await subscriptionStorage.getSubscriptionInstance(
					subscriptionId,
					subscriptionInstanceId
				);

			expect(updatedSubscriptionInstance.discount).to.equal(newDiscount);
			expect(updatedSubscriptionInstance.data).to.equal(newData);
		});

		it('Should fail when a non-owner tries to update the subscription', async function () {
			const newDiscount = 10;
			const newData = 'Updated data';

			await expect(
				subscriptionStorage
					.connect(manager)
					.updateSubscriptionInstance(
						subscriptionInstanceId,
						subscriptionId,
						newDiscount,
						newData
					)
			).to.be.revertedWith(
				'Only the owner or the operator of the subscription can update it'
			);
		});

		it('Should fail when trying to update a non-existing subscription instance', async function () {
			const newDiscount = 10;
			const newData = 'Updated data';

			const nonExistentSubscriptionInstanceId = ethers.randomBytes(32);

			await expect(
				subscriptionStorage
					.connect(owner)
					.updateSubscriptionInstance(
						nonExistentSubscriptionInstanceId,
						subscriptionId,
						newDiscount,
						newData
					)
			).to.be.revertedWith(
				"Can't update a subscription instance that doesn't exist"
			);
		});
	});

	describe('deleteSubscriptionInstance', function () {
		let subscriptionId: Typed | BytesLike;
		let subscriptionInstanceId: Typed | BytesLike;
		let ownerAddress: string, vaultAddress: AddressLike, managerAddress;
		let data: string, tokenAddress: any, subscriptionStorageAddress: any;
		let erc20Balance = parseEther('1000');
		let initialAmount = parseEther('50');
		let recurringAmount = parseEther('10');
		let period = 60 * 60 * 24 * 30; // 30 days

		beforeEach(async function () {
			[owner, vault, manager] = await ethers.getSigners();
			ownerAddress = await owner.getAddress();
			vaultAddress = await vault.getAddress();
			managerAddress = await manager.getAddress();
			recurringAmount = parseEther('1.0'); // 1 ETH
			initialAmount = parseEther('0.5'); // 0.5 ETH
			period = 86401; // Just over 1 day in seconds
			data = 'Sample subscription data';

			const SubscriptionStorage = await ethers.getContractFactory(
				'SubscriptionStorage'
			);
			const Erc20 = await ethers.getContractFactory('ERC20Mock');

			subscriptionStorage = await SubscriptionStorage.deploy(
				vaultAddress,
				managerAddress
			);
			subscriptionStorageAddress = await subscriptionStorage.getAddress();
			erc20 = await Erc20.deploy('Test Token', 'Tkn');
			tokenAddress = await erc20.getAddress();

			await erc20.mint(owner.address, erc20Balance);
			await erc20
				.connect(owner)
				.approve(subscriptionStorageAddress, erc20Balance);

			const subscriptionTx = await subscriptionStorage
				.connect(owner)
				.createSubscription(
					vaultAddress,
					tokenAddress,
					recurringAmount,
					initialAmount,
					period,
					data
				);
			await subscriptionTx.wait();

			const subscriptionTxReceipt = await ethers.provider.getTransactionReceipt(
				subscriptionTx.hash
			);
			const subscriptionEventSignature = ethers.id(
				'SubscriptionCreated(address,bytes32,address,address,address,uint256,uint256,uint256,string)'
			);
			const subscriptionEventTopic = zeroPadValue(
				subscriptionEventSignature,
				32
			);
			const subscriptionEventLog = subscriptionTxReceipt!.logs.find((log) =>
				log.topics.includes(subscriptionEventTopic)
			);
			const abiCoder = new AbiCoder();
			const event = abiCoder.decode(
				[
					'address',
					'bytes32',
					'address',
					'address',
					'address',
					'uint256',
					'uint256',
					'uint256',
					'string',
				],
				subscriptionEventLog!.data
			);
			subscriptionId = event[1];

			let instanceTx = await subscriptionStorage
				.connect(owner)
				.createSubscriptionInstance(subscriptionId);
			await instanceTx.wait();

			const instanceTxReceipt = await ethers.provider.getTransactionReceipt(
				instanceTx.hash
			);
			const instanceEventSignature = id(
				'SubscriptionInstanceCreated(address,bytes32,bytes32,address,uint256,uint8,uint256,string)'
			);
			const instanceEventTopic = zeroPadValue(instanceEventSignature, 32);
			const instanceEventLog = instanceTxReceipt!.logs.find((log) =>
				log.topics.includes(instanceEventTopic)
			);
			const instanceEvent = abiCoder.decode(
				[
					'address',
					'bytes32',
					'bytes32',
					'address',
					'uint256',
					'uint8',
					'uint256',
					'string',
				],
				instanceEventLog!.data
			);
			subscriptionInstanceId = instanceEvent[1];
		});

		it('should delete a subscription instance tests', async function () {
			// Listen for the SubscriptionInstanceDeleted event
			await expect(
				subscriptionStorage.deleteSubscriptionInstance(
					subscriptionId,
					subscriptionInstanceId
				)
			)
				.to.emit(subscriptionStorage, 'SubscriptionInstanceDeleted')
				.withArgs(owner.address, subscriptionInstanceId);

			// Checking the subscription instance does not exist after deletion
			await expect(
				subscriptionStorage.getSubscriptionInstanceByUser(
					subscriptionId,
					owner.address
				)
			).to.be.revertedWith("Can't get an instance that doesn't exist");
		});

		it('should not allow a non-owner to delete a subscription instance', async function () {
			// Attempting to delete the subscription instance by a non-owner
			expect(
				await subscriptionStorage
					.connect(manager)
					.deleteSubscriptionInstance(subscriptionId, subscriptionInstanceId)
			).to.be.revertedWith(
				'Only the owner or the operator of the subscription can delete it'
			);
		});
	});

	describe('handleSubscriptionInstacePayment tests', function () {
		let subscriptionId: Typed | BytesLike;
		let subscriptionInstanceId: Typed | BytesLike;
		let ownerAddress: string, vaultAddress: AddressLike, managerAddress;
		let data: string, tokenAddress: any, subscriptionStorageAddress: any;
		let erc20Balance = parseEther('1000');
		let initialAmount = parseEther('50');
		let recurringAmount = parseEther('10');
		let period = 60 * 60 * 24 * 30; // 30 days

		beforeEach(async function () {
			[owner, vault, manager] = await ethers.getSigners();
			ownerAddress = await owner.getAddress();
			vaultAddress = await vault.getAddress();
			managerAddress = await manager.getAddress();
			recurringAmount = parseEther('1.0'); // 1 ETH
			initialAmount = parseEther('0.5'); // 0.5 ETH
			period = 86401; // Just over 1 day in seconds
			data = 'Sample subscription data';

			const SubscriptionStorage = await ethers.getContractFactory(
				'SubscriptionStorage'
			);
			const Erc20 = await ethers.getContractFactory('ERC20Mock');

			subscriptionStorage = await SubscriptionStorage.deploy(
				vaultAddress,
				managerAddress
			);
			subscriptionStorageAddress = await subscriptionStorage.getAddress();
			erc20 = await Erc20.deploy('Test Token', 'Tkn');
			tokenAddress = await erc20.getAddress();

			await erc20.mint(owner.address, erc20Balance);
			await erc20
				.connect(owner)
				.approve(subscriptionStorageAddress, erc20Balance);

			const subscriptionTx = await subscriptionStorage
				.connect(owner)
				.createSubscription(
					vaultAddress,
					tokenAddress,
					recurringAmount,
					initialAmount,
					period,
					data
				);
			await subscriptionTx.wait();

			const subscriptionTxReceipt = await ethers.provider.getTransactionReceipt(
				subscriptionTx.hash
			);
			const subscriptionEventSignature = ethers.id(
				'SubscriptionCreated(address,bytes32,address,address,address,uint256,uint256,uint256,string)'
			);
			const subscriptionEventTopic = zeroPadValue(
				subscriptionEventSignature,
				32
			);
			const subscriptionEventLog = subscriptionTxReceipt!.logs.find((log) =>
				log.topics.includes(subscriptionEventTopic)
			);
			const abiCoder = new AbiCoder();
			const event = abiCoder.decode(
				[
					'address',
					'bytes32',
					'address',
					'address',
					'address',
					'uint256',
					'uint256',
					'uint256',
					'string',
				],
				subscriptionEventLog!.data
			);
			subscriptionId = event[1];

			let instanceTx = await subscriptionStorage
				.connect(owner)
				.createSubscriptionInstance(subscriptionId);
			await instanceTx.wait();

			const instanceTxReceipt = await ethers.provider.getTransactionReceipt(
				instanceTx.hash
			);
			const instanceEventSignature = id(
				'SubscriptionInstanceCreated(address,bytes32,bytes32,address,uint256,uint8,uint256,string)'
			);
			const instanceEventTopic = zeroPadValue(instanceEventSignature, 32);
			const instanceEventLog = instanceTxReceipt!.logs.find((log) =>
				log.topics.includes(instanceEventTopic)
			);
			const instanceEvent = abiCoder.decode(
				[
					'address',
					'bytes32',
					'bytes32',
					'address',
					'uint256',
					'uint8',
					'uint256',
					'string',
				],
				instanceEventLog!.data
			);
			subscriptionInstanceId = instanceEvent[1];
		});

		it("Should fail if the subscription doesn't exist", async function () {
			await expect(
				subscriptionStorage.handleSubscriptionInstacePayment(
					ethers.randomBytes(32),
					subscriptionInstanceId
				)
			).to.be.revertedWith(
				"Can't handle the payment for a subscription that doesn't exist"
			);
		});

		it("Should fail if the subscription instance doesn't exist", async function () {
			await expect(
				subscriptionStorage.handleSubscriptionInstacePayment(
					subscriptionId,
					ethers.randomBytes(32)
				)
			).to.be.revertedWith(
				"Can't handle the payment for a subscription instance that doesn't exist"
			);
		});

		it("Should fail if the next payment period hasn't arrived", async function () {
			await expect(
				subscriptionStorage.handleSubscriptionInstacePayment(
					subscriptionId,
					subscriptionInstanceId
				)
			).to.be.revertedWith("Can't handle the payment yet");
		});

		it('Should fail if the payer has insufficient balance', async function () {
			const sum = await erc20.balanceOf(owner);
			await erc20.transfer(manager, sum);
			await ethers.provider.send('evm_setNextBlockTimestamp', [
				Math.round(new Date().getTime() / 1000) + period * 2,
			]);
			await ethers.provider.send('evm_mine');
			await expect(
				subscriptionStorage.handleSubscriptionInstacePayment(
					subscriptionId,
					subscriptionInstanceId
				)
			).to.be.revertedWith('Insufficient balance!');
		});

		it('Should handle the payment, update the next payment period and emit the PaymentProcessed event', async function () {
			await ethers.provider.send('evm_setNextBlockTimestamp', [
				Math.round(new Date().getTime() / 1000) + period * 4,
			]);
			await ethers.provider.send('evm_mine');
			await expect(
				subscriptionStorage.handleSubscriptionInstacePayment(
					subscriptionId,
					subscriptionInstanceId
				)
			)
				.to.emit(subscriptionStorage, 'PaymentProcessed')
				.withArgs(
					subscriptionInstanceId,
					subscriptionId,
					Math.round(new Date().getTime() / 1000) + period * 5 + 1
				);
		});
	});
});
