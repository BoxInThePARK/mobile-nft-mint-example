# #15 - A Complete Guide to Mint Solana NFTs through a Mobile App (Android)

Author: [@rockluckycat](https://twitter.com/RockLuckyCat)

> See the example repo [here](https://github.com/BoxInThePARK/mobile-nft-mint-example)

## Notice
Have bug on upload file to Arweave.

Will fail at TextEncoder at first time. But pass after.

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
├── 📂 metaplex-candy-machine
│   │
│   └── 📄 index.js
│
└── 📂 mobile-nft-mint-example
    │
    ├── 📂 andorid
    │
    ├── 📂 ios
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

### Install `metaplex-candy-machine`
- https://github.com/BoxInThePARK/metaplex-candy-machine
```bash
$ git clone https://github.com/BoxInThePARK/metaplex-candy-machine.git

$ cd metaplex-candy-machine
$ pnpm install
```

### Install `mobile-nft-mint-example`
- https://github.com/BoxInThePARK/mobile-nft-mint-example
```bash
$ git clone https://github.com/BoxInThePARK/mobile-nft-mint-example.git

$ cd mobile-nft-mint-example
$ yarn
```

### Step Arweave Wallet

Follow this [doc](https://docs.arweave.org/info/wallets/arweave-web-extension-wallet) to setup your Arweave wallet and claim free AR token by completing assigned [task](https://faucet.arweave.net/).
**You should have a downloaded key file after the setup.** We will need the keyfile in the rest of the tutorial.

## Part 1: Create Candy Machine

## Part 2: Run The App on Android Emulator/Device

### Setup Arweave Wallet
Follow this [doc](https://docs.arweave.org/info/wallets/arweave-web-extension-wallet) to setup your Arweave wallet and claim free AR token by completing assigned task.

### Setup Minter Wallet (if needs)
To initialize metaple js, you need to set an identity.
There are two functions to let you set the identity.
- walletIdentity()
- 

### Connect Wallet

### Upload Image

### Find Candy Machine

### Mint NFT

### Find NFT in Your Wallet

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
