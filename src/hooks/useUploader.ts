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

export function useUploader() {
  return useCallback(async (url: string) => {
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
        return id;
      }
    } catch (err) {
      console.error('error', err);
    }
  }, []);
}
