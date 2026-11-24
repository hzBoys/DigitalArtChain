export const PROOF_OF_EXISTENCE_ABI = [
  'function registerWork(bytes32 _hash, bytes _sig, string _title, string _category, string _ipfsCid)',
  'function verifyWork(bytes32 _hash) view returns (address creator, uint256 timestamp, bytes signature, string title, string category, string ipfsCid)',
  'event WorkRegistered(bytes32 indexed fileHash, address indexed creator, uint256 timestamp, string title, string category, string ipfsCid)',
] as const
