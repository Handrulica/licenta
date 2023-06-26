import { initContract } from "./utils/initContract";
import { onSubscriptionCreated } from "./utils/onSubscriptionCreated";

const main = async () => {
  const contract = await initContract();
  await onSubscriptionCreated(contract);
};

main().catch((err) => {
  if (err instanceof Error) {
    throw Error(err.message);
  }

  throw new Error(err);
});
