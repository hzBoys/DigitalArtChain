export const ARBITRUM_SEPOLIA = {
  chainId: 421614,
  chainIdHex: '0x66eee',
  chainName: 'Arbitrum Sepolia',
  nativeCurrency: {
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
  blockExplorerUrls: ['https://sepolia.arbiscan.io/'],
} as const

export const TARGET_CHAIN_ID = ARBITRUM_SEPOLIA.chainId
export const METAMASK_DOWNLOAD_URL = 'https://metamask.io/download/'
