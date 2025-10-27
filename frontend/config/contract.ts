export const CONTRACT_ADDRESS = "0x3Bce0A51945E93AAD9D355D3628eC2e13d8d313a"

// Rootstock testnet RPC URL
export const RPC_URL = "https://public-node.testnet.rsk.co"

export const SUPPORTED_CHAINS = [
  {
    id: 31,
    name: "Rootstock Testnet",
    nativeCurrency: {
      decimals: 18,
      name: "Rootstock Bitcoin",
      symbol: "RBTC",
    },
    rpcUrls: {
      default: {
        http: [RPC_URL],
      },
    },
  },
] as const

