import { Contract } from 'ethers';
import { prisma } from './prisma';

export const onPaymentProcessed = async (contract: Contract) => {
  contract.on(
    'PaymentProcessed',
    async (subscriptionInstanceId, subscriptionId, nextPaymentPeriod) => {
      const paymentProcessedData = {
        subscriptionInstanceId,
        subscriptionId,
        nextPaymentPeriod
      };

      const currentSubscriptionInstance =
        await prisma.subscriptionInstanceCreated.findUnique({
          where: {
            subscriptionInstanceId:
              paymentProcessedData.subscriptionInstanceId,
          },
        });

      if (currentSubscriptionInstance) {
        const CurrentSubscriptionInstance =
          await prisma.subscriptionInstanceCreated.update({
            where: {
              subscriptionInstanceId:
                paymentProcessedData.subscriptionInstanceId,
            },
            data: {
              nextPayment: nextPaymentPeriod
            }
          });

        console.info(
          'Payment Processed: ',
          CurrentSubscriptionInstance
        );
      }
    }
  );
};
