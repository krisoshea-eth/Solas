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
