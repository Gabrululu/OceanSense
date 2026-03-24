"use client";

import { FC, ReactNode, useMemo, ComponentType } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

// Cast necesario por incompatibilidad entre @types/react 18.3 y los adaptadores de wallet
const CP = ConnectionProvider as ComponentType<any>;
const WP = WalletProvider as ComponentType<any>;
const WMP = WalletModalProvider as ComponentType<any>;
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
import { CoinbaseWalletAdapter } from "@solana/wallet-adapter-coinbase";
import { clusterApiUrl } from "@solana/web3.js";

// Importar estilos del modal de wallet
require("@solana/wallet-adapter-react-ui/styles.css");

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: FC<ProvidersProps> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network),
    [network]
  );

  // Soportar Phantom, Solflare, Backpack y Coinbase
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    []
  );

  return (
    <CP endpoint={endpoint}>
      <WP wallets={wallets} autoConnect>
        <WMP>{children}</WMP>
      </WP>
    </CP>
  );
};