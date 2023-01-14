/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

import {Provider as PaperProvider} from 'react-native-paper';
import {ConnectionProvider} from '@solana/wallet-adapter-react';
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base';
import {clusterApiUrl} from '@solana/web3.js';

import MainScreen from './MainScreen';
const network = WalletAdapterNetwork.Devnet;

const DEVNET_ENDPOINT = /*#__PURE__*/ clusterApiUrl(network);

const App = () => {
  return (
    <ConnectionProvider
      config={{commitment: 'processed'}}
      endpoint={DEVNET_ENDPOINT}>
      <SafeAreaView style={styles.shell}>
        <PaperProvider>
          <MainScreen />
        </PaperProvider>
      </SafeAreaView>
    </ConnectionProvider>
  );
};

const styles = StyleSheet.create({
  shell: {
    height: '100%',
  },
});

export default App;
