use core::array::Array;
use core::array::ArrayTrait;
use core::array::SpanTrait;
use core::box::BoxTrait;
use core::hash::LegacyHash;
use core::option::OptionTrait;
use core::serde::Serde;
use core::traits::TryInto;
use core::traits::Copy;
use starknet::ContractAddress;
use starknet::SyscallResult;
use starknet::storage_access::{StorageAddress, StorageBaseAddress};
use starknet::storage_access::Store;
use starknet::syscalls::call_contract_syscall;
use starknet::{get_block_timestamp, get_caller_address};

// Define structs
#[derive(Drop, Serde)]
struct Attestation {
    uid: felt252,
    schema: felt252,
    time: u64,
    expiration_time: u64,
    revocation_time: u64,
    ref_uid: felt252,
    recipient: ContractAddress,
    attester: ContractAddress,
    revocable: bool,
    data: Array<felt252>,
}

#[derive(Drop, Serde)]
struct AttestationRequestData {
    recipient: ContractAddress,
    expirationTime: u64,
    revocable: bool,
    refUID: felt252,
    data: Array<felt252>,
    value: u256,
}

#[derive(Drop, Serde)]
struct AttestationRequest {
    schema: felt252,
    data: AttestationRequestData,
}

#[derive(Drop, Serde)]
struct AttestationsResult {
    used_value: u256,
    uids: Array<felt252>,
}

#[derive(Drop, Serde)]
struct RevocationRequestData {
    uid: felt252,
    value: u256,
}

#[derive(Drop, Serde)]
struct RevocationRequest {
    schema: felt252,
    data: RevocationRequestData,
}

#[derive(Drop, Serde)]
struct SchemaRecord {
    uid: felt252,
    schema: felt252,
    revocable: bool,
}

#[derive(Drop, Serde)]
struct Signature {
    v: felt252,
    r: felt252,
    s: felt252,
}

impl AttestationRequestDataCopy of Copy<AttestationRequestData>;
impl ArrayFelt252Copy of Copy<Array<felt252>>;


#[starknet::interface]
pub trait ISAS<TContractState> {
    fn get_schema_registry(self: @TContractState) -> ContractAddress;
    fn get_schema(self: @TContractState, schema_uid: felt252) -> SchemaRecord;
    fn attest(ref self: TContractState, request: AttestationRequest) -> felt252;
    fn revoke(ref self: TContractState, request: RevocationRequest);
    fn timestamp(ref self: TContractState, data: felt252) -> u64;
    fn revoke_offchain(ref self: TContractState, data: felt252) -> u64;
    fn get_attestation(self: @TContractState, uid: felt252) -> Attestation;
    fn is_attestation_valid(self: @TContractState, uid: felt252) -> bool;
    fn get_timestamp(self: @TContractState, data: felt252) -> u64;
    fn get_revoke_offchain(self: @TContractState, revoker: ContractAddress, data: felt252) -> u64;
}

impl AttestationStore of Store<Attestation> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Attestation> {
        StorageAccess::read(address_domain, base)
    }
    fn write(address_domain: u32, base: StorageBaseAddress, value: Attestation) -> SyscallResult<()> {
        StorageAccess::write(address_domain, base, value)
    }
    fn read_at_offset(address_domain: u32, base: StorageBaseAddress, offset: u8) -> SyscallResult<felt252> {
        StorageAccess::read_at_offset(address_domain, base, offset)
    }
    fn write_at_offset(address_domain: u32, base: StorageBaseAddress, offset: u8, value: felt252) -> SyscallResult<()> {
        StorageAccess::write_at_offset(address_domain, base, offset, value)
    }
    fn size() -> u8 {
        Attestation::size()
    }
}

impl SchemaRecordStore of Store<SchemaRecord> {
    fn read(address: StorageAddress) -> SyscallResult<SchemaRecord> {
        StorageAccess::read(address)
    }
    fn write(address: StorageAddress, value: SchemaRecord) -> SyscallResult<()> {
        StorageAccess::write(address, value)
    }
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
    use super::{Attestation, AttestationRequest, RevocationRequest};

    // Constants
    const EMPTY_UID: felt252 = 0;
    const NO_EXPIRATION_TIME: u64 = 0;
    const ZERO_ADDRESS: felt252 = 0x0;

    // Errors
    #[derive(Drop, starknet::Event)]
    enum SASError {
        AlreadyRevoked,
        AlreadyRevokedOffchain,
        AlreadyTimestamped,
        AttestationNotFound,
        AccessDenied,
        DeadlinePassed,
        InsufficientValue,
        InvalidAttestation,
        InvalidAttestations,
        InvalidExpirationTime,
        InvalidOffset,
        InvalidRegistry,
        InvalidRevocation,
        InvalidRevocations,
        InvalidSchema,
        InvalidSignature,
        InvalidVerifier,
        Irrevocable,
        NotPayable,
        WrongSchema,
    }

