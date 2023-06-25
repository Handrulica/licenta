import { cleanEnv, str } from "envalid";
import dotenv from "dotenv";

dotenv.config();

export const env = cleanEnv(process.env, {
  INFURA_API_KEY: str(),
  ETHEREUM_NETWORK: str(),
  ETHEREUM_ADDRESS: str(),
});
