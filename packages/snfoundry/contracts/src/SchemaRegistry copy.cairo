#[starknet::interface]
pub trait ISchemaRegistry<TContractState> {
    /// @notice Submits and reserves a new schema
    /// @param schema The schema data schema.
    /// @param revocable Whether the schema allows revocations explicitly.
    /// @return The UID of the new schema.
    fn register(
        ref self: TContractState, schema: Array<felt252>, revocable: bool
    ) -> felt252; // TODO: change to felt252
    /// @notice Returns an existing schema by UID
    /// @param uid The UID of the schema to retrieve.
    /// @return The schema data members.
    fn get_schema(self: @TContractState, uid: felt252) -> (felt252, bool, Array<felt252>);
}

#[starknet::contract]
mod SchemaRegistry {
    use core::poseidon::PoseidonTrait;
    use core::pedersen::PedersenTrait;
    use core::hash::{HashStateTrait, HashStateExTrait};
    // 
    // use core::array::ArrayTrait;
    use starknet::storage_access::StorageBaseAddress;
    use starknet::SyscallResultTrait;
    // 


    use super::ISchemaRegistry;

    /// @notice A struct representing a record for a submitted schema.
    #[derive(Drop, Serde, starknet::Store)]
    pub struct SchemaRecord {
        uid: felt252, // The unique identifier of the schema.
        revocable: bool, // Whether the schema allows revocations explicitly.
        schema: Array<felt252> // Custom specification of the schema
    }

    #[storage]
    struct Storage {
        // The global mapping between schema records and their IDs.
        registry: LegacyMap<felt252, SchemaRecord>,
        next_uid: felt252,
    }

    #[abi(embed_v0)]
    impl SchemaRegistryImpl of ISchemaRegistry<ContractState> {
        fn get_schema(self: @ContractState, uid: felt252) -> (felt252, bool, Array<felt252>) {
            let data = self.registry.read(uid);
            (data.uid, data.revocable, data.schema.clone())
        }

        fn register(ref self: ContractState, schema: Array<felt252>, revocable: bool) -> felt252 {
            // let uid = self.registry.len();
            // let uid = get_uid(revocable, schema);
            // self.registry.write(uid, SchemaRecord { uid, revocable, schema });
            self.registry.read(1).uid
        }
    }

    // internal helper functions
    fn get_uid(revocable: bool, schema: Array<felt252>) -> felt252 {
        // let struct_to_hash = SchemaRecord { uid, revocable, schema };
        // let hash = PoseidonTrait::new().update_with(struct_to_hash).finalize();
        // NOTE: basically can't hash BytesArray since it's not convertible to felt252, so can't hash entire SchemaRecord struct
        let hash = PedersenTrait::new(0).update_with(revocable).finalize();
        hash
    }
}

