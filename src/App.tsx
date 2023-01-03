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

import React, {useState, useMemo, useCallback} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Linking,
  Image,
} from 'react-native';

import {Provider as PaperProvider} from 'react-native-paper';
import {Button} from 'react-native-paper';
import {ConnectionProvider} from '@solana/wallet-adapter-react';
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base';
import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {clusterApiUrl} from '@solana/web3.js';
import {useAuthorization} from './hooks/useAuthorization';
import {useGuardedCallback} from './hooks/useGuardedCallback';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';

const network = WalletAdapterNetwork.Devnet;

const DEVNET_ENDPOINT = /*#__PURE__*/ clusterApiUrl(network);

const App = () => {
  const {authorizeSession, selectedAccount} = useAuthorization();
  const [authorizationInProgress, setAuthorizationInProgress] = useState(false);
  const [imageURL, setImageURL] = useState<string>('');

  const connectWallet = useGuardedCallback(async () => {
    try {
      if (authorizationInProgress) {
        return;
      }

      setAuthorizationInProgress(true);
      await transact(async wallet => {
        await authorizeSession(wallet);
      });
    } finally {
      setAuthorizationInProgress(false);
    }
  }, []);

  const selectImage = useCallback(async () => {
    RNFS.readDir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then(result => {
        console.log('GOT RESULT', result);

        // stat the first file
        return Promise.all([RNFS.stat(result[0].path), result[0].path]);
      })
      .then(statResult => {
        if (statResult[0].isFile()) {
          // if we have a file, read it
          return RNFS.readFile(statResult[1], 'utf8');
        }

        return 'no file';
      })
      .then(contents => {
        // log the file contents
        console.log(contents);
      })
      .catch(err => {
        console.log(err.message, err.code);
      });
  }, []);

  const getRandomImage = () => {
    const randomId = Math.floor(Math.random() * 1000);
    const url = `https://picsum.photos/id/${randomId}/500`;
    setImageURL(url);
  };

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
                  onPress={getRandomImage}>
                  <Text style={styles.buttonText}>Get Random Image</Text>
                </Button>
                {/* Show selected image */}
                {imageURL && (
                  <Image
                    source={{uri: imageURL}}
                    style={{
                      width: 400,
                      height: 400,
                      borderRadius: 10,
                      marginBottom: 12,
                    }}
                    resizeMode="cover"
                  />
                )}
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
