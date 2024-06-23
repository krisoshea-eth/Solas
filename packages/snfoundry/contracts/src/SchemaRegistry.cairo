// This contract is responsible for registering and retrieving schemas for Solas.
use starknet::{ContractAddress, get_caller_address};

#[starknet::interface]
pub trait ISchemaRegistry<TContractState> {
    /// @notice Submits and reserves a new schema
    /// @param schema The schema data schema.
    /// @param revocable Whether the schema allows revocations explicitly.
    /// @return The UID of the new schema.
    fn register(ref self: TContractState, schema: ByteArray, revocable: bool) -> u128;
    /// @notice Returns an existing schema by UID
    /// @param uid The UID of the schema to retrieve.
    /// @return The schema data members.
    fn get_schema(self: @TContractState, uid: u128) -> (u128, bool, ByteArray);
}

#[starknet::contract]
mod SchemaRegistry {
    use super::{ContractAddress, ISchemaRegistry, get_caller_address};

    /// @notice A struct representing a record for a submitted schema.
    #[derive(Drop, Serde, starknet::Store)]
    pub struct SchemaRecord {
        uid: u128, // The unique identifier of the schema.
        revocable: bool, // Whether the schema allows revocations explicitly.
        schema: ByteArray // Custom specification of the schema
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Registered: Registered
    }

    #[derive(Drop, starknet::Event)]
    struct Registered {
        #[key]
        uid: u128,
        caller: ContractAddress,
        schema_record: ByteArray,
    }

    #[storage]
    struct Storage {
        // The global mapping between schema records and their IDs.
        registry: LegacyMap<u128, SchemaRecord>,
        // uid counter, defaults to 0, first schema registered will have uid 1
        current_uid: u128,
    }

    #[abi(embed_v0)]
    impl SchemaRegistryImpl of ISchemaRegistry<ContractState> {
        fn get_schema(self: @ContractState, uid: u128) -> (u128, bool, ByteArray) {
            let data = self.registry.read(uid);
            (data.uid, data.revocable, data.schema)
        }

        fn register(ref self: ContractState, schema: ByteArray, revocable: bool) -> u128 {
            // Currently keeping a global counter for current_uid
            // TODO: change to a better way of generating UIDs e.g. hashing the schema
            // which will avoid duplicate schemas
            self.current_uid.write(self.current_uid.read() + 1);

            let uid = self.current_uid.read();
            let schema_clone = schema.clone();
            let registered_schema = SchemaRecord { uid, revocable, schema };

            self
                .emit(
                    Registered { uid, caller: get_caller_address(), schema_record: schema_clone }
                );

            self.registry.write(uid, registered_schema);
            uid
        }
    }
}
