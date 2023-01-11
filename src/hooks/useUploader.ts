import {useCallback} from 'react';
import RNFS, {DownloadFileOptions} from 'react-native-fs';
import Arweave from 'arweave';
import {REACT_APP_ARWEAVE_KEY, REACT_APP_ARWEAVE_KEY_WITH_TOKEN} from '@env';
import {toByteArray} from 'react-native-quick-base64';
import {JWKInterface} from 'arweave/node/lib/wallet';

const initOptions = {
  host: 'arweave.net', // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: 'https', // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false, // Enable network request logging
};

const nftAttributes = [
  {
    trait_type: 'Image Type',
    value: 'Random Lorem Ipsum',
  },
];

export function useUploader() {
  return useCallback(async (url: string, account: string) => {
    const headers = {
      Accept: 'image/png',
      'Content-Type': 'image/png',
      // Authorization: `Bearer [token]`,
    };

    const options: DownloadFileOptions = {
      fromUrl: url,
      toFile: RNFS.DocumentDirectoryPath + '/test.png',
      headers: headers,
    };

    const arweave = Arweave.init(initOptions);

    console.log('check1', RNFS.DocumentDirectoryPath);
    const key: JWKInterface = JSON.parse(REACT_APP_ARWEAVE_KEY_WITH_TOKEN);

    const getNftName = () =>
      `SolMeet-${(Math.random() + 1).toString(36).substring(4)}`;

    const getMetadata = (
      name: string,
      imageUrl: string,
      attributes: Record<string, string>[],
    ) => ({
      name,
      symbol: 'SolMeet',
      description: 'SolMeet #15 Demo NFT',
      seller_fee_basis_points: 100,
      external_url: 'https://solmeet.dev',
      attributes,
      collection: {
        name: 'SolMeet',
        family: 'DAO',
      },
      properties: {
        files: [
          {
            uri: imageUrl,
            type: 'image/png',
          },
        ],
        category: 'image',
        maxSupply: 0,
        creators: [
          {
            address: account,
            share: 100,
          },
        ],
      },
      image: imageUrl,
    });

    const runUpload = async (
      data: string | Uint8Array | ArrayBuffer | undefined,
      contentType = ['Content-Type', 'image/png'],
      isUploadByChunk = false, //if only upload on file, there is no need to turn into true
    ) => {
      console.log('check4');

      const tx = await arweave.createTransaction({data: data}, key);
      console.log('check5');

      tx.addTag(contentType[0], contentType[1]);

      await arweave.transactions.sign(tx, key);

      if (isUploadByChunk) {
        const uploader = await arweave.transactions.getUploader(tx);

        while (!uploader.isComplete) {
          console.log('check9');

          await uploader.uploadChunk();
          console.log('check10');

          console.log(
            `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`,
          );
        }
      }

      //   Do we need to post with uploader?
      await arweave.transactions.post(tx);

      //   console.log("url", `http://localhost:1984/${tx.id}`);
      //   console.log("url", `https://arweave.net/${tx.id}`);
      return tx;
    };

    // Download the selected image file
    try {
      const nftName = getNftName();
      const download = RNFS.downloadFile(options);
      const res = await download.promise;
      if (res.statusCode === 200) {
        // Read the image file
        const tempImg = await RNFS.readFile(
          `${RNFS.DocumentDirectoryPath}/test.png`,
          'base64',
        );

        const data = toByteArray(tempImg);

        // Upload the image file to Arweave
        const {id} = await runUpload(data);

        const imageUrl = id ? `https://arweave.net/${id}` : undefined;
        console.log('imageUrl', imageUrl);

        const metadata = getMetadata(nftName, imageUrl, nftAttributes);

        const metaContentType = ['Content-Type', 'application/json'];
        const metadataString = JSON.stringify(metadata);

        const {id: metadataId} = await runUpload(
          metadataString,
          metaContentType,
        );

        const metadataUrl = id
          ? `https://arweave.net/${metadataId}`
          : undefined;

        console.log('metadataUrl', metadataUrl);

        return {
          name: nftName,
          uri: metadataUrl,
          id: metadataId,
        };
      }
    } catch (err) {
      console.error('error', err);
    }
  }, []);
}
