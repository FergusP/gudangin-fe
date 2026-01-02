# Escrow Frontend - Session Context

## Project Status
- [x] Vite project scaffolded at `/Users/user/Programming/escrow-fe/`
- [x] Install dependencies
- [x] Configure wagmi + RainbowKit
- [x] Add contract ABIs
- [x] Build App component

## Completed Setup

### Dependencies Installed
- wagmi, viem, @tanstack/react-query
- @rainbow-me/rainbowkit
- tailwindcss v4 with @tailwindcss/vite

### Configuration
- `src/config.ts` - wagmi config with Sepolia + contract addresses
- `src/abi/*.json` - Contract ABIs extracted from Foundry artifacts
- `vite.config.ts` - Tailwind v4 plugin configured
- `src/index.css` - Tailwind imports

### Contract Addresses (Sepolia - Already Deployed)
```
IDRP_TOKEN=0xc1fAB272a555DB0d420E44f61e0F1ddB440E9B88
GOODS_TOKEN=0x4c4dad0771fA6C71D17F4C0182eB8E3d84D68124
TRADE_ESCROW=0x2C8511cb441843Dc142d1558166E8D33Dfe493bd
VAULT_FACTORY=0x2abC5fFFee3A99708a5b9DA52B12Fb1B9598be34
```

### App Features
- Wallet connect (RainbowKit)
- IDRP balance display
- Vault list (getAllVaults from VaultFactory)
- Selected vault details + actions:
  - Investor deposit (with approve)
  - End vault
  - Liquidate to investor
  - Submit/Approve/Cancel fund releases
- Trade Escrow:
  - Create order
  - View order details
  - Fund order (with approve)
  - Mark shipped
  - Raise dispute
  - Release funds

## Run Commands
```bash
npm run dev     # Start development server
npm run build   # Production build
npm run preview # Preview production build
```

## Test Wallets (Sepolia)
| Role | Address |
|------|---------|
| Deployer/Admin/Parallax | 0xdB47f3dedFB66d1A824693fD20B386EFd05fe2f1 |
| Warehouse | 0xFFfF60fc2ff99B13e94AF50Ec0805cfB5A7dbDdA |
| Trader | 0x2907cF8cE62E03D3049DE07039155544e60460bf |
| Investor | 0x76Ab12c0E8F5a716cB4728BDcb00F474d3Af0bdA |
| Buyer | 0x79e6EBd566E6321f173FA592cB75726B385ecB81 |

## Test Tokens Minted
- 1B IDRP → Investor
- 1B IDRP → Buyer
- Collateral NFT (tokenId: 0) → Trader

## Related Files
- Plan: `/Users/user/.claude/plans/bright-swimming-iverson.md`
- Contracts: `/Users/user/Programming/escrow-gudangin/`
