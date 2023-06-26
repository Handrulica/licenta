import { Contract } from "ethers";
import { prisma } from "./prisma";

export const onSubscriptionCreated = async (contract: Contract) => {
  contract.on(
    "SubscriptionCreated",
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
      const subscriptionCreatedData = {
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

      const subscriptionCreated = await prisma.subscriptionCreated.findUnique({
        where: {
          subscriptionId: subscriptionCreatedData.subscriptionId,
        },
      });

      if (!subscriptionCreated) {
        const newSubscriptionCreated = await prisma.subscriptionCreated.create({
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

        console.info("New subscription created: ", newSubscriptionCreated);
      }

      console.info("Subscription already exist");
    }
  );
};
