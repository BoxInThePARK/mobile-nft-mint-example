/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useMemo} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

import {Provider as PaperProvider} from 'react-native-paper';
import {ConnectionProvider, WalletProvider} from '@solana/wallet-adapter-react';
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base';
import {clusterApiUrl} from '@solana/web3.js';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

import MainScreen from './MainScreen';
const network = WalletAdapterNetwork.Devnet;

const DEVNET_ENDPOINT = /*#__PURE__*/ clusterApiUrl(network);

const App = () => {
  return (
    <ConnectionProvider
      config={{commitment: 'processed'}}
      endpoint={DEVNET_ENDPOINT}>
      {/* <WalletProvider wallets={wallets}> */}
      <SafeAreaView style={styles.shell}>
        <PaperProvider>
          <MainScreen />
        </PaperProvider>
      </SafeAreaView>
      {/* </WalletProvider> */}
    </ConnectionProvider>
  );
};

const styles = StyleSheet.create({
  shell: {
    height: '100%',
  },
});

export default App;
