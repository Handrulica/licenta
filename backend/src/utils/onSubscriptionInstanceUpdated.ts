import { Contract } from 'ethers';
import { prisma } from './prisma';

export const onSubscriptionInstanceUpdated = async (contract: Contract) => {
	contract.on(
		'SubscriptionInstanceUpdated',
		async (
			caller,
			subscriptionInstanceId,
			subscriptionId,
			owner,
			nextPayment,
			status,
			discount,
			data
		) => {
			const subscriptionInstanceUpdatedData = {
				caller,
				subscriptionInstanceId,
				subscriptionId,
				owner,
				nextPayment,
				status,
				discount,
				data,
			};

			const subscriptionInstanceUpdated =
				await prisma.subscriptionInstanceCreated.findUnique({
					where: {
						subscriptionInstanceId:
							subscriptionInstanceUpdatedData.subscriptionId,
					},
				});

			if (subscriptionInstanceUpdated) {
				const SubscriptionInstanceUpdated =
					await prisma.subscriptionInstanceCreated.update({
						where: {
							subscriptionInstanceId:
								subscriptionInstanceUpdatedData.subscriptionId,
						},
						data: {
							caller: caller,
							subscriptionInstanceId: subscriptionInstanceId,
							subscriptionId: subscriptionId,
							owner: owner,
							nextPayment: nextPayment,
							status: status,
							discount: discount,
							data: data,
						},
					});

				console.info(
					'subscription instance updated: ',
					SubscriptionInstanceUpdated
				);
			}
		}
	);
};
