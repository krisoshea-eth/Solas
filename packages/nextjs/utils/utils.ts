import { provider } from "~~/utils/Provider";
import { Contract } from "starknet";

import ERC20abi from "~~/utils/solas-abis/ERC20.json";
const contractAddress =
  "0x041e7455a1009c150268b1bfec337246e4539f07885315b69495dac1abf5ff4c";

const contract = new Contract(ERC20abi, contractAddress, provider);

export type Attestation = {
  attester: any;
  data: any
  recipient: any;
  revocable: any;
  revocation_time: any;
  schema_uid: any;
  time: any;
  uid: any;
};

export type Schema = {
  uid: string;
  schema: string;
  attestations: number;
};

export const fetchAllSchemas = async () => {
  // Replace this with your actual fetch call to get attestation data
  return [
    {
      uid: "0x041e7455a1009c150268b1bfec337246e4539f07885315b69495dac1abf5ff4c",
      schema: "address author uint stakeAmaount uint royaltyAmount",
      attestations: 100,
    },
    {
      uid: "0x041e7455a1009c150268b1bfec337246e4539f07885315b69495dac1abf5ff4c",
      schema: "address author uint stakeAmaount uint royaltyAmount",
      attestations: 45,
    },
    {
      uid: "0x041e7455a1009c150268b1bfec337246e4539f07885315b69495dac1abf5ff4c",
      schema: "address author uint stakeAmaount uint royaltyAmount",
      attestations: 33,
    },
  ];
};

// Dummy fetch function to simulate fetching attestation data
export const fetchSchema = async (uuid: string): Promise<Schema> => {
  // Replace this with your actual fetch call to get attestation data
  return {
    uid: uuid,
    schema: "address author uint stakeAmaount uint royaltyAmount",
    attestations: 100,
  };
};

export const fetchAllAttestations = async () => {
  // Replace this with your actual fetch call to get attestation data
  return [
    {
      uid: "0x041e7455a1009c150268b1bfec337246e4539f07885315b69495dac1abf5ff4c",
      schema: "Endorsements",
      from: "attestations.icebreakerlabs.eth",
      to: "0xD7F75E6bB7717d4C6Df...",
      type: "OFFCHAIN",
      age: timeAgo(1719088781),
    },
    {
      uid: "0x041e7455a1009c150268b1bfec337246e4539f07885315b69495dac1abf5ff4c",
      schema: "Endorsements",
      from: "attestations.icebreakerlabs.eth",
      to: "0xD7F75E6bB7717d4C6Df...",
      type: "OFFCHAIN",
      age: timeAgo(1719058781),
    },
    {
      uid: "0x041e7455a1009c150268b1bfec337246e4539f07885315b69495dac1abf5ff4c",
      schema: "Endorsements",
      from: "attestations.icebreakerlabs.eth",
      to: "0xD7F75E6bB7717d4C6Df...",
      type: "OFFCHAIN",
      age: timeAgo(1719088681),
    },
    // Add more attestations as needed
  ];
};

// Dummy fetch function to simulate fetching attestation data
export const fetchAttestation = async (uuid: string): Promise<Attestation> => {
  // Replace this with your actual fetch call to get attestation data
  return {
    uid: uuid,
    schema: "#159",
    isEndorsement: true,
    name: "Worked with",
    domain: "via 0x794ce...",
    context: "via 0x794ce...",
    ipfsHash: "ipfs://QmZaTm...Jx3ziBQnPS",
    from: "0x07a059F968efF2D70973Ed90abfb5B93DD6050198888792b5EAE5798BdE677E",
    to: "0xd34d059F968efF2D70973Ed90abfb5B93DD6050198888792b5EAE5798BdE677E",
    created: "06/22/2024 3:13:21 am",
    expiration: "Never",
    revoked: "No",
  };
};

export const fetchTokenName = async (): Promise<any> => {
  try {
    const name = await contract.call("name");
    console.log("Token Name:", name);
    return name;
  } catch (error) {
    console.error("Error fetching token name:", error);
  }
};

export const getSpecVersion = async (): Promise<any> => {
  try {
    const specVersion = await provider.getSpecVersion();
    console.log("Spec version is: ", specVersion);
    return specVersion;
  } catch (error) {
    console.error("Error fetching spec version:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};

export const shortAddress = (addr: string): string => {
  if (!addr) {
    return "";
  }
  return (
    addr.toString().substring(0, 6) +
    "..." +
    addr
      .toString()
      .substring(addr.toString().length - 6, addr.toString().length + 1)
  );
};

export const timeAgo = (timestamp: number): string => {
  const now = Date.now();
  const past = timestamp * 1000; // Convert seconds to milliseconds
  const diff = now - past;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
};

export const stringifyBigInt = (obj: any) => {
  return JSON.stringify(obj, (_, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
};
