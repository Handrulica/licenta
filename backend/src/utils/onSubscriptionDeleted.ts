import { Contract } from 'ethers';
import { prisma } from './prisma';

export const onSubscriptionDeleted = async (contract: Contract) => {
	contract.on('SubscriptionDeleted', async (caller, subscriptionId) => {
		const subscriptionDeletedData = {
			caller,
			subscriptionId,
		};

		const subscriptionDeleted = await prisma.subscriptionCreated.findUnique({
			where: {
				subscriptionId: subscriptionDeletedData.subscriptionId,
			},
		});

		if (!subscriptionDeleted) {
			const SubscriptionDeleted = await prisma.subscriptionCreated.delete({
				where: {
					subscriptionId: subscriptionDeletedData.subscriptionId,
				},
			});

			console.info('Subscription deleted: ', SubscriptionDeleted);
		}
	});
};
