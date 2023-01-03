import {useCallback} from 'react';
// import RNFS, {DownloadFileOptions} from 'react-native-fs';
import Arweave from 'arweave';
import {REACT_APP_ARWEAVE_KEY} from '@env';

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
    console.log('check1');
    let key = JSON.parse(REACT_APP_ARWEAVE_KEY);
    // const contentType = ['Content-Type', 'image/png'];
    console.log('check2');

    const runUpload = async (
      data: string,
      contentType = ['Content-Type', 'image/png'],
      isUploadByChunk = false,
    ) => {
      console.log('check4');

      const tx = await arweave.createTransaction({data: data}, key);
      console.log('check5');

      tx.addTag(contentType[0], contentType[1]);
      console.log('check6');

      await arweave.transactions.sign(tx, key);
      console.log('check7');

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
      console.log('check3');

      const {id} = await runUpload(url);
      console.log('id', id);

      // return id;
    } catch (err) {
      console.log('check error');
      console.log(err);
    }

    // Read the image file
    // Upload the image file to Arweave
  }, []);
}
