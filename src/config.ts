import { z } from "zod";

export const config = {
  etherscan: {
    apiKey: z.string().min(1).parse(process.env.ETHERSCAN_API_KEY),
  },
  infura: {
    apiKey: z.string().min(1).parse(process.env.INFURA_API_KEY),
  },
};
