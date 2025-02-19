import { getDefaultConnectors } from "@shopify/connect-wallet";
import { configureChains, createClient } from "wagmi";
import { mainnet } from "wagmi/chains";
/**
 * It is strongly recommended to make use of `alchemyProvider`
 * or `infuraProvider` to reduce the risk of your
 * storefront being rate limited.
 */
// import {alchemyProvider} from 'wagmi/providers/alchemy';
import { publicProvider } from "wagmi/providers/public";

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet],
  [
    // alchemyProvider({apiKey: 'INSERT API KEY HERE'}),
    publicProvider(),
  ]
);

const { connectors } = getDefaultConnectors({ chains });

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

export { chains, client };
