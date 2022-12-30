/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useState, useMemo} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';

import {Provider as PaperProvider} from 'react-native-paper';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Button} from 'react-native-paper';
import {ConnectionProvider} from '@solana/wallet-adapter-react';
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base';
import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {clusterApiUrl} from '@solana/web3.js';
import {useAuthorization, Account} from './hooks/useAuthorization';
import {useGuardedCallback} from './hooks/useGuardedCallback';
import Icon from 'react-native-vector-icons/MaterialIcons';

const network = WalletAdapterNetwork.Devnet;

const DEVNET_ENDPOINT = /*#__PURE__*/ clusterApiUrl(network);

function getLabelFromAccount(account: Account) {
  const base58EncodedPublicKey = account.publicKey.toBase58();
  if (account.label) {
    return `${base58EncodedPublicKey})`;
  } else {
    return base58EncodedPublicKey;
  }
}

const App = () => {
  const {authorizeSession, selectedAccount} = useAuthorization();
  const [authorizationInProgress, setAuthorizationInProgress] = useState(false);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const connectWallet = useGuardedCallback(async () => {
    try {
      // console.log('check 0');
      if (authorizationInProgress) {
        return;
      }
      // console.log('check 1');
      setAuthorizationInProgress(true);
      await transact(async wallet => {
        await authorizeSession(wallet);
      });

      // console.log('check 2');
      // writeIsLoginToStorage('isLogin');
    } finally {
      setAuthorizationInProgress(false);
      // console.log('check 3');
    }
  }, []);

  const selectedAccountPublicKeyBase58String = useMemo(() => {
    if (selectedAccount) {
      return selectedAccount.publicKey.toBase58();
    } else {
      return 'No account selected';
    }
  }, [selectedAccount]);

  return (
    <ConnectionProvider
      config={{commitment: 'processed'}}
      endpoint={DEVNET_ENDPOINT}>
      <SafeAreaView style={styles.shell}>
        <PaperProvider>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#000',

              alignItems: 'center',
              paddingVertical: 20,
            }}>
            <Button
              style={{
                width: '75%',
                height: 40,
                backgroundColor: '#ffffff',
                marginTop: 16,
                marginBottom: 16,
                borderRadius: 5,
              }}
              contentStyle={styles.connectButton}
              mode="text"
              uppercase
              onPress={connectWallet}>
              <Text style={styles.buttonText}>Connect Wallet</Text>
            </Button>
            {selectedAccount && (
              <>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      selectedAccount &&
                        Linking.openURL(
                          `https://explorer.solana.com/address/${selectedAccountPublicKeyBase58String}?cluster=devnet`,
                        );
                    }}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="account-balance-wallet"
                        size={18}
                        style={styles.labelIcon}
                      />
                      <Text numberOfLines={1} style={styles.userAddressText}>
                        {selectedAccount.publicKey.toBase58()}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
                <Button
                  style={{
                    width: '75%',
                    height: 40,
                    backgroundColor: '#ffffff',
                    marginTop: 16,
                    marginBottom: 16,
                    borderRadius: 5,
                  }}
                  contentStyle={styles.connectButton}
                  mode="text"
                  uppercase
                  onPress={() => {}}>
                  <Text style={styles.buttonText}>Select Picture</Text>
                </Button>
                {/* Show selected image */}
                {/* Mint button */}
                <Button
                  style={{
                    width: '75%',
                    height: 40,
                    backgroundColor: '#ffffff',
                    marginTop: 16,
                    marginBottom: 16,
                    borderRadius: 5,
                  }}
                  contentStyle={styles.connectButton}
                  mode="text"
                  uppercase
                  onPress={() => {}}>
                  <Text style={styles.buttonText}>Mint to NFT</Text>
                </Button>
              </>
            )}
          </View>
        </PaperProvider>
      </SafeAreaView>
    </ConnectionProvider>
  );
};

const styles = StyleSheet.create({
  shell: {
    height: '100%',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  connectButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    width: '100%',
    fontWeight: 'bold',
    fontSize: 13,
    lineHeight: 20,
    color: '#000000',
  },
  labelIcon: {
    marginRight: 4,
    color: '#FFFFFF',
  },
  labelRow: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  userAddressText: {
    fontSize: 14,
    lineHeight: 40,
    color: '#ffffff',
  },
});

export default App;
