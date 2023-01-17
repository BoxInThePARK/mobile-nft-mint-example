# A Complete Guide to Mint Solana NFTs through a Mobile App (Android)

Author: [@rockluckycat](https://twitter.com/RockLuckyCat)

> See this [doc]() for more details

## Overview
- Creat candy machine through Metaplex js
- Creat a Pixel 4 Android virtual device
- Run react-native app on Android Emulator
    - Connect wallet through [@solana/mobile-wallet-adapter](https://github.com/solana-mobile/mobile-wallet-adapter)
    - Upload image and metadata to Arweave
    - Mint Solana NFT through candy machine

> The demo procedure is running on solana devnet

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