    // Storage variables
    #[storage]
    struct Storage {
        schema_registry: ContractAddress,
        db: LegacyMap::<felt252, Attestation>,
        timestamps: LegacyMap::<felt252, u64>,
        revocations_offchain: LegacyMap::<(ContractAddress, felt252), u64>,
        schemas: LegacyMap::<felt252, super::SchemaRecord>,
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
        uid: felt252,
        #[key]
        schema_uid: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct Revoked {
        #[key]
        recipient: ContractAddress,
        #[key]
        attester: ContractAddress,
        uid: felt252,
        #[key]
        schema_uid: felt252,
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
        assert(registry.into() != ZERO_ADDRESS, 'Invalid registry');
        self.schema_registry.write(registry);
    }

    // External functions
    #[abi(embed_v0)]
    impl SAS of super::ISAS<ContractState> {
        fn get_schema_registry(self: @ContractState) -> ContractAddress {
            self.schema_registry.read()
        }

        fn get_schema(self: @ContractState, schema_uid: felt252) -> super::SchemaRecord {
            self.schemas.read(schema_uid)
        }

        fn attest(ref self: ContractState, request: AttestationRequest) -> felt252 {
            let mut data = ArrayTrait::new();
            data.append(request.data);
            let result = self._attest(request.schema, data, get_caller_address(), 0, true);
            *ArrayTrait::at(@result.uids, 0)
        }

        fn revoke(ref self: ContractState, request: RevocationRequest) {
            let mut data = ArrayTrait::new();
            data.append(request.data);
            self._revoke(request.schema, data, get_caller_address(), 0, true);
        }

        fn timestamp(ref self: ContractState, data: felt252) -> u64 {
            let time = get_block_timestamp();
            self._timestamp(data, time);
            time
        }

        fn revoke_offchain(ref self: ContractState, data: felt252) -> u64 {
            let time = get_block_timestamp();
            self._revoke_offchain(get_caller_address(), data, time);
            time
        }

        fn get_attestation(self: @ContractState, uid: felt252) -> Attestation {
            self.db.read(uid)
        }

        fn is_attestation_valid(self: @ContractState, uid: felt252) -> bool {
            self.db.read(uid).uid != EMPTY_UID
        }

        fn get_timestamp(self: @ContractState, data: felt252) -> u64 {
            self.timestamps.read(data)
        }

        fn get_revoke_offchain(
            self: @ContractState, revoker: ContractAddress, data: felt252
        ) -> u64 {
            self.revocations_offchain.read((revoker, data))
        }
    }
    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _attest(
            ref self: ContractState,
            schema_uid: felt252,
            data: Array<super::AttestationRequestData>,
            attester: ContractAddress,
            available_value: u256,
            last: bool
        ) -> super::AttestationsResult {
            let mut result = super::AttestationsResult { used_value: 0, uids: ArrayTrait::new() };
            let schema_record = self.get_schema(schema_uid);
            assert(schema_record.uid != EMPTY_UID, 'Invalid schema');
    
            let mut i = 0;
            loop {
                if i >= data.len() {
                    break;
                }
                let request: super::AttestationRequestData = *data[i];
                assert(
                    request.expirationTime == NO_EXPIRATION_TIME
                        || request.expirationTime > get_block_timestamp(),
                    'Invalid expiration time'
                );
                assert(schema_record.revocable || !request.revocable, 'Schema is not revocable');
    
                let attestation = Attestation {
                    uid: EMPTY_UID,
                    schema: schema_uid,
                    ref_uid: request.refUID,
                    time: get_block_timestamp(),
                    expiration_time: request.expirationTime,
                    revocation_time: 0,
                    recipient: request.recipient,
                    attester,
                    revocable: request.revocable,
                    data: request.data,
                };
    
                let uid = self._get_uid(@attestation, 0);
                assert(self.db.read(uid).uid == EMPTY_UID, 'UID already exists');
    
                self.db.write(uid, attestation);
                result.uids.append(uid);
                self.emit(Event::Attested(Attested { 
                    recipient: request.recipient, 
                    attester, 
                    uid, 
                    schema_uid 
                }));
    
                i += 1;
            };
    
            result
        }

        fn _revoke(
            ref self: ContractState,
            schema_uid: felt252,
            data: Array<super::RevocationRequestData>,
            revoker: ContractAddress,
            available_value: u256,
            last: bool
        ) -> u256 {
            // Ensure that a non-existing schema ID wasn't passed by accident.
            let schema_record = self.get_schema(schema_uid);
            assert(schema_record.uid != EMPTY_UID, 'Invalid schema');

            let mut attestations = ArrayTrait::new();
            let mut values = ArrayTrait::new();

            let mut i = 0;
            loop {
                if i >= data.len() {
                    break;
                }
                let request = *data[i];
                let mut attestation = self.db.read(request.uid);

                // Ensure that we aren't attempting to revoke a non-existing attestation.
                assert(attestation.uid != EMPTY_UID, 'Attestation not found');

                // Ensure that a wrong schema ID wasn't passed by accident.
                assert(attestation.schema == schema_uid, 'Invalid schema');

                // Allow only original attesters to revoke their attestations.
                assert(attestation.attester == revoker, 'Access denied');

                // Ensure the attestation is revocable
                assert(attestation.revocable, 'Irrevocable');

                // Ensure that we aren't trying to revoke the same attestation twice.
                assert(attestation.revocation_time == 0, 'Already revoked');

                attestation.revocation_time = get_block_timestamp();

                attestations.append(attestation);
                values.append(request.value);

                self
                    .emit(
                        Event::Revoked(
                            Revoked {
                                recipient: attestation.recipient,
                                attester: revoker,
                                uid: request.uid,
                                schema_uid: schema_uid
                            }
                        )
                    );

                i += 1;
            };

            self
                ._resolve_attestations(
                    schema_record, attestations, values, true, available_value, last
                )
        }

