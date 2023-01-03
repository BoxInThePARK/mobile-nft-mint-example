import {useCallback} from 'react';
// import RNFS, {DownloadFileOptions} from 'react-native-fs';
import Arweave from 'arweave';
import {REACT_APP_ARWEAVE_KEY} from '@env';

const initOptions = {
  host: 'arweave.net', // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: 'https', // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false, // Enable network request logging
};

let arweave: Arweave;

export function useUploader() {
  return useCallback(async (url: string, arweave: Arweave) => {
    // Download the selected image file
    // const headers = {
    //   Accept: 'image/png',
    //   'Content-Type': 'image/png',
    //   // Authorization: `Bearer [token]`,
    // };

    // const options: DownloadFileOptions = {
    //   fromUrl: url,
    //   toFile: RNFS.DocumentDirectoryPath,
    //   headers: headers,
    // };

    let key = JSON.parse(REACT_APP_ARWEAVE_KEY);
    // const contentType = ['Content-Type', 'image/png'];

    const runUpload = async (
      data: string,
      contentType = ['Content-Type', 'image/png'],
      isUploadByChunk = false,
    ) => {
      const tx = await arweave.createTransaction({data: data}, key);

      tx.addTag(contentType[0], contentType[1]);

      await arweave.transactions.sign(tx, key);

      if (isUploadByChunk) {
        const uploader = await arweave.transactions.getUploader(tx);

        while (!uploader.isComplete) {
          await uploader.uploadChunk();
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

    try {
      const {id} = await runUpload(url);
      console.log('id', id);

      // return id;
    } catch (err) {
      console.log(err);
    }

    // Read the image file
    // Upload the image file to Arweave
  }, []);
}
