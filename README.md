# 🚀 Hyperion MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)

**Model Context Protocol server for Hyperion blockchain interactions**

The Hyperion MCP Server is a developer- and user-oriented backend service that enables seamless interaction with the Hyperion blockchain using the Model Context Protocol (MCP). This server provides standardized APIs for querying, transacting, and managing assets on Hyperion, making it easy for developers, users, and AI agents to build and integrate with Hyperion-based applications.

## 🌟 Features

### Core Capabilities
- **Standardized MCP Interface**: Expose Hyperion blockchain operations via MCP endpoints
- **Wallet Management**: Create, import, and manage multiple wallets
- **Transaction Operations**: Send native tokens and ERC20 tokens
- **Blockchain Queries**: Query balances, transactions, blocks, and network information
- **Smart Contract Interactions**: Call and transact with smart contracts
- **Gas Estimation**: Estimate transaction costs before sending

### Developer Tools
- **Comprehensive Documentation**: Complete API reference and examples
- **TypeScript Support**: Full type safety and IntelliSense
- **Error Handling**: Detailed error messages and debugging information
- **Flexible Configuration**: Environment-based configuration system

## 📋 Requirements

- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **Hyperion blockchain** RPC endpoint access

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/your-org/hyperion-mcp-server.git
cd hyperion-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the configuration
nano .env
```

Configure your environment variables:

```env
# Hyperion Testnet Configuration
HYPERION_RPC_URL=https://hyperion-testnet.metisdevops.link
HYPERION_CHAIN_ID=133717
HYPERION_NETWORK_NAME=Hyperion Testnet
HYPERION_CURRENCY_SYMBOL=tMETIS
HYPERION_EXPLORER_URL=https://hyperion-testnet-explorer.metisdevops.link

# Wallet Configuration (comma-separated for multiple wallets)
HYPERION_PRIVATE_KEYS=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
HYPERION_ADDRESSES=0x742d35Cc6634C0532925a3b8D4C9db96590c6C87
HYPERION_CURRENT_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96590c6C87
```

### 3. Usage

#### Standalone Mode
```bash
npm start
```

#### Development Mode
```bash
npm run dev
```

#### MCP Client Integration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "hyperion-mcp": {
      "command": "node",
      "args": ["path/to/hyperion-mcp-server/build/index.js"],
      "env": {
        "HYPERION_RPC_URL": "https://hyperion-testnet.metisdevops.link",
        "HYPERION_CHAIN_ID": "133717",
        "HYPERION_NETWORK_NAME": "Hyperion Testnet",
        "HYPERION_CURRENCY_SYMBOL": "tMETIS",
        "HYPERION_PRIVATE_KEYS": "your_private_key_here",
        "HYPERION_CURRENT_ADDRESS": "your_address_here"
      }
    }
  }
}
```

## 🛠️ Available Tools

### Wallet Management

#### `create_wallet`
Create a new wallet with a generated mnemonic phrase.

**Parameters:**
- `name` (optional): Wallet name

**Example:**
```json
{
  "name": "create_wallet",
  "arguments": {
    "name": "MyWallet"
  }
}
```

#### `import_wallet`
Import an existing wallet using private key or mnemonic.

**Parameters:**
- `privateKey` (optional): Private key to import
- `mnemonic` (optional): Mnemonic phrase to import
- `name` (optional): Wallet name

#### `list_wallets`
List all available wallets.

#### `set_current_wallet`
Set the active wallet for transactions.

**Parameters:**
- `address` (required): Wallet address

#### `get_current_wallet`
Get current active wallet information.

### Balance & Transactions

#### `get_balance`
Get wallet balance (native or ERC20 tokens).

**Parameters:**
- `address` (required): Wallet address
- `tokenAddress` (optional): ERC20 token contract address

#### `send_transaction`
Send native tokens or ERC20 tokens.

**Parameters:**
- `to` (required): Recipient address
- `amount` (required): Amount to send
- `tokenAddress` (optional): ERC20 token contract address
- `gasLimit` (optional): Gas limit
- `gasPrice` (optional): Gas price

#### `get_transaction`
Get transaction details by hash.

**Parameters:**
- `hash` (required): Transaction hash

### Blockchain Queries

#### `get_block`
Get block information.

**Parameters:**
- `blockNumber` (optional): Block number
- `blockHash` (optional): Block hash

#### `get_network_info`
Get current network information and status.

#### `estimate_gas`
Estimate gas cost for a transaction.

**Parameters:**
- `to` (required): Recipient address
- `value` (optional): Value to send
- `data` (optional): Transaction data

### Smart Contracts

#### `call_contract`
Call a smart contract method (read-only).

**Parameters:**
- `contractAddress` (required): Contract address
- `methodName` (required): Method name
- `parameters` (optional): Method parameters
- `abi` (optional): Contract ABI

#### `send_contract_transaction`
Send a transaction to a smart contract.

**Parameters:**
- `contractAddress` (required): Contract address
- `methodName` (required): Method name
- `parameters` (optional): Method parameters
- `abi` (optional): Contract ABI
- `value` (optional): Ether value to send
- `gasLimit` (optional): Gas limit
- `gasPrice` (optional): Gas price

## 🏗️ Development

### Project Structure

```
hyperion-mcp-server/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── hyperion-client.ts    # Blockchain client
│   ├── wallet-manager.ts     # Wallet management
│   └── types.ts              # Type definitions
├── build/                    # Compiled JavaScript
├── docs/                     # Documentation
├── examples/                 # Example code
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts

```bash
# Development
npm run dev          # Run in development mode
npm run build        # Build TypeScript
npm run start        # Run built version

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm test            # Run tests
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🔒 Security

- **Private Keys**: Never commit private keys to version control
- **Environment Variables**: Use `.env` files for sensitive configuration
- **Network Security**: Use HTTPS endpoints in production
- **Wallet Security**: Store mnemonic phrases securely

## 📚 Documentation

- [API Reference](docs/api.md)
- [Configuration Guide](docs/configuration.md)
- [Examples](examples/)
- [Troubleshooting](docs/troubleshooting.md)

## 🤝 Community

- **Developers**: Contribute to backend or frontend development, API design, or documentation
- **Testers**: Help stress-test the gateway, identify bugs, and provide UX feedback
- **Content Creators**: Assist with user guides, tutorials, and community outreach
- **Community Support**: Help onboard new users and foster engagement

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) for the standardized interface
- [Ethers.js](https://ethers.org/) for Ethereum interactions
- The Hyperion blockchain community

---

**Made with ❤️ by the Hyperion MCP Team**