        fn _timestamp(ref self: ContractState, data: felt252, time: u64) {
            assert(self.timestamps.read(data) == 0, 'Already timestamped');
            self.timestamps.write(data, time);
            self.emit(Event::Timestamped(Timestamped { data, timestamp: time }));
        }

        fn _revoke_offchain(
            ref self: ContractState, revoker: ContractAddress, data: felt252, time: u64
        ) {
            let current_revocation = self.revocations_offchain.read((revoker, data));
            assert(current_revocation == 0, 'Already revoked offchain');
            self.revocations_offchain.write((revoker, data), time);
            self.emit(Event::RevokedOffchain(RevokedOffchain { revoker, data, timestamp: time }));
        }

        fn _get_uid(ref self: ContractState, attestation: @Attestation, bump: u32) -> felt252 {
            let mut state = 0;
            state = LegacyHash::hash(state, *attestation.schema);
            state = LegacyHash::hash(state, attestation.recipient.into());
            state = LegacyHash::hash(state, attestation.attester.into());
            state = LegacyHash::hash(state, attestation.time.into());
            state = LegacyHash::hash(state, attestation.expiration_time.into());
            state = LegacyHash::hash(state, if *attestation.revocable {
                1
            } else {
                0
            });
            state = LegacyHash::hash(state, *attestation.ref_uid);
            state = LegacyHash::hash(state, bump.into());
            state
        }

        fn _refund(ref self: ContractState, remaining_value: u256) {
            if remaining_value > 0 {
                // Note: In Cairo/StarkNet, transferring value works differently.
                // You might need to implement a custom logic for refunds.
                // This is a placeholder and needs to be implemented according to StarkNet's value transfer mechanism.
                let _recipient = get_caller_address();
            // Implement value transfer here
            }
        }

        fn _merge_uids(
            ref self: ContractState, uid_lists: Array<Array<felt252>>, uid_count: usize
        ) -> Array<felt252> {
            let mut uids = ArrayTrait::new();
            let mut current_index = 0;
            let mut i = 0;
            loop {
                if i >= uid_lists.len() {
                    break;
                }
                let current_uids = *uid_lists[i];
                let mut j = 0;
                loop {
                    if j >= current_uids.len() {
                        break;
                    }
                    uids.append(*current_uids[j]);
                    current_index += 1;
                    j += 1;
                };
                i += 1;
            };
            uids
        }

        // Helper functions 

        fn _verify_signature(
            ref self: ContractState,
            signature: Array<felt252>,
            signer: ContractAddress,
            deadline: u64,
            schema: felt252,
            data: super::AttestationRequestData
        ) {
            assert(get_block_timestamp() <= deadline, 'Deadline passed');

            let message_hash = self._get_message_hash(schema, data, signer, deadline);

            // Verify the signature using the StarkNet account abstraction
            let is_valid = self._is_valid_signature(signer, message_hash, signature);
            assert(is_valid, 'Invalid signature');
        }

        fn _get_message_hash(
            self: @ContractState,
            schema: felt252,
            data: super::AttestationRequestData,
            signer: ContractAddress,
            deadline: u64
        ) -> felt252 {
            // Construct the message to be signed
            let mut message = ArrayTrait::new();
            message.append(schema);
            message.append(data.recipient.into());
            message.append(data.expirationTime.into());
            message.append(data.revocable.into());
            message.append(data.refUID);
            // Append data array elements
            let mut i = 0;
            loop {
                if i >= data.data.len() {
                    break;
                }
                message.append(*data.data[i]);
                i += 1;
            };
            message.append(data.value.low.into());
            message.append(data.value.high.into());
            message.append(signer.into());
            message.append(deadline.into());

            // Hash the message
            let mut state = 0;
            let mut i = 0;
            loop {
                if i >= message.len() {
                    break;
                }
                state = LegacyHash::hash(state, *message[i]);
                i += 1;
            };
            state
        }

        fn _is_valid_signature(
            self: @ContractState,
            signer: ContractAddress,
            message_hash: felt252,
            signature: Array<felt252>
        ) -> bool {
            let is_valid_signature_selector = selector!("is_valid_signature");
            let mut calldata = ArrayTrait::new();
            calldata.append(message_hash);
            calldata.append(signature.len().into());
            calldata.append_span(signature.span());

            match call_contract_syscall(signer, is_valid_signature_selector, calldata.span()) {
                Result::Ok(retdata) => {
                    retdata[0] == 'VALID'
                },
                Result::Err(_) => false,
            }
        }
    }
}

