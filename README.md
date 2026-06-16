# StellarBrew ☕

> Buy me a coffee so I don't fall asleep — a tiny tip jar built on **Stellar testnet** with **Freighter**.

A static donation page where anyone can connect their Freighter wallet, pick (or type) a tip amount, and send XLM to the owner's address on the Stellar testnet. The page shows a QR code of the owner's address, the connected wallet's balance, and clear transaction feedback (success state + tx hash + explorer link, or a readable error).

This project is my **Level 1 — White Belt** submission for the **Stellar Journey to Mastery** class.

---

## Features

- 🔌 **Connect / Disconnect** a Freighter wallet
- 🧪 Runs against **Stellar testnet** (with a network-mismatch warning if Freighter is on the wrong network)
- 💰 **Balance display** for the connected wallet, refreshable on demand
- 📤 **Send an XLM payment** to the tip jar address (preset amounts + custom)
- ✅ **Transaction feedback**: success panel with the tx hash and a Stellar Expert link, or a readable error
- 🆘 **Friendbot button** — funds a brand-new testnet account with 10,000 free XLM
- 📱 **QR code** of the tip jar address so people can scan and send from any Stellar wallet

---

## Screenshots

> Add your screenshots into a `docs/` folder and they'll show up below.

| Wallet connected | Balance displayed | Successful transaction |
|---|---|---|
| ![connected](docs/01-connected.png) | ![balance](docs/02-balance.png) | ![tx success](docs/03-tx-success.png) |

---

## Tech stack

- **Vite + React + TypeScript** — fast dev server, typed components
- **TailwindCSS** — styling without writing a stylesheet
- **`@stellar/stellar-sdk`** — builds and submits the payment transaction
- **`@stellar/freighter-api`** — talks to the Freighter browser extension
- **`qrcode.react`** — renders the QR code of the tip jar address

---

## Run it locally

### 1. Prerequisites
- **Node.js** ≥ 20 (`node --version`)
- The **[Freighter](https://www.freighter.app/)** browser extension installed and switched to **TESTNET**

### 2. Clone & install
```bash
git clone <your-repo-url> stellarbrew
cd stellarbrew
npm install
```

### 3. Set your tip jar address
```bash
cp .env.example .env
```
Open `.env` and paste your testnet public key (the `G...` address shown in Freighter when you're on TESTNET) into `VITE_TIP_JAR_ADDRESS`.

> Don't have a testnet account yet? Create one in Freighter (Settings → Network → Test Net → Create new account), then visit `https://friendbot.stellar.org/?addr=YOUR_G_ADDRESS` to fund it with 10,000 free testnet XLM. (Or use the in-app "Fund with Friendbot" button — it'll appear when you connect an unfunded wallet.)

### 4. Run the dev server
```bash
npm run dev
```
Open the URL Vite prints (usually `http://localhost:5173`).

### 5. Test the full flow
1. Click **Connect Wallet** — approve in Freighter.
2. If the wallet is unfunded, click **Fund with Friendbot**.
3. Pick a tip amount (or use the ✎ button for a custom value).
4. Click **Send X XLM** and approve the signature request in Freighter.
5. See the success panel with the tx hash and the Stellar Expert link.

### 6. Build for production
```bash
npm run build
npm run preview
```

---

## Project structure

```
src/
├── App.tsx                       compose page, manage tx + balance state
├── main.tsx                      React entrypoint
├── index.css                     Tailwind + custom utility classes
├── lib/
│   └── stellar.ts                Horizon server, balance fetch, sendTip, Friendbot
├── hooks/
│   └── useWallet.ts              Freighter connect / disconnect / network watch
└── components/
    ├── Header.tsx
    ├── WalletButton.tsx
    ├── TipJarCard.tsx            QR code + address + copy-to-clipboard
    ├── TipAmountPicker.tsx       preset chips + custom input
    ├── BalanceDisplay.tsx
    ├── TransactionResult.tsx     success + error variants
    └── FriendbotButton.tsx       free 10k XLM funder for unfunded wallets
```

---

## A note on "disconnect"

Freighter does not expose a programmatic way to revoke a dApp's access — that's controlled by the user inside the extension. The **Disconnect** button in this app clears the locally-cached address so the UI returns to the "not connected" state. To fully revoke access, open the Freighter extension → Settings → Connected dApps.

---

## License

MIT
