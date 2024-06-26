import { deployContract, deployer, exportDeployments } from "./deploy-contract";

const deployScript = async (): Promise<void> => {
  // await deployContract(
  //   {
  //     owner: deployer.address, // the deployer address is the owner of the contract
  //   },
  //   "SchemaRegistry",
  // );
  // 0x0011bc1356dda0d57fe748a2f30f53e65f8cc5a16c46be71b495d71004ac9b08

  await deployContract(
    {
      schema_registry_address:
        "0x0011bc1356dda0d57fe748a2f30f53e65f8cc5a16c46be71b495d71004ac9b08", // the deployer address is the owner of the contract,
    },
    "AttestationRegistry"
  );
};

deployScript()
  .then(() => {
    exportDeployments();
    console.log("All Setup Done");
  })
  .catch(console.error);
