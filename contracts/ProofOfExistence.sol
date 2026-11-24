// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProofOfExistence {
    uint256 private constant SECP256K1_HALF_ORDER =
        0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0;

    struct Record {
        bytes32 fileHash;
        address creator;
        uint256 timestamp;
        bytes signature;
        string title;
        string category;
        string ipfsCid;
    }

    mapping(bytes32 => Record) public records;

    event WorkRegistered(
        bytes32 indexed fileHash,
        address indexed creator,
        uint256 timestamp,
        string title,
        string category,
        string ipfsCid
    );

    function registerWork(
        bytes32 _hash,
        bytes calldata _sig,
        string calldata _title,
        string calldata _category,
        string calldata _ipfsCid
    ) external {
        require(_hash != bytes32(0), "Hash tidak valid!");
        require(records[_hash].timestamp == 0, "Karya sudah terdaftar!");
        require(_recoverSigner(_hash, _sig) == msg.sender, "Tanda tangan tidak cocok!");

        records[_hash] = Record({
            fileHash: _hash,
            creator: msg.sender,
            timestamp: block.timestamp,
            signature: _sig,
            title: _title,
            category: _category,
            ipfsCid: _ipfsCid
        });

        emit WorkRegistered(_hash, msg.sender, block.timestamp, _title, _category, _ipfsCid);
    }

    function _recoverSigner(bytes32 _hash, bytes calldata _sig) private pure returns (address) {
        require(_sig.length == 65, "Tanda tangan tidak valid!");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(_sig.offset)
            s := calldataload(add(_sig.offset, 32))
            v := byte(0, calldataload(add(_sig.offset, 64)))
        }
        require(v == 27 || v == 28, "Tanda tangan tidak valid!");
        require(uint256(s) <= SECP256K1_HALF_ORDER, "Tanda tangan tidak valid!");
        bytes32 signedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash));
        return ecrecover(signedHash, v, r, s);
    }

    function verifyWork(bytes32 _hash)
        external
        view
        returns (
            address creator,
            uint256 timestamp,
            bytes memory signature,
            string memory title,
            string memory category,
            string memory ipfsCid
        )
    {
        Record memory record = records[_hash];
        return (record.creator, record.timestamp, record.signature, record.title, record.category, record.ipfsCid);
    }
}
