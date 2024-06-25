# Solas

## Overview

Solas is a open-source infrastructure public good for making attestations onchain on Starknet. Our motivation was EAS which is deployed on Ethereum mainnet.

## Architecture

We've 2 core contracts in Solas:
- Schema Registry - This is the blueprint of the schema, it defines the structure and format of the data.

- Attestation Registry - This is the contract responsible for making attestation using a schema on Starknet.

## Example

An example of how this could be used to attest if a person has participated in StarkHack Hackathon

Raw Schema
{
    "name": string,
    "userAddress": string,
    "event": string,
    "participated": bool
}

Example Attesation 

Sender is: StarkHack admin
Recipient is: Contestant
revocable: false
data: {
    "name": "Suraj Kohli",
    "userAddress": "0x1234567890123456789012345678901234567890",
    "event": "StarkHack Hackathon",
    "participated": true
}

## Future Enhancements

- Ability to refer other attestations
- Allow delegated attestations (Contract receives a signed attestation and attests onchain on behalf of user)
- Implement Revoke
- Implement option to refer an attestation

## Sepolia Deployment Addresses

SchemaRegistry: 0x067bdf6bf6f1b72315c541abdc443cdd55992ea29546933ddfec19cb200fce87
AttestationRegistry: 0x034f38c70a7d4b1bab0b919c923545e74b188f95915b92b5febf12b0dafe6686
