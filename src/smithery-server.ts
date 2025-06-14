import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from 'dotenv';

import { HyperionClient } from './hyperion-client.js';
import { WalletManager } from './wallet-manager.js';
import {
  HyperionConfig,
} from './types.js';

// Load environment variables
dotenv.config();

// Configuration schema for Smithery
export const configSchema = z.object({
  rpcUrl: z.string().default('https://hyperion-testnet.metisdevops.link').describe("Hyperion RPC URL"),
  chainId: z.number().default(133717).describe("Hyperion Chain ID"),
  networkName: z.string().default('Hyperion Testnet').describe("Network name"),
  explorerUrl: z.string().default('https://hyperion-testnet-explorer.metisdevops.link').describe("Block explorer URL"),
  currencySymbol: z.string().default('tMETIS').describe("Currency symbol"),
  debug: z.boolean().default(false).describe("Enable debug logging"),
});

export default function createStatelessServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  const server = new McpServer({
    name: "Hyperion Blockchain MCP Server",
    version: "1.0.0",
  });

  // Initialize configuration
  const hyperionConfig: HyperionConfig = {
    rpcUrl: config.rpcUrl,
    chainId: config.chainId,
    networkName: config.networkName,
    explorerUrl: config.explorerUrl,
    currencySymbol: config.currencySymbol,
  };

  // Initialize clients
  const hyperionClient = new HyperionClient(hyperionConfig);
  const walletManager = new WalletManager();

  // Create Wallet Tool
  server.tool(
    "create_wallet",
    "Create a new Hyperion wallet with a generated mnemonic phrase",
    {
      name: z.string().optional().describe("Optional name for the wallet"),
    },
    async ({ name }) => {
      try {
        const walletInfo = walletManager.createWallet(name);
        return {
          content: [
            {
              type: "text",
              text: `Wallet created successfully!\n\nAddress: ${walletInfo.address}\nMnemonic: ${walletInfo.mnemonic}\n\n⚠️ IMPORTANT: Save your mnemonic phrase securely. It's the only way to recover your wallet!`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating wallet: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Import Wallet Tool
  server.tool(
    "import_wallet",
    "Import an existing wallet using private key or mnemonic phrase",
    {
      privateKey: z.string().optional().describe("Private key to import (alternative to mnemonic)"),
      mnemonic: z.string().optional().describe("Mnemonic phrase to import (alternative to private key)"),
      name: z.string().optional().describe("Optional name for the wallet"),
    },
    async ({ privateKey, mnemonic, name }) => {
      try {
        const walletInfo = walletManager.importWallet(privateKey, mnemonic, name);
        return {
          content: [
            {
              type: "text",
              text: `Wallet imported successfully!\n\nAddress: ${walletInfo.address}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error importing wallet: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // List Wallets Tool
  server.tool(
    "list_wallets",
    "List all available wallets",
    {},
    async () => {
      try {
        const wallets = walletManager.listWallets();
        const currentAddress = walletManager.getCurrentAddress();

        let response = `Available Wallets (${wallets.length}):\n\n`;

        for (const wallet of wallets) {
          const isCurrent = wallet.address.toLowerCase() === currentAddress.toLowerCase();
          response += `${isCurrent ? '→ ' : '  '}${wallet.address}${isCurrent ? ' (current)' : ''}\n`;
        }

        return {
          content: [
            {
              type: "text",
              text: response,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing wallets: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Balance Tool
  server.tool(
    "get_balance",
    "Get the balance of a wallet address (native tokens or ERC20 tokens)",
    {
      address: z.string().describe("Wallet address to check balance for"),
      tokenAddress: z.string().optional().describe("Optional ERC20 token contract address"),
    },
    async ({ address, tokenAddress }) => {
      try {
        if (tokenAddress) {
          const tokenBalance = await hyperionClient.getTokenBalance(address, tokenAddress);
          return {
            content: [
              {
                type: "text",
                text: `Token Balance:\n\nAddress: ${address}\nToken: ${tokenBalance.name} (${tokenBalance.symbol})\nBalance: ${tokenBalance.balance} ${tokenBalance.symbol}`,
              },
            ],
          };
        } else {
          const balance = await hyperionClient.getBalance(address);
          return {
            content: [
              {
                type: "text",
                text: `Native Balance:\n\nAddress: ${address}\nBalance: ${balance} ${hyperionClient.getCurrencySymbol()}`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting balance: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Send Transaction Tool
  server.tool(
    "send_transaction",
    "Send native tokens or ERC20 tokens to another address",
    {
      to: z.string().describe("Recipient address"),
      amount: z.string().describe("Amount to send (in token units, not wei)"),
      tokenAddress: z.string().optional().describe("Optional ERC20 token contract address (for token transfers)"),
      gasLimit: z.string().optional().describe("Optional gas limit"),
      gasPrice: z.string().optional().describe("Optional gas price"),
    },
    async ({ to, amount, tokenAddress, gasLimit, gasPrice }) => {
      try {
        const wallet = walletManager.getCurrentWallet();

        let result;
        if (tokenAddress) {
          result = await hyperionClient.sendTokenTransaction(
            wallet,
            tokenAddress,
            to,
            amount,
            gasLimit,
            gasPrice
          );
        } else {
          result = await hyperionClient.sendTransaction(
            wallet,
            to,
            amount,
            gasLimit,
            gasPrice
          );
        }

        return {
          content: [
            {
              type: "text",
              text: `Transaction sent successfully!\n\nHash: ${result.hash}\nFrom: ${result.from}\nTo: ${result.to}\nAmount: ${result.value}\nStatus: ${result.status}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error sending transaction: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Network Info Tool
  server.tool(
    "get_network_info",
    "Get current network information and status",
    {},
    async () => {
      try {
        const networkInfo = await hyperionClient.getNetworkInfo();
        return {
          content: [
            {
              type: "text",
              text: `Network Information:\n\nChain ID: ${networkInfo.chainId}\nNetwork: ${networkInfo.networkName}\nLatest Block: ${networkInfo.blockNumber}\nGas Price: ${networkInfo.gasPrice}\nConnected: ${networkInfo.isConnected}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting network info: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Transaction Tool
  server.tool(
    "get_transaction",
    "Get details of a transaction by hash",
    {
      hash: z.string().describe("Transaction hash"),
    },
    async ({ hash }) => {
      try {
        const transaction = await hyperionClient.getTransaction(hash);
        return {
          content: [
            {
              type: "text",
              text: `Transaction Details:\n\nHash: ${transaction.hash}\nFrom: ${transaction.from}\nTo: ${transaction.to}\nValue: ${transaction.value}\nGas Used: ${transaction.gasUsed}\nStatus: ${transaction.status}\nBlock: ${transaction.blockNumber}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting transaction: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Block Tool
  server.tool(
    "get_block",
    "Get block information by number or hash",
    {
      blockNumber: z.number().optional().describe("Block number (alternative to blockHash)"),
      blockHash: z.string().optional().describe("Block hash (alternative to blockNumber)"),
    },
    async ({ blockNumber, blockHash }) => {
      try {
        const block = await hyperionClient.getBlock(blockNumber, blockHash);
        return {
          content: [
            {
              type: "text",
              text: `Block Information:\n\nNumber: ${block.number}\nHash: ${block.hash}\nTimestamp: ${new Date(block.timestamp * 1000).toISOString()}\nTransaction Count: ${block.transactionCount}\nGas Used: ${block.gasUsed}\nGas Limit: ${block.gasLimit}\nMiner: ${block.miner}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting block: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Estimate Gas Tool
  server.tool(
    "estimate_gas",
    "Estimate gas cost for a transaction",
    {
      to: z.string().describe("Recipient address"),
      value: z.string().optional().describe("Optional value to send (in ether)"),
      data: z.string().optional().describe("Optional transaction data"),
    },
    async ({ to, value, data }) => {
      try {
        const gasEstimate = await hyperionClient.estimateGas(to, value, data);
        return {
          content: [
            {
              type: "text",
              text: `Gas Estimation:\n\nEstimated Gas: ${gasEstimate.gasLimit}\nGas Price: ${gasEstimate.gasPrice}\nEstimated Cost: ${gasEstimate.estimatedCost} ${hyperionClient.getCurrencySymbol()}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error estimating gas: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Set Current Wallet Tool
  server.tool(
    "set_current_wallet",
    "Set the current active wallet for transactions",
    {
      address: z.string().describe("Wallet address to set as current"),
    },
    async ({ address }) => {
      try {
        // Note: WalletManager doesn't have setCurrentAddress method,
        // this would need to be implemented or use a different approach
        return {
          content: [
            {
              type: "text",
              text: `Note: Setting current wallet functionality needs to be implemented in WalletManager. Address: ${address}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting current wallet: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Get Current Wallet Tool
  server.tool(
    "get_current_wallet",
    "Get the current active wallet information",
    {},
    async () => {
      try {
        const currentAddress = walletManager.getCurrentAddress();
        const wallet = walletManager.getCurrentWallet();
        return {
          content: [
            {
              type: "text",
              text: `Current Wallet:\n\nAddress: ${currentAddress}\nWallet Type: ${wallet.constructor.name}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting current wallet: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  return server.server;
}

// For Smithery deployment - create and start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const defaultConfig = {
    rpcUrl: process.env.HYPERION_RPC_URL || 'https://hyperion-testnet.metisdevops.link',
    chainId: parseInt(process.env.HYPERION_CHAIN_ID || '133717'),
    networkName: process.env.HYPERION_NETWORK_NAME || 'Hyperion Testnet',
    explorerUrl: process.env.HYPERION_EXPLORER_URL || 'https://hyperion-testnet-explorer.metisdevops.link',
    currencySymbol: process.env.HYPERION_CURRENCY_SYMBOL || 'tMETIS',
    debug: process.env.DEBUG === 'true' || false,
  };

  const server = createStatelessServer({ config: defaultConfig });

  // Start the server with stdio transport
  const transport = new StdioServerTransport();
  server.connect(transport).catch((error) => {
    console.error("Failed to start Hyperion MCP Server:", error);
    process.exit(1);
  });
}
