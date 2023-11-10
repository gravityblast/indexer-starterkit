import { Abi } from "abitype";
import { createIndexer, createHttpRpcClient } from "chainsauce";
import { createEvent } from "./db.js";
import { config } from "./config.js";
import { fetchAbi } from "./etherscan.js";
import { Logger, pino } from "pino";

// FIXME: !!!
eval(`BigInt.prototype.toJSON = function () {
  return this.toString();
};`);

type Address = `0x${string}`;

type ContractConfig = {
  name: string;
  address: Address;
  implementationAddress?: Address;
  chainId: number;
};

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

async function createChainIndexer(
  chainId: number,
  contractsConfig: ContractConfig[],
  logger: Logger,
) {
  const contracts: Record<string, Abi> = {};

  for (const cc of contractsConfig) {
    const abi = await fetchAbi(cc.implementationAddress || cc.address);
    contracts[cc.name] = abi;
  }

  const indexer = createIndexer({
    chain: {
      id: chainId,
      rpcClient: createHttpRpcClient({
        url: `https://goerli.infura.io/v3/${config.infura.apiKey}`,
      }),
    },
    contracts,
    logger: (level, msg, data) => {
      if (level === "error") {
        logger.error({ msg, data });
      } else if (level === "warn") {
        logger.warn({ msg, data });
      } else if (level === "info") {
        logger.info({ msg, data });
      } else if (level === "debug") {
        logger.debug({ msg, data });
      } else if (level === "trace") {
        logger.trace({ msg, data });
      }
    },
  });

  for (const cc of contractsConfig) {
    indexer.subscribeToContract({
      contract: cc.name,
      address: cc.address,
    });
  }

  indexer.on("event", async ({ event }) => {
    console.log("Event:", event);
    await createEvent({
      chain_id: chainId,
      address: event.address as string,
      name: event.name,
      params: event.params,
      contract_name: "??",
      // metadata: { foo: event.params["metadata"] },
    });
  });

  indexer.on("error", (error) => {
    console.error("error", error);
  });

  return indexer;
}

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
  console.log("----------- 1");
  await indexer.indexToBlock("latest");
  console.log("----------- 2");
  indexer.watch();
  console.log("----------- 3");
}

main();
