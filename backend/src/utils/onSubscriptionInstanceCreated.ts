import { Contract } from 'ethers';
import { prisma } from './prisma';

export const onSubscriptionInstanceCreated = async (contract: Contract) => {
	contract.on(
		'SubscriptionInstanceCreated',
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
			const subscriptionInstanceCreatedData = {
				caller,
				subscriptionInstanceId,
				subscriptionId,
				owner,
				nextPayment,
				status,
				discount,
				data,
			};

			const subscriptionInstanceCreated =
				await prisma.subscriptionInstanceCreated.findUnique({
					where: {
						subscriptionInstanceId:
							subscriptionInstanceCreatedData.subscriptionId,
					},
				});

			if (!subscriptionInstanceCreated) {
				const newSubscriptionInstanceCreated =
					await prisma.subscriptionInstanceCreated.create({
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
					'New subscription instance created: ',
					newSubscriptionInstanceCreated
				);
			}
		}
	);
};
