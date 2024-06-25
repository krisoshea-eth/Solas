import { deployContract, deployer, exportDeployments } from "./deploy-contract";

const deployScript = async (): Promise<void> => {
  // await deployContract(
  //   {
  //     owner: deployer.address, // the deployer address is the owner of the contract
  //   },
  //   "SchemaRegistry",
  // );
  // 0x077cf1b7bb4ce74559dbbab85714f1d69e520657670639ff77c9e99eedeb13f6

  await deployContract(
    {
      schema_registry_address:
        "0x00417a5d2dc2fe77a06f1b7efe316e789cf9fbfb2630c502d9907ed16994af67", // the deployer address is the owner of the contract,
    },
    "AttestationRegistry"
  );
};
// 0x03cdf276779fe3c83772cadc086b676c98bd602bcb8078c3736df49bb4003d0f

// await deployContract(
//   {
//     schema_registry_address: "0x075d3a77b16fdb4609b981f6f8ccb393470b67ee64a832139931483f099c36d8", // the deployer address is the owner of the contract,
//   },
//   // "SchemaRegistry",
//   "AttestationRegistry"
// );

deployScript()
  .then(() => {
    exportDeployments();
    console.log("All Setup Done");
  })
  .catch(console.error);
