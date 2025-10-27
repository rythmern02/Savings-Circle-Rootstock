"use client"

import { createConfig, http, WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { injected } from "wagmi/connectors"

// Create a custom Rootstock Testnet chain config
const rootstockChain = {
  id: 31,
  name: "Rootstock Testnet",
  nativeCurrency: {
    name: "Rootstock Bitcoin",
    symbol: "RBTC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://public-node.testnet.rsk.co"],
    },
  },
  blockExplorers: {
    default: {
      name: "RSK Explorer",
      url: "https://explorer.testnet.rootstock.io",
    },
  },
}

const config = createConfig({
  chains: [rootstockChain],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  ssr: true,
  transports: {
    [rootstockChain.id]: http("https://public-node.testnet.rsk.co"),
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

