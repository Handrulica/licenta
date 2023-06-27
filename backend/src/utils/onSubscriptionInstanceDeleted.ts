import { Contract } from 'ethers';
import { prisma } from './prisma';

export const onSubscriptionInstanceDeleted = async (contract: Contract) => {
	contract.on(
		'SubscriptionInstanceDeleted',
		async (caller, subscriptionInstanceId) => {
			const subscriptionInstanceDeletedData = {
				caller,
				subscriptionInstanceId,
			};

			const subscriptionInstanceDeleted =
				await prisma.subscriptionInstanceCreated.findUnique({
					where: {
						subscriptionInstanceId:
							subscriptionInstanceDeletedData.subscriptionInstanceId,
					},
				});

			if (!subscriptionInstanceDeleted) {
				const SubscriptionInstanceDeleted =
					await prisma.subscriptionInstanceCreated.delete({
						where: {
							subscriptionInstanceId:
								subscriptionInstanceDeletedData.subscriptionInstanceId,
						},
					});

				console.info(
					'SubscriptionInstance deleted: ',
					SubscriptionInstanceDeleted
				);
			}
		}
	);
};
