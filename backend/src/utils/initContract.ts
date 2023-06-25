import fs from "fs";
import { env } from "./env";
import { Contract, EtherscanProvider } from "ethers";

const BLOCKAIN_ARTIFACTS_PATH = `${__dirname}/../../../blockchain/artifacts/contracts/SubscriptionStorage.sol/SubscriptionStorage.json`;

export const initContract = async () => {
  const ethAddress = env.ETH_ADDRESS;
  const provider = new EtherscanProvider(env.PROVIDER);

  const smartContract = await fs.promises.readFile(
    BLOCKAIN_ARTIFACTS_PATH,
    "utf-8"
  );
  const smartContractAsJSON = JSON.parse(smartContract);
  const abi = smartContractAsJSON.abi;

  const contract = new Contract(ethAddress, abi, provider);

  return contract;
};
