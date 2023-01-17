/* eslint-disable react-native/no-inline-styles */
import React, {useState, useMemo, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Linking,
  Image,
} from 'react-native';

import {Button, Portal, Dialog, ActivityIndicator} from 'react-native-paper';
import {useConnection} from '@solana/wallet-adapter-react';
import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {Keypair, PublicKey} from '@solana/web3.js';
import {useAuthorization} from './hooks/useAuthorization';
import {useGuardedCallback} from './hooks/useGuardedCallback';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useUploader} from './hooks/useUploader';
import {
  keypairIdentity,
  Metaplex,
  sol,
  toDateTime,
} from '@metaplex-foundation/js';
import {
  REACT_APP_METAPLEX_PRIVATE_KEY,
  REACT_APP_CANDY_MACHINE_ADDRESS,
} from '@env';
import bs58 from 'bs58';

const MainScreen = () => {
  const {authorizeSession, selectedAccount} = useAuthorization();
  const {connection} = useConnection();
  const [authorizationInProgress, setAuthorizationInProgress] = useState(false);
  const [imageURL, setImageURL] = useState<string>('');
  const [mintProcessStart, setMintProcessStart] = useState(false);
  const [mintDialogOpen, setMintDialogOpen] = useState(false);
  const [mintError, setMintError] = useState(false);
  const [mintingStep, setMintingStep] = useState<string>('');
  const [mintedNFTAddress, setMintedNFTAddress] = useState<string>('');
  const uploader = useUploader();
  const connectWallet = useGuardedCallback(async () => {
    try {
      if (authorizationInProgress) {
        return;
      }

      setAuthorizationInProgress(true);
      await transact(async mobileWallet => {
        await authorizeSession(mobileWallet);
      });
    } finally {
      setAuthorizationInProgress(false);
    }
  }, []);

  const getRandomImage = () => {
    const randomId = Math.floor(Math.random() * 1000);
    const url = `https://picsum.photos/id/${randomId}/500`;
    setImageURL(url);
  };

  const LAMPORTS_PER_AIRDROP = 2000000000;

  const requestAirdropGuarded = useGuardedCallback(
    async (publicKey: PublicKey) => {
      const signature = await connection.requestAirdrop(
        publicKey,
        LAMPORTS_PER_AIRDROP,
      );
      return await connection.confirmTransaction(signature);
    },
    [connection],
  );

  const mintNFT = useCallback(async () => {
    setMintDialogOpen(true);
    setMintProcessStart(true);
    try {
      setMintingStep('Start Minting Process');

      // Upload metadata and image to arweave.
      setMintingStep('Upload metadata and image to arweave');
      const metaData = await uploader(
        imageURL,
        selectedAccount.publicKey.toBase58(),
      );
      console.log('metaData:', metaData);

      if (metaData) {
        const metapleKeypair = Keypair.fromSecretKey(
          bs58.decode(REACT_APP_METAPLEX_PRIVATE_KEY),
        );

        //Airdrop to metapleKeypair
        // console.log('Airdrop to metapleKeypair');
        // await requestAirdropGuarded(metapleKeypair.publicKey);

        //Initialize Metaplex
        setMintingStep('Initialize Metaplex');
        const metaplex = Metaplex.make(connection).use(
          keypairIdentity(metapleKeypair),
        );
        const treasury = metaplex.identity().publicKey;

        setMintingStep('Fetch the Candy Machine');
        let candyMachine = await metaplex.candyMachines().findByAddress({
          address: new PublicKey(REACT_APP_CANDY_MACHINE_ADDRESS),
        });

        setMintingStep('Update the Candy Machine');
        await metaplex.candyMachines().update({
          candyMachine,
          guards: {
            botTax: {lamports: sol(0.01), lastInstruction: true},
            solPayment: {amount: sol(0.1), destination: treasury},
            startDate: {date: toDateTime('2022-10-17T16:00:00Z')},
            // All other guards are disabled...
          },
        });

        setMintingStep('Insert Item to the Candy Machine');
        await metaplex.candyMachines().insertItems({
          candyMachine,
          items: [{name: metaData.name, uri: metaData.id}],
        });

        candyMachine = await metaplex.candyMachines().refresh(candyMachine);

        //Mint
        setMintingStep('Mint');
        const {nft} = await metaplex.candyMachines().mint({
          candyMachine,
          collectionUpdateAuthority: metapleKeypair.publicKey,
          owner: selectedAccount.publicKey,
        });

        console.log('nft address', nft.address);

        if (nft.address) {
          setMintProcessStart(false);
          setMintedNFTAddress(nft.address.toBase58());
        } else {
          setMintError(true);
          setMintingStep('NFT info is null, please check the candyMachine.');
        }
      }
    } catch (err) {
      setMintError(true);
      setMintingStep('Please check console.');
      console.log('err', err);
    }
  }, [connection, imageURL, selectedAccount, uploader]);

  const selectedAccountPublicKeyBase58String = useMemo(() => {
    if (selectedAccount) {
      return selectedAccount.publicKey.toBase58();
    } else {
      return 'No account selected';
    }
  }, [selectedAccount]);
  return (
    <>
      <Portal.Host>
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
                onPress={mintNFT}>
                <Text style={styles.buttonText}>Mint to NFT</Text>
              </Button>
            </>
          )}
        </View>
      </Portal.Host>
      <Portal>
        <Dialog
          onDismiss={() => {
            setMintDialogOpen(false);
            setMintError(false);
          }}
          visible={mintDialogOpen}>
          <Dialog.Content>
            <View
              style={{
                height: 340,
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 2,
                paddingEnd: 8,
              }}>
              {mintProcessStart ? (
                <>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#000',
                      marginBottom: 8,
                    }}>
                    {mintError ? 'Error Occured' : 'NFT Minting! ...'}
                  </Text>
                  {mintError ? (
                    <Icon name="close" size={150} style={{color: 'red'}} />
                  ) : (
                    <ActivityIndicator size={150} />
                  )}
                  <Text style={styles.mintingStepText}>{mintingStep}</Text>
                </>
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#000',
                      marginBottom: 8,
                    }}>
                    NFT Minted!
                  </Text>
                  <Image
                    source={{uri: imageURL}}
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 10,
                      backgroundColor: '#000',
                      marginBottom: 16,
                    }}
                    resizeMode="cover"
                  />
                  <TouchableWithoutFeedback
                    onPress={() => {
                      Linking.openURL(
                        `https://explorer.solana.com/address/${mintedNFTAddress}?cluster=devnet`,
                      );
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Icon
                        name="image"
                        size={18}
                        style={(styles.labelIcon, {color: '#000'})}
                      />
                      <Text style={styles.mintingStepText}>
                        {`${mintedNFTAddress.slice(
                          0,
                          8,
                        )}...${mintedNFTAddress.slice(
                          mintedNFTAddress.length - 8,
                        )}`}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                  <Button
                    style={{
                      width: 100,
                      backgroundColor: '#ffffff',
                      marginTop: 16,
                      borderRadius: 20,
                      padding: 0,
                      margin: 0,
                    }}
                    onPress={() => {
                      setMintDialogOpen(false);
                      setMintError(false);
                    }}>
                    <Text
                      style={{
                        color: 'purple',
                        fontSize: 18,
                        fontWeight: 'bold',
                      }}>
                      Got it
                    </Text>
                  </Button>
                </>
              )}
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </>
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
  keyRow: {
    marginBottom: 12,
  },
  mintingStepText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
  },
});

export default MainScreen;
