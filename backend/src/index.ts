import { initContract } from "./utils/initContract";

const main = async () => {
  const contract = await initContract();
};

main().catch((err) => {
  if (err instanceof Error) {
    throw Error(err.message);
  }

  throw new Error(err);
});
