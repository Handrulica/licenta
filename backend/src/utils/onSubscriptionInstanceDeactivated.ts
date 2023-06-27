import { Contract } from 'ethers';
import { prisma } from './prisma';

export const onSubscriptionInstanceDeactivated = async (contract: Contract) => {
	contract.on(
		'SubscriptionInstanceDeactivated',
		async (subscriptionInstanceId, subscriptionInstace) => {
			const subscriptionInstanceDeactivatedData = {
				subscriptionInstanceId,
				subscriptionInstace,
			};

			const subscriptionInstanceDeactivated =
				await prisma.subscriptionInstanceCreated.findUnique({
					where: {
						subscriptionInstanceId:
							subscriptionInstanceDeactivatedData.subscriptionInstanceId,
					},
				});

			if (!subscriptionInstanceDeactivated) {
				const SubscriptionInstanceDeactivated =
					await prisma.subscriptionInstanceCreated.update({
						where: {
							subscriptionInstanceId:
								subscriptionInstanceDeactivatedData.subscriptionInstanceId,
						},
						data: {
							active: false,
						},
					});

				console.info(
					'SubscriptionInstance deleted: ',
					SubscriptionInstanceDeactivated
				);
			}
		}
	);
};
