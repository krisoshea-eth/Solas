use starknet::ContractAddress;
use super::SchemaRegistry::{ISchemaRegistry, ISchemaRegistryDispatcher};

#[starknet::interface]
pub trait IAttestationRegistry<TContractState> {
    fn get_attestation(self: @TContractState, attestation_uid: u128) -> Attestation;
    fn attest(
        ref self: TContractState,
        schema_uid: u128,
        recipient: ContractAddress,
        data: ByteArray,
        revocable: bool
    ) -> u128;
    fn revoke(ref self: TContractState, schema_uid: u128, attestation_uid: u128);
}

// Define structs
#[derive(Drop, Serde, starknet::Store, Clone)]
struct Attestation {
    uid: u128,
    schema_uid: u128,
    time: u64,
    recipient: ContractAddress,
    attester: ContractAddress,
    data: ByteArray,
    revocable: bool,
    revocation_time: u64,
}

#[derive(Drop, Serde, starknet::Store)]
struct AttestationRequest {
    schema_uid: u128,
    recipient: ContractAddress,
    data: ByteArray,
    revocable: bool
}

#[derive(Drop, Serde, starknet::Store)]
struct RevocationRequest {
    schema_uid: u128,
    attestation_uid: u128,
}

#[starknet::contract]
mod AttestationRegistry {
    use contracts::SchemaRegistry::ISchemaRegistryDispatcherTrait;
    use core::traits::Into;
    use starknet::{get_caller_address, get_block_timestamp};
    use super::{
        ContractAddress, IAttestationRegistry, AttestationRequest, Attestation,
        ISchemaRegistryDispatcher
    };

    // Define constants
    const EMPTY_UID: u128 = 0;
    const NO_TIME: u64 = 0;

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Attested: Attested,
        Revoked: Revoked,
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

    #[derive(Drop, starknet::Event)]
    struct Revoked {
        #[key]
        recipient: ContractAddress,
        #[key]
        attester: ContractAddress,
        #[key]
        schema_uid: u128,
        attestation_uid: u128,
    }

    #[storage]
    struct Storage {
        schema_registry: ContractAddress,
        db: LegacyMap::<u128, Attestation>,
        current_uid: u128,
    }

    // Constructor
    #[constructor]
    fn constructor(ref self: ContractState, schema_registry_address: ContractAddress) {
        self.schema_registry.write(schema_registry_address);
    }

    #[abi(embed_v0)]
    impl AttestationRegistryImpl of IAttestationRegistry<ContractState> {
        fn get_attestation(self: @ContractState, attestation_uid: u128) -> Attestation {
            let data = self.db.read(attestation_uid);
            Attestation {
                uid: data.uid,
                schema_uid: data.schema_uid,
                time: data.time,
                recipient: data.recipient,
                attester: data.attester,
                data: data.data,
                revocable: data.revocable,
                revocation_time: data.revocation_time,
            }
        }

        fn attest(
            ref self: ContractState,
            schema_uid: u128,
            recipient: ContractAddress,
            data: ByteArray,
            revocable: bool
        ) -> u128 {
            let contract_address = self.schema_registry.read();
            // check if schema exists
            let (fetched_uid, fetched_revocable, _) = ISchemaRegistryDispatcher { contract_address }
                .get_schema(schema_uid);

            assert!(fetched_uid != EMPTY_UID, "Schema Not Found");

            // check we are not trying to revoke an irrevocable schema
            if (!fetched_revocable && revocable) {
                panic!("Irrevocable");
            }

            let mut attestation = Attestation {
                uid: EMPTY_UID,
                schema_uid,
                time: get_block_timestamp(),
                recipient,
                attester: get_caller_address(),
                data,
                revocable: fetched_revocable,
                revocation_time: 0,
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
        fn revoke(ref self: ContractState, schema_uid: u128, attestation_uid: u128) {
            let contract_address = self.schema_registry.read();

            // check if schema exists
            let (fetched_schema_uid, _, _) = ISchemaRegistryDispatcher { contract_address }
                .get_schema(schema_uid);

            assert!(fetched_schema_uid != EMPTY_UID, "Schema Not Found");

            // check if attestation we are trying to revoke exists
            let mut fetched_attestation = self.db.read(attestation_uid);
            assert!(fetched_attestation.uid != EMPTY_UID, "Attestation Not Found");

            // check we are not trying to revoke an irrevocable schema
            assert!(fetched_attestation.revocable, "Irrevocable");

            // ensure that we aren't trying to revoke the same attestation twice
            assert!(fetched_attestation.revocation_time == NO_TIME, "Already Revoked");

            let revoker = get_caller_address();
            // allow only original attesters to revoke their attestations
            assert!(fetched_attestation.attester == revoker, "Access Denied");

            fetched_attestation.revocation_time = get_block_timestamp();

            self.db.write(attestation_uid, fetched_attestation.clone());

            self
                .emit(
                    Revoked {
                        recipient: fetched_attestation.recipient,
                        attester: revoker,
                        schema_uid,
                        attestation_uid,
                    }
                );
        }
    }
}

