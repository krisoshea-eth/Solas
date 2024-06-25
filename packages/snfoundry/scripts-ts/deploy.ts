import { deployContract, deployer, exportDeployments } from "./deploy-contract";

const deployScript = async (): Promise<void> => {
  // await deployContract(
  //   {
  //     owner: deployer.address, // the deployer address is the owner of the contract
  //   },
  //   "SchemaRegistry",
  // );

  await deployContract(
    {
      schema_registry_address:
        "0x048ec8a62f68659ed94e57e497e154d96cc4d5356ef35a58c6b3f4e034325a8f", // the deployer address is the owner of the contract,
    },
    "AttestationRegistry"
  );
};

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
