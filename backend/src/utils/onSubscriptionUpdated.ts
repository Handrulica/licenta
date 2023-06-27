import { Contract } from 'ethers';
import { prisma } from './prisma';

export const onSubscriptionUpdated = async (contract: Contract) => {
	contract.on(
		'SubscriptionUpdated',
		async (
			caller,
			subscriptionId,
			owner,
			vaultAddress,
			tokenAddress,
			recurringAmount,
			initialAmount,
			period,
			data
		) => {
			const subscriptionUpdatedData = {
				caller,
				subscriptionId,
				owner,
				vaultAddress,
				tokenAddress,
				recurringAmount,
				initialAmount,
				period,
				data,
			};

			const subscriptionUpdated = await prisma.subscriptionCreated.findUnique({
				where: {
					subscriptionId: subscriptionUpdatedData.subscriptionId,
				},
			});

			if (subscriptionUpdated) {
				const newSubscriptionUpdated = await prisma.subscriptionCreated.update({
					where: {
						subscriptionId: subscriptionUpdatedData.subscriptionId,
					},
					data: {
						caller: caller,
						subscriptionId: subscriptionId,
						owner: owner,
						vaultAddress: vaultAddress,
						tokenAddress: tokenAddress,
						recurringAmount: recurringAmount,
						initialAmount: initialAmount,
						period: period,
						data: data,
					},
				});

				console.info('New subscription updated: ', newSubscriptionUpdated);
			}
		}
	);
};
