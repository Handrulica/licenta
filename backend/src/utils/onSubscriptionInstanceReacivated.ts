import { Contract } from 'ethers';
import { prisma } from './prisma';

export const onSubscriptionInstanceReactivated = async (contract: Contract) => {
	contract.on(
		'SubscriptionInstanceReactivated',
		async (subscriptionInstanceId, subscriptionInstace) => {
			const subscriptionInstanceReactivatedData = {
				subscriptionInstanceId,
				subscriptionInstace,
			};

			const subscriptionInstanceReactivated =
				await prisma.subscriptionInstanceCreated.findUnique({
					where: {
						subscriptionInstanceId:
							subscriptionInstanceReactivatedData.subscriptionInstanceId,
					},
				});

			if (!subscriptionInstanceReactivated) {
				const SubscriptionInstanceReactivated =
					await prisma.subscriptionInstanceCreated.update({
						where: {
							subscriptionInstanceId:
								subscriptionInstanceReactivatedData.subscriptionInstanceId,
						},
						data: {
							active: true,
						},
					});

				console.info(
					'SubscriptionInstance deleted: ',
					SubscriptionInstanceReactivated
				);
			}
		}
	);
};
