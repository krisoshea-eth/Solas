use core::array::Array;
use core::array::ArrayTrait;
use core::array::SpanTrait;
use core::box::BoxTrait;
use core::byte_array::ByteArray;
use core::byte_array::ByteArrayTrait;
use core::hash::LegacyHash;
use starknet::ContractAddress;
use starknet::SyscallResult;
// use starknet::Store;
use starknet::storage_access::Store;
use starknet::storage_access::{StorageAddress, StorageBaseAddress};
use starknet::syscalls::call_contract_syscall;
use starknet::syscalls::storage_read_syscall;
use starknet::syscalls::storage_write_syscall;
use starknet::{get_block_timestamp, get_caller_address};

// Define structs
#[derive(Drop, Serde, Store)]
struct Attestation {
    uid: u128,
    schema_uid: u128,
    time: u64,
    expiration_time: u64,
    ref_uid: u128,
    recipient: ContractAddress,
    attester: ContractAddress,
    data: Array<felt252>,
}

#[derive(Drop, Serde)]
struct AttestationRequest {
    schema_uid: u128,
    recipient: ContractAddress,
    expirationTime: u64,
    refUID: u128,
    data: Array<felt252>,
}

#[derive(Drop, Serde)]
struct AttestationsResult {
    used_value: u256,
    uids: Array<u128>,
}

#[derive(Drop, Serde, Store)]
pub struct SchemaRecord {
    uid: u128, // The unique identifier of the schema.
    revocable: bool, // Whether the schema allows revocations explicitly.
    schema: ByteArray // Custom specification of the schema
}

impl ArrayFelt252Copy of Copy<Array<felt252>>;

#[starknet::interface]
pub trait ISAS<TContractState> {
    fn get_schema_registry(self: @TContractState) -> ContractAddress;
    fn attest(ref self: TContractState, request: AttestationRequest) -> u128;
    fn timestamp(ref self: TContractState, data: felt252) -> u64;
    fn get_attestation(self: @TContractState, uid: u128) -> Attestation;
    fn is_attestation_valid(self: @TContractState, uid: u128) -> bool;
    fn get_timestamp(self: @TContractState, data: felt252) -> u64;
}

#[starknet::contract]
mod SAS {
    use core::array::ArrayTrait;
    use core::array::SpanTrait;
    use core::box::BoxTrait;
    use core::hash::LegacyHash;
    use core::option::OptionTrait;
    use core::serde::Serde;
    use core::traits::TryInto;
    use starknet::SyscallResult;
    use starknet::storage_access::Store;
    use starknet::syscalls::call_contract_syscall;
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use super::{Attestation, AttestationRequest};

    // Constants
    const EMPTY_UID: u128 = 0;
    // Errors
    #[derive(Drop, starknet::Event)]
    enum SASError {
        AlreadyRevoked,
        AlreadyTimestamped,
        AttestationNotFound,
        AccessDenied,
        DeadlinePassed,
        InsufficientValue,
        InvalidAttestations,
        InvalidExpirationTime,
        InvalidOffset,
        InvalidRegistry,
        InvalidSchema,
        InvalidSignature,
        InvalidVerifier,
        NotPayable,
        WrongSchema,
    }

    // Storage variables
    #[storage]
    struct Storage {
        schema_registry: ContractAddress,
        db: LegacyMap::<u128, super::Attestation>,
        timestamps: LegacyMap::<felt252, u64>,
        schemas: LegacyMap::<felt252, super::SchemaRecord>,
        current_uid: u128,
    }

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Attested: Attested,
        Revoked: Revoked,
        Timestamped: Timestamped,
        RevokedOffchain: RevokedOffchain,
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
        uid: u128,
        #[key]
        schema_uid: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct Timestamped {
        #[key]
        data: felt252,
        #[key]
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct RevokedOffchain {
        #[key]
        revoker: ContractAddress,
        #[key]
        data: felt252,
        #[key]
        timestamp: u64,
    }
    // Constructor
    #[constructor]
    fn constructor(ref self: ContractState, registry: ContractAddress) {
        self.schema_registry.write(registry);
    }

    // External functions
    #[abi(embed_v0)]
    impl SAS of super::ISAS<ContractState> {
        fn get_schema_registry(self: @ContractState) -> ContractAddress {
            self.schema_registry.read()
        }

        fn attest(ref self: ContractState, request: AttestationRequest) -> u128 {
            let attestation = Attestation {
                uid: EMPTY_UID,
                schema_uid: request.schema_uid,
                ref_uid: request.refUID,
                time: get_block_timestamp(),
                expiration_time: request.expirationTime,
                recipient: request.recipient,
                attester: get_caller_address(),
                data: request.data,
            };

            self.current_uid.write(self.current_uid.read() + 1);
            let uid = self.current_uid.read();
            let timestamp = get_block_timestamp();

            self.db.write(uid, attestation);
            self
                .emit(
                    Event::Attested(
                        Attested {
                            recipient: request.recipient,
                            attester: get_caller_address(),
                            uid,
                            schema_uid: request.schema_uid,
                            timestamp
                        }
                    )
                );

            uid
        }

        fn timestamp(ref self: ContractState, data: felt252) -> u64 {
            let time = get_block_timestamp();
            self._timestamp(data, time);
            time
        }

        fn get_attestation(self: @ContractState, uid: u128) -> Attestation {
            self.db.read(uid)
        }

        fn is_attestation_valid(self: @ContractState, uid: u128) -> bool {
            self.db.read(uid).uid != EMPTY_UID
        }

        fn get_timestamp(self: @ContractState, data: felt252) -> u64 {
            self.timestamps.read(data)
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _timestamp(ref self: ContractState, data: felt252, time: u64) {
            assert(self.timestamps.read(data) == 0, 'Already timestamped');
            self.timestamps.write(data, time);
            self.emit(Event::Timestamped(Timestamped { data, timestamp: time }));
        }
    }
}

