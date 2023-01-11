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
import {Keypair, PublicKey, type Cluster} from '@solana/web3.js';
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
  // walletAdapterIdentity,
} from '@metaplex-foundation/js';
import {Connection} from '@solana/web3.js';
import {REACT_APP_METAPLEX_PRIVATE_KEY} from '@env';
import bs58 from 'bs58';
// import useSWR from 'swr';
// import {
//   SolanaMobileWalletAdapter,
//   createDefaultAddressSelector,
//   createDefaultAuthorizationResultCache,
//   createDefaultWalletNotFoundHandler,
// } from '@solana-mobile/wallet-adapter-mobile';

// function getInferredClusterFromEndpoint(endpoint?: string): Cluster {
//   if (!endpoint) {
//     return 'mainnet-beta';
//   }
//   if (/devnet/i.test(endpoint)) {
//     return 'devnet';
//   } else if (/testnet/i.test(endpoint)) {
//     return 'testnet';
//   } else {
//     return 'mainnet-beta';
//   }
// }

const MainScreen = () => {
  const {authorizeSession, selectedAccount} = useAuthorization();
  const {connection} = useConnection();
  // console.log('selectedAccount', selectedAccount.publicKey.toBase58());
  // const {wallet} = useWallet(

  // );
  console.log('connection', connection);
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
    // Upload metadata and image to arweave.
    const metaData = await uploader(
      imageURL,
      selectedAccount.publicKey.toBase58(),
    );
    console.log('metaData', metaData);

    if (metaData) {
      console.log('Fetch MetaData');
      const jsonMetaData = metaData.uri;
      const res = await fetch(jsonMetaData);
      const parsedMetaData = await res.json();
      console.log('parsedMetaData', parsedMetaData.name);

      const metapleKeypair = Keypair.fromSecretKey(
        bs58.decode(REACT_APP_METAPLEX_PRIVATE_KEY),
      );
      console.log('publicKey', metapleKeypair.publicKey.toBase58());
      //   addressSelector: createDefaultAddressSelector(), // const wallet = new SolanaMobileWalletAdapter({
      //   appIdentity: {
      //     uri: 'https://book.solmeet.dev/',
      //   },
      //   authorizationResultCache: createDefaultAuthorizationResultCache(),
      //   cluster: getInferredClusterFromEndpoint(connection?.rpcEndpoint),
      //   onWalletNotFound: createDefaultWalletNotFoundHandler(),
      // });

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

      // const collectionAuthority = Keypair.generate();
      // // Airdrop to collectionAuthority
      // console.log('Airdrop to metapleKeypair');
      // const result_2 = await requestAirdropGuarded(
      //   collectionAuthority.publicKey,
      // );

      // if (result_2) {
      //   const {
      //     value: {err: err_2},
      //   } = result_2;
      //   if (err_2) {
      //     console.log('airdrop result_2', err_2);
      //   }
      // }

      // Create the Collection NFT.
      console.log('Create the Collection NFT');
      const {nft: collectionNft} = await metaplex.nfts().create({
        name: 'SolMeet Dao',
        uri: metaData.uri,
        sellerFeeBasisPoints: 0,
        isCollection: true,
        updateAuthority: metaplex.identity(),
      });

      //Create the Candy Machine
      console.log('Create the Candy Machine');
      let {candyMachine} = await metaplex.candyMachines().create({
        // withoutCandyGuard: true,
        itemsAvailable: toBigNumber(1),
        itemSettings: {
          type: 'configLines',
          prefixName: '',
          nameLength: 17,
          prefixUri: 'https://arweave.net/',
          uriLength: 48,
          isSequential: true,
        },
        sellerFeeBasisPoints: 0,
        symbol: 'SolMeet',
        maxEditionSupply: toBigNumber(1),
        // isMutable: true,
        creators: [{address: selectedAccount.publicKey, share: 100}],
        collection: {
          address: collectionNft.address,
          updateAuthority: metaplex.identity(),
        },
        guards: {
          // botTax: {lamports: sol(0.01), lastInstruction: true},
          solPayment: {amount: sol(0.1), destination: treasury},
          startDate: {date: toDateTime('2022-10-17T16:00:00Z')},
          // All other guards are disabled...
        },
      });
      // console.log('Upload Metadata');
      // const {uri} = await metaplex.nfts().uploadMetadata({
      //   name: parsedMetaData.name,
      //   description: parsedMetaData.description,
      //   image: parsedMetaData.image,
      // });
      // console.log('uri', uri);

      console.log('Insert Item to the Candy Machine');
      await metaplex.candyMachines().insertItems({
        candyMachine,
        items: [{name: metaData.name, uri: metaData.id}],
      });

      candyMachine = await metaplex.candyMachines().refresh(candyMachine);
      console.log('test 0', candyMachine.items[0].minted);
      console.log('test 1', candyMachine.items[0].name);
      console.log('test 2', candyMachine.items[0].uri);
      console.log('candyMachine', candyMachine);

      //Mint
      console.log('Mint');
      const {nft} = await metaplex.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: metapleKeypair.publicKey,
        // mintAuthority: metaplex.identity(),
        owner: selectedAccount.publicKey,
      });

      console.log('test', nft.address.toBase58());
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
