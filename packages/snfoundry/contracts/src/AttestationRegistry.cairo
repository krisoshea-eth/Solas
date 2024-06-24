use starknet::ContractAddress;
use super::SchemaRegistry::{ISchemaRegistry, ISchemaRegistryDispatcher};

#[starknet::interface]
pub trait IAttestationRegistry<TContractState> {
    fn attest(ref self: TContractState, schema_uid: u128, recipient: ContractAddress, data: ByteArray, revocable: bool) -> u128;
    // fn revoke(ref self: TContractState, request: RevocationRequest);
}

// Define structs
#[derive(Drop, Serde, starknet::Store)]
struct Attestation {
    uid: u128,
    schema_uid: u128,
    time: u64,
    // expiration_time: u64,
    recipient: ContractAddress,
    attester: ContractAddress,
    data: ByteArray,
}

#[derive(Drop, Serde, starknet::Store)]
struct AttestationRequest {
    schema_uid: u128,
    recipient: ContractAddress,
    // expiration_time: u64,
    data: ByteArray,
    revocable: bool
}

// #[derive(Drop, Serde, starknet::Store)]
// struct RevocationRequestData {
//     uid: felt252,
//     value: u256,
// }

// #[derive(Drop, Serde, starknet::Store)]
// struct RevocationRequest {
//     schema: felt252,
//     data: RevocationRequestData,
// }


#[starknet::contract]
mod AttestationRegistry {
    use core::traits::Into;
    use contracts::SchemaRegistry::ISchemaRegistryDispatcherTrait;
    use starknet::{get_caller_address, get_block_timestamp};
    use super::{
        ContractAddress, IAttestationRegistry, AttestationRequest, Attestation,
        ISchemaRegistryDispatcher
    };

    // Define constants
    const EMPTY_UID: u128 = 0;
    const NO_EXPIRATION_TIME: u64 = 0;

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Attested: Attested,
    // Revoked: Revoked,
    // Timestamped: Timestamped,
    // RevokedOffchain: RevokedOffchain,
    }

    #[derive(Drop, starknet::Event)]
    struct Attested {
        #[key]
        recipient: ContractAddress,
        #[key]
        attester: ContractAddress,
        uid: u128,
        #[key]
        schema_uid: u128,
        timestamp: u64,
    }

    // // The global mapping between attestations and their UIDs.
    // mapping(bytes32 uid => Attestation attestation) private _db;

    // // The global mapping between data and their timestamps.
    // mapping(bytes32 data => uint64 timestamp) private _timestamps;

    // // The global mapping between data and their revocation timestamps.
    // mapping(address revoker => mapping(bytes32 data => uint64 timestamp) timestamps) private _revocationsOffchain;
    #[storage]
    struct Storage {
        schema_registry: ContractAddress,
        db: LegacyMap::<u128, Attestation>,
        timestamps: LegacyMap::<felt252, u64>,
        current_uid: u128,
    // revocations_offchain: LegacyMap::<(ContractAddress, felt252), u64>,
    }

    // Constructor
#[constructor]
    fn constructor(ref self: ContractState, schema_registry_address: ContractAddress) {
        self.schema_registry.write(schema_registry_address);
    }

    #[abi(embed_v0)]
    impl AttestationRegistryImpl of IAttestationRegistry<ContractState> {
        fn attest(ref self: ContractState, schema_uid: u128, recipient: ContractAddress, data: ByteArray, revocable: bool) -> u128 {
            let contract_address = self.schema_registry.read();
            // let (fetched_uid, fetched_revocable, fetched_schema) = ISchemaRegistryDispatcher { contract_address }
            //     .get_schema(schema_uid);

            // assert!(fetched_uid != EMPTY_UID, "Schema Not Found");
            // assert!(
            //     request.expiration_time != NO_EXPIRATION_TIME
            //         && request.expiration_time <= get_block_timestamp(),
            //     "Invalid Expiration Time"
            // );
            // assert!(!fetched_revocable && revocable, "Irrevocable");

            let mut attestation = Attestation {
                uid: EMPTY_UID,
                schema_uid,
                time: get_block_timestamp(),
                // expiration_time: request.expiration_time,
                recipient,
                attester: get_caller_address(),
                data
            };

            self.current_uid.write(self.current_uid.read() + 1);
            let uid = self.current_uid.read();
            attestation.uid = uid;

            self.db.write(uid, attestation);

            self
                .emit(
                    Attested {
                        recipient,
                        attester: get_caller_address(),
                        uid,
                        schema_uid,
                        timestamp: get_block_timestamp()
                    }
                );

            uid
        }

        // fn revoke(ref self: ContractState, request: RevocationRequest) {}
    }
}

