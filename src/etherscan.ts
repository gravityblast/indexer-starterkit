import fetch, { Response } from "node-fetch";
import { config } from "./config.js";

class EtherscanError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class EtherscanResponseError extends Error {
  public readonly status: number;

  constructor(status: number) {
    super(`status ${status}`);
    this.status = status;
  }
}

export async function fetchAbi(address: `0x${string}`) {
  const url = new URL("https://api-goerli.etherscan.io/api");
  const params = new URLSearchParams({
    module: "contract",
    action: "getabi",
    apikey: config.etherscan.apiKey,
    address,
  });

  url.search = params.toString();

  return fetch(url)
    .then((r: Response) => {
      if (r.status < 200 || r.status > 299) {
        throw new EtherscanResponseError(r.status);
      }

      return r.json();
    })
    .then((obj: any) => {
      if (obj.message !== "OK") {
        throw new EtherscanError(obj.result);
      }

      return JSON.parse(obj.result);
    });
}
