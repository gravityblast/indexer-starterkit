import { Abi } from "abitype";
import { createIndexer, createHttpRpcClient } from "chainsauce";
import { createEvent } from "./db.js";
import { config } from "./config.js";
import { fetchAbi } from "./etherscan.js";
import { Logger } from "pino";

type Address = `0x${string}`;

export type ContractConfig = {
  name: string;
  address: Address;
  implementationAddress?: Address;
  chainId: number;
};

export async function createChainIndexer(
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
      // TODO
      // context: {
      //  contractName: cc.name,
      //  metadataPointerExtractFunc: cc...
      // }
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
      // TODO
      // metadata: event.context.metadataPointerExtractFunc(event.params)
    });
  });

  indexer.on("error", (error) => {
    console.error("error", error);
  });

  return indexer;
}
