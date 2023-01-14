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

import {Button} from 'react-native-paper';
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
  toBigNumber,
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
    console.log('Start Minting Process');
    // Upload metadata and image to arweave.
    console.log('Upload metadata and image to arweave');
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
      // const result_1 = await requestAirdropGuarded(metapleKeypair.publicKey);

      // console.log('result_1', result_1);

      //Initialize Metaplex
      console.log('Initialize Metaplex');
      const metaplex = Metaplex.make(connection).use(
        keypairIdentity(metapleKeypair),
      );
      const treasury = metaplex.identity().publicKey;

      //Find Candy Machine with Address
      console.log('Fetch the Candy Machine');
      let candyMachine = await metaplex.candyMachines().findByAddress({
        address: new PublicKey(REACT_APP_CANDY_MACHINE_ADDRESS),
      });

      console.log('Update the Candy Machine');
      await metaplex.candyMachines().update({
        candyMachine,
        guards: {
          botTax: {lamports: sol(0.01), lastInstruction: true},
          solPayment: {amount: sol(0.1), destination: treasury},
          startDate: {date: toDateTime('2022-10-17T16:00:00Z')},
          // All other guards are disabled...
        },
      });

      //Insert Item and Refresh Candy Machine
      console.log('Insert Item to the Candy Machine');
      await metaplex.candyMachines().insertItems({
        candyMachine,
        items: [{name: metaData.name, uri: metaData.id}],
      });

      candyMachine = await metaplex.candyMachines().refresh(candyMachine);

      //Mint
      console.log('Mint');
      const {nft} = await metaplex.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: metapleKeypair.publicKey,
        owner: selectedAccount.publicKey,
      });

      console.log('NFT Address:', nft.address.toBase58());
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

export default MainScreen;
