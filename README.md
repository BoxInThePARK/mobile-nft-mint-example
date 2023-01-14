# #15 - A Complete Guide to Mint Solana NFTs through a Mobile App (Android)

Author: [@rockluckycat](https://twitter.com/RockLuckyCat)

> See the example repo [here](https://github.com/BoxInThePARK/mobile-nft-mint-example)

## Overview
- Creat candy machine through Metaplex js
- Creat a Pixel 4 Android virtual device
- Run react-native app on Android Emulator
    - Connect wallet through [@solana/mobile-wallet-adapter](https://github.com/solana-mobile/mobile-wallet-adapter)
    - Upload image and metadata to Arweave
    - Mint Solana NFT through candy machine

> The demo procedure is running on solana devnet

## Setup

### Structure

```
├── 📂 metaplex-candy-machine-example
│   │
│   └── 📄 creator.js
│
└── 📂 mobile-nft-mint-example
    │
    ├── 📂 andorid
    │
    ├── 📂 ios
    │
    ├── 📂 patch
    │   |
    │   └── 📂 arweave
    │
    ├── 📂 src
    │   │
    │   ├── 📂 components
    │   │
    │   ├── 📂 hooks
    │   │   │
    │   │   ├── 📄 useAuthorization.ts
    │   │   │
    │   │   ├── 📄 useGuardedCallback.ts
    │   │   │
    │   │   └── 📄 useUploader.ts
    │   │   │
    │   │   └── 📄 useMinter.ts
    │   │
    │   ├── 📄 App.tsx
    │   |
    │   └── 📄 MainScreen.tsx
    │
    └── 📂 types
```
### This Tutorial Only Works on Android OS

Since Solana Mobile SDK hasn't support iOS yet. You can't connect wallet with [@solana/mobile-wallet-adapter](https://github.com/solana-mobile/mobile-wallet-adapter) on iOS devices. As a result, this tutorial only works on Android right now.

### Setting up the development environment

There are two ways to develop React Native App.
- Expo Go
- React Native CLI

We don't talk about which one is better here. The point is I have tried to run this code with Expo Go. However it still has some issues when using [@solana/mobile-wallet-adapter](https://github.com/solana-mobile/mobile-wallet-adapter), but it works fine with React Native CLI.

So I suggest you to use React Native CLI method to setting up your development environment.

Follow this [doc](https://reactnative.dev/docs/environment-setup) to setup.

### Creat a Pixel 4 Android virtual device

Follow this [doc](https://developer.android.com/studio/run/managing-avds) to create a virtual device. 

And remeber select Pixel 4 which is the newest verison has Play Store inside.

![Select Pixel 4](https://i.imgur.com/ozNIWz2.png)

System Image please select "S API Level 31"

![Select S API Level 31](https://i.imgur.com/Pd27QED.png)

After you run up your virtual Pixel 4, remember to install Phantom or Solflare.

### Install `metaplex-candy-machine-example`
- https://github.com/BoxInThePARK/metaplex-candy-machine-example
```bash
$ git clone https://github.com/BoxInThePARK/metaplex-candy-machine-example.git

$ cd metaplex-candy-machine-example
$ pnpm install
```

### Install `mobile-nft-mint-example`
- https://github.com/BoxInThePARK/mobile-nft-mint-example
```bash
$ git clone https://github.com/BoxInThePARK/mobile-nft-mint-example.git

$ cd mobile-nft-mint-example
$ yarn
```
- Set Arweave Package to Local Patch 

    Right now, `arweave-js` hasn't completely supported react-native yet. Therefore, if you want to upload image or metadata to Arweave network through `arweave-js` package. You will address some issues occured by some needed packages are unable to resolve on react-native. Because react-native doesn't have them.
    
    To solve these problems, not only you should install other packages, you also need to do small modification on the package's sourcecode. This is the reason why we set `arweave-js` as a local patch,
    
    Here are the steps:
    - Install 
        ```bash
            yarn add text-encoding
        ```
    - Modify source code 
        ```javascript
        // In patch/arweave/node/lib/utils.js

        ...

        // Line 61
        const {TextEncoder} = require('text-encoding');

        ``` 

### Setup Arweave Wallet

Follow this [doc](https://docs.arweave.org/info/wallets/arweave-web-extension-wallet) to setup your Arweave wallet and claim free AR token by completing assigned [task](https://faucet.arweave.net/).
**You should have a downloaded key file after the setup.** We will need the keyfile in the rest of the tutorial.

## Part 1: Create Candy Machine

### Create `.env` File

```Bash
//In metaplex-candy-machine-example

touch .env
```

Paste this to .env
```env
//In .env

ARWEAVE_KEY=[The key you get from "Set Arweave Wallet"]
METAPLEX_PRIVATE_KEY=[The secret key of your test wallet address]
```

### Create A New Candy Machine

```Bash
$ pnpm create-candy-machine

> metaplex-candy-machine-example@0.0.0 create-candy-machine ../metaplex-candy-machine-example
> node ./creator.js

publicKey [your wallet address]
Upload Collection Metadata
metadataUrl https://arweave.net/xxxxxxxxx
Initialize Metaplex
Create the Collection NFT
Create the Candy Machine
Done
candyMachine_address [new cm address]
```

Then you can get a new candy machine address.


## Part 2: Run The App on Android Emulator/Device

### Setup Arweave Wallet
Follow this [doc](https://docs.arweave.org/info/wallets/arweave-web-extension-wallet) to setup your Arweave wallet and claim free AR token by completing assigned task.

### Create `.env` File

```Bash
//In mobile-nft-mint-example

touch .env
```

Paste this to .env
```env
//In .env

REACT_APP_ARWEAVE_KEY=[The key you get from "Set Arweave Wallet"]
REACT_APP_METAPLEX_PRIVATE_KEY=[The secret key of your test wallet address]
REACT_APP_CANDY_MACHINE_ADDRESS=[The candy machine address you get from Part 1]
```
### Install App to Emulator

Recommend to have two terminal windows here.

Run the Metro

```Bash
$ yarn start --reset-cache
```

Install App
```Bash
$ yarn android
```

### Connect Wallet

> Set Wallet to devnet

#### Add uri in APP_IDENTITY

```typescript
// In src/hooks/useAuthorization.ts

...

// Line 66
uri: 'https://book.solmeet.dev/',

``` 

#### Refresh app or rebuild. Then start testing!

![](https://i.imgur.com/ojVQjSu.png)

![](https://i.imgur.com/CdC5Nyv.png)

### Upload Image and Metadata

The procedure is come from SolMeet #3. You can take a detail look at [here](https://book.solmeet.dev/notes/complete-guide-to-mint-solana-nft#part-2-upload-to-arweave)

### Find Candy Machine

```typescript
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
```

### Mint NFT

```typescript
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
```

### Find NFT in Your Wallet

![](https://i.imgur.com/2lkDNMg.jpg)

![](https://i.imgur.com/ZO0luKs.png)


## Reference

### General
- [SolMeet #3](https://book.solmeet.dev/notes/complete-guide-to-mint-solana-nft#setup-arweave-wallet)
- https://reactnative.dev/docs

### SMS
- https://github.com/solana-mobile/mobile-wallet-adapter
- https://github.com/solana-mobile/mobile-wallet-adapter/tree/main/examples/example-react-native-app

### Metaplex
- https://github.com/metaplex-foundation/js-examples/tree/main/mint-ui-example
- https://docs.metaplex.com/programs/token-metadata/overview

### Arweave
- https://github.com/thuglabs/arweave-image-uploader
