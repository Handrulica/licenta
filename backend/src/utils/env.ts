import { cleanEnv, str } from "envalid";
import dotenv from "dotenv";

dotenv.config();

export const env = cleanEnv(process.env, {
  ETH_ADDRESS: str(),
  PROVIDER: str(),
});
