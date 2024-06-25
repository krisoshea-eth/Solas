// use array::ArrayTrait;
// use option::OptionTrait;
// use serde::Serde;
// use snforge_std::ContractClassTrait;
// use traits::TryInto;

// // Helper function to deploy the SAS contract
// fn deploy_sas(registry_address: ContractAddress) -> ContractAddress {
//     let contract = declare("SAS");
//     let mut calldata = array![];
//     calldata.append_serde(registry_address);
//     let (contract_address, _) = contract.deploy(@calldata).unwrap();
//     contract_address
// }

// // Helper function to create a mock schema registry
// fn deploy_mock_schema_registry() -> ContractAddress {
//     // Implement mock schema registry deployment
//     // For now, we'll just return a dummy address
//     starknet::contract_address_const::<0x1234>()
// }

// #[test]
// fn test_sas_deployment() {
//     let registry_address = deploy_mock_schema_registry();
//     let sas_address = deploy_sas(registry_address);
//     let dispatcher = ISASDispatcher { contract_address: sas_address };

//     assert_eq!(
//         dispatcher.get_schema_registry(), registry_address, "Should have correct schema registry"
//     );
// }

// #[test]
// fn test_attest() {
//     let registry_address = deploy_mock_schema_registry();
//     let sas_address = deploy_sas(registry_address);
//     let dispatcher = ISASDispatcher { contract_address: sas_address };

//     let schema = 0x1234_felt252;
//     let recipient = starknet::contract_address_const::<0x5678>();
//     let attestation_request = AttestationRequest {
//         schema,
//         data: AttestationRequestData {
//             recipient, expirationTime: 0, revocable: true, refUID: 0, data: array![], value: 0,
//         },
//     };

//     let uid = dispatcher.attest(attestation_request);
//     assert_ne!(uid, 0, "Should return a non-zero UID");

//     let attestation = dispatcher.get_attestation(uid);
//     assert_eq!(attestation.schema, schema, "Should have correct schema");
//     assert_eq!(attestation.recipient, recipient, "Should have correct recipient");
// }

// #[test]
// fn test_revoke() {
//     let registry_address = deploy_mock_schema_registry();
//     let sas_address = deploy_sas(registry_address);
//     let dispatcher = ISASDispatcher { contract_address: sas_address };

//     // First, create an attestation
//     let schema = 0x1234_felt252;
//     let attestation_request = AttestationRequest {
//         schema,
//         data: AttestationRequestData {
//             recipient: starknet::contract_address_const::<0x5678>(),
//             expirationTime: 0,
//             revocable: true,
//             refUID: 0,
//             data: array![],
//             value: 0,
//         },
//     };
//     let uid = dispatcher.attest(attestation_request);

//     // Now revoke it
//     let revocation_request = RevocationRequest {
//         schema, data: RevocationRequestData { uid, value: 0 },
//     };
//     dispatcher.revoke(revocation_request);

//     let attestation = dispatcher.get_attestation(uid);
//     assert_ne!(attestation.revocation_time, 0, "Attestation should be revoked");
// }

// #[test]
// fn test_timestamp() {
//     let registry_address = deploy_mock_schema_registry();
//     let sas_address = deploy_sas(registry_address);
//     let dispatcher = ISASDispatcher { contract_address: sas_address };

//     let data = 0x1234_felt252;
//     let timestamp = dispatcher.timestamp(data);
//     assert_ne!(timestamp, 0, "Should return a non-zero timestamp");

//     let stored_timestamp = dispatcher.get_timestamp(data);
//     assert_eq!(stored_timestamp, timestamp, "Stored timestamp should match");
// }

// #[test]
// fn test_revoke_offchain() {
//     let registry_address = deploy_mock_schema_registry();
//     let sas_address = deploy_sas(registry_address);
//     let dispatcher = ISASDispatcher { contract_address: sas_address };

//     let data = 0x1234_felt252;
//     let timestamp = dispatcher.revoke_offchain(data);
//     assert_ne!(timestamp, 0, "Should return a non-zero timestamp");

//     let stored_timestamp = dispatcher.get_revoke_offchain(starknet::get_caller_address(), data);
//     assert_eq!(stored_timestamp, timestamp, "Stored revocation timestamp should match");
// }

// #[test]
// fn test_attestation_validity() {
//     let registry_address = deploy_mock_schema_registry();
//     let sas_address = deploy_sas(registry_address);
//     let dispatcher = ISASDispatcher { contract_address: sas_address };

//     let schema = 0x1234_felt252;
//     let attestation_request = AttestationRequest {
//         schema,
//         data: AttestationRequestData {
//             recipient: starknet::contract_address_const::<0x5678>(),
//             expirationTime: 0,
//             revocable: true,
//             refUID: 0,
//             data: array![],
//             value: 0,
//         },
//     };
//     let uid = dispatcher.attest(attestation_request);

//     assert!(dispatcher.is_attestation_valid(uid), "Attestation should be valid");
//     assert!(!dispatcher.is_attestation_valid(0), "Empty UID should be invalid");
// }
// // Additional tests can be added for multi-attestation, delegation, and other complex scenarios


