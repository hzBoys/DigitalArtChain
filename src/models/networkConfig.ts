export const ARBITRUM_SEPOLIA = {
  chainId: Number(process.env.NEXT_PUBLIC_TARGET_CHAIN_ID ?? 421614),
  chainIdHex: '0x66eee',
  chainName: 'Arbitrum Sepolia',
  nativeCurrency: {
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC ?? 'https://sepolia-rollup.arbitrum.io/rpc'],
  blockExplorerUrls: [process.env.NEXT_PUBLIC_EXPLORER_URL ?? 'https://sepolia.arbiscan.io'],
} as const

export const TARGET_CHAIN_ID = ARBITRUM_SEPOLIA.chainId
export const EXPLORER_URL = ARBITRUM_SEPOLIA.blockExplorerUrls[0]
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? 'https://gateway.pinata.cloud/ipfs'
export const METAMASK_DOWNLOAD_URL = 'https://metamask.io/download/'
