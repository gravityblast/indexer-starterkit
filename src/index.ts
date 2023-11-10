import { pino } from "pino";
import { ContractConfig, createChainIndexer } from "./indexer.js";

// FIXME: !!!
eval(`BigInt.prototype.toJSON = function () {
  return this.toString();
};`);

const contractsConfig: ContractConfig[] = [
  // {
  //   name: "Allo V1 Registry",
  //   chainId: 1,
  //   address: "0x03506eD3f57892C85DB20C36846e9c808aFe9ef4",
  //   implementationAddress: "0x15fa08599eb017f89c1712d0fe76138899fdb9db",
  // },
  {
    name: "Allo V1 Registry",
    chainId: 5,
    address: "0xa71864fAd36439C50924359ECfF23Bb185FFDf21",
    implementationAddress: "0xf1d4f5f21746bcd75fd71eb18992443f4f0edb6f",
  },
  {
    name: "Allo V2 Registry",
    chainId: 5,
    address: "0x4AAcca72145e1dF2aeC137E1f3C5E3D75DB8b5f3",
    implementationAddress: "0xa3fd7042f83960398de6ceddbf513f8cac877cbe",
  },
];

async function main() {
  const logger = pino({
    level: "trace",
    formatters: {
      level(level) {
        // represent severity as strings so that DataDog can recognize it
        return { level };
      },
    },
  });
  const indexer = await createChainIndexer(5, contractsConfig, logger);
  await indexer.indexToBlock("latest");
  indexer.watch();
}

main();
