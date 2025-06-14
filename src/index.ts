#!/usr/bin/env node

/**
 * Hyperion MCP Server
 * Model Context Protocol server for Hyperion blockchain interactions
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { HyperionClient } from './hyperion-client.js';
import { WalletManager } from './wallet-manager.js';
import {
  HyperionConfig,
  CreateWalletParams,
  ImportWalletParams,
  GetBalanceParams,
  SendTransactionParams,
  GetTransactionParams,

  GetBlockParams,
  CallContractParams,
  SendContractTransactionParams,
  EstimateGasParams,
} from './types.js';

// Load environment variables
dotenv.config();

class HyperionMCPServer {
  private server: Server;
  private hyperionClient: HyperionClient;
  private walletManager: WalletManager;

  constructor() {
    // Initialize configuration
    const config: HyperionConfig = {
      rpcUrl: process.env.HYPERION_RPC_URL || 'https://hyperion-testnet.metisdevops.link',
      chainId: process.env.HYPERION_CHAIN_ID ? parseInt(process.env.HYPERION_CHAIN_ID, 10) : 133717,
      networkName: process.env.HYPERION_NETWORK_NAME || 'Hyperion Testnet',
      explorerUrl: process.env.HYPERION_EXPLORER_URL || 'https://hyperion-testnet-explorer.metisdevops.link',
      currencySymbol: process.env.HYPERION_CURRENCY_SYMBOL || 'tMETIS',
    };

    // Initialize clients
    this.hyperionClient = new HyperionClient(config);
    this.walletManager = new WalletManager();

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'hyperion-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_wallet':
            return await this.handleCreateWallet((args || {}) as unknown as CreateWalletParams);

          case 'import_wallet':
            return await this.handleImportWallet((args || {}) as unknown as ImportWalletParams);

          case 'list_wallets':
            return await this.handleListWallets();

          case 'get_balance':
            return await this.handleGetBalance((args || {}) as unknown as GetBalanceParams);

          case 'send_transaction':
            return await this.handleSendTransaction((args || {}) as unknown as SendTransactionParams);

          case 'get_transaction':
            return await this.handleGetTransaction((args || {}) as unknown as GetTransactionParams);

          case 'get_block':
            return await this.handleGetBlock((args || {}) as unknown as GetBlockParams);

          case 'get_network_info':
            return await this.handleGetNetworkInfo();

          case 'estimate_gas':
            return await this.handleEstimateGas((args || {}) as unknown as EstimateGasParams);

          case 'call_contract':
            return await this.handleCallContract((args || {}) as unknown as CallContractParams);

          case 'send_contract_transaction':
            return await this.handleSendContractTransaction((args || {}) as unknown as SendContractTransactionParams);

          case 'set_current_wallet':
            return await this.handleSetCurrentWallet((args || {}) as unknown as { address: string });

          case 'get_current_wallet':
            return await this.handleGetCurrentWallet();

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private getAvailableTools(): Tool[] {
    return [
      {
        name: 'create_wallet',
        description: 'Create a new Hyperion wallet with a generated mnemonic phrase',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Optional name for the wallet',
            },
          },
        },
      },
      {
        name: 'import_wallet',
        description: 'Import an existing wallet using private key or mnemonic phrase',
        inputSchema: {
          type: 'object',
          properties: {
            privateKey: {
              type: 'string',
              description: 'Private key to import (alternative to mnemonic)',
            },
            mnemonic: {
              type: 'string',
              description: 'Mnemonic phrase to import (alternative to private key)',
            },
            name: {
              type: 'string',
              description: 'Optional name for the wallet',
            },
          },
        },
      },
      {
        name: 'list_wallets',
        description: 'List all available wallets',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_balance',
        description: 'Get the balance of a wallet address (native tokens or ERC20 tokens)',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Wallet address to check balance for',
            },
            tokenAddress: {
              type: 'string',
              description: 'Optional ERC20 token contract address',
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'send_transaction',
        description: 'Send native tokens or ERC20 tokens to another address',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient address',
            },
            amount: {
              type: 'string',
              description: 'Amount to send (in token units, not wei)',
            },
            tokenAddress: {
              type: 'string',
              description: 'Optional ERC20 token contract address (for token transfers)',
            },
            gasLimit: {
              type: 'string',
              description: 'Optional gas limit',
            },
            gasPrice: {
              type: 'string',
              description: 'Optional gas price',
            },
          },
          required: ['to', 'amount'],
        },
      },
      {
        name: 'get_transaction',
        description: 'Get details of a transaction by hash',
        inputSchema: {
          type: 'object',
          properties: {
            hash: {
              type: 'string',
              description: 'Transaction hash',
            },
          },
          required: ['hash'],
        },
      },
      {
        name: 'get_block',
        description: 'Get block information by number or hash',
        inputSchema: {
          type: 'object',
          properties: {
            blockNumber: {
              type: 'number',
              description: 'Block number (alternative to blockHash)',
            },
            blockHash: {
              type: 'string',
              description: 'Block hash (alternative to blockNumber)',
            },
          },
        },
      },
      {
        name: 'get_network_info',
        description: 'Get current network information and status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'estimate_gas',
        description: 'Estimate gas cost for a transaction',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient address',
            },
            value: {
              type: 'string',
              description: 'Optional value to send (in ether)',
            },
            data: {
              type: 'string',
              description: 'Optional transaction data',
            },
          },
          required: ['to'],
        },
      },
      {
        name: 'call_contract',
        description: 'Call a smart contract method (read-only)',
        inputSchema: {
          type: 'object',
          properties: {
            contractAddress: {
              type: 'string',
              description: 'Smart contract address',
            },
            methodName: {
              type: 'string',
              description: 'Method name to call',
            },
            parameters: {
              type: 'array',
              description: 'Method parameters',
              items: {},
            },
            abi: {
              type: 'array',
              description: 'Optional contract ABI',
              items: {},
            },
          },
          required: ['contractAddress', 'methodName'],
        },
      },
      {
        name: 'send_contract_transaction',
        description: 'Send a transaction to a smart contract method',
        inputSchema: {
          type: 'object',
          properties: {
            contractAddress: {
              type: 'string',
              description: 'Smart contract address',
            },
            methodName: {
              type: 'string',
              description: 'Method name to call',
            },
            parameters: {
              type: 'array',
              description: 'Method parameters',
              items: {},
            },
            abi: {
              type: 'array',
              description: 'Optional contract ABI',
              items: {},
            },
            value: {
              type: 'string',
              description: 'Optional ether value to send',
            },
            gasLimit: {
              type: 'string',
              description: 'Optional gas limit',
            },
            gasPrice: {
              type: 'string',
              description: 'Optional gas price',
            },
          },
          required: ['contractAddress', 'methodName'],
        },
      },
      {
        name: 'set_current_wallet',
        description: 'Set the current active wallet for transactions',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Wallet address to set as current',
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'get_current_wallet',
        description: 'Get the current active wallet information',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  // Tool handler methods
  private async handleCreateWallet(params: CreateWalletParams) {
    const walletInfo = this.walletManager.createWallet(params.name);
    return {
      content: [
        {
          type: 'text',
          text: `Wallet created successfully!\n\nAddress: ${walletInfo.address}\nMnemonic: ${walletInfo.mnemonic}\n\n⚠️ IMPORTANT: Save your mnemonic phrase securely. It's the only way to recover your wallet!`,
        },
      ],
    };
  }

  private async handleImportWallet(params: ImportWalletParams) {
    const walletInfo = this.walletManager.importWallet(
      params.privateKey,
      params.mnemonic,
      params.name
    );
    return {
      content: [
        {
          type: 'text',
          text: `Wallet imported successfully!\n\nAddress: ${walletInfo.address}`,
        },
      ],
    };
  }

  private async handleListWallets() {
    const wallets = this.walletManager.listWallets();
    const currentAddress = this.walletManager.getCurrentAddress();

    let response = `Available Wallets (${wallets.length}):\n\n`;

    for (const wallet of wallets) {
      const isCurrent = wallet.address.toLowerCase() === currentAddress.toLowerCase();
      response += `${isCurrent ? '→ ' : '  '}${wallet.address}${isCurrent ? ' (current)' : ''}\n`;
    }

    return {
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
    };
  }

  private async handleGetBalance(params: GetBalanceParams) {
    try {
      if (params.tokenAddress) {
        const tokenBalance = await this.hyperionClient.getTokenBalance(
          params.address,
          params.tokenAddress
        );
        return {
          content: [
            {
              type: 'text',
              text: `Token Balance:\n\nAddress: ${params.address}\nToken: ${tokenBalance.name} (${tokenBalance.symbol})\nBalance: ${tokenBalance.balance} ${tokenBalance.symbol}`,
            },
          ],
        };
      } else {
        const balance = await this.hyperionClient.getBalance(params.address);
        return {
          content: [
            {
              type: 'text',
              text: `Native Balance:\n\nAddress: ${params.address}\nBalance: ${balance} ${this.hyperionClient.getCurrencySymbol()}`,
            },
          ],
        };
      }
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`);
    }
  }

  private async handleSendTransaction(params: SendTransactionParams) {
    try {
      const wallet = this.walletManager.getCurrentWallet();

      let result;
      if (params.tokenAddress) {
        result = await this.hyperionClient.sendTokenTransaction(
          wallet,
          params.tokenAddress,
          params.to,
          params.amount,
          params.gasLimit,
          params.gasPrice
        );
      } else {
        result = await this.hyperionClient.sendTransaction(
          wallet,
          params.to,
          params.amount,
          params.gasLimit,
          params.gasPrice
        );
      }

      return {
        content: [
          {
            type: 'text',
            text: `Transaction sent successfully!\n\nHash: ${result.hash}\nFrom: ${result.from}\nTo: ${result.to}\nAmount: ${result.value}\nStatus: ${result.status}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to send transaction: ${error}`);
    }
  }

  private async handleGetTransaction(params: GetTransactionParams) {
    try {
      const transaction = await this.hyperionClient.getTransaction(params.hash);
      return {
        content: [
          {
            type: 'text',
            text: `Transaction Details:\n\nHash: ${transaction.hash}\nFrom: ${transaction.from}\nTo: ${transaction.to}\nValue: ${transaction.value} ${this.hyperionClient.getCurrencySymbol()}\nGas Used: ${transaction.gasUsed}\nBlock: ${transaction.blockNumber}\nStatus: ${transaction.status}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error}`);
    }
  }

  private async handleGetBlock(params: GetBlockParams) {
    try {
      const block = await this.hyperionClient.getBlock(params.blockNumber, params.blockHash);
      return {
        content: [
          {
            type: 'text',
            text: `Block Information:\n\nNumber: ${block.number}\nHash: ${block.hash}\nTimestamp: ${new Date(block.timestamp * 1000).toISOString()}\nTransactions: ${block.transactionCount}\nGas Used: ${block.gasUsed}\nGas Limit: ${block.gasLimit}\nMiner: ${block.miner}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get block: ${error}`);
    }
  }

  private async handleGetNetworkInfo() {
    try {
      const networkInfo = await this.hyperionClient.getNetworkInfo();
      return {
        content: [
          {
            type: 'text',
            text: `Network Information:\n\nName: ${networkInfo.networkName}\nChain ID: ${networkInfo.chainId}\nLatest Block: ${networkInfo.blockNumber}\nGas Price: ${networkInfo.gasPrice} wei\nConnected: ${networkInfo.isConnected ? 'Yes' : 'No'}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get network info: ${error}`);
    }
  }

  private async handleEstimateGas(params: EstimateGasParams) {
    try {
      const estimate = await this.hyperionClient.estimateGas(
        params.to,
        params.value,
        params.data
      );
      return {
        content: [
          {
            type: 'text',
            text: `Gas Estimate:\n\nGas Limit: ${estimate.gasLimit}\nGas Price: ${estimate.gasPrice} wei\nEstimated Cost: ${estimate.estimatedCost} ${this.hyperionClient.getCurrencySymbol()}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to estimate gas: ${error}`);
    }
  }

  private async handleCallContract(params: CallContractParams) {
    try {
      const result = await this.hyperionClient.callContract(
        params.contractAddress,
        params.methodName,
        params.parameters || [],
        params.abi
      );
      return {
        content: [
          {
            type: 'text',
            text: `Contract Call Result:\n\nContract: ${params.contractAddress}\nMethod: ${params.methodName}\nResult: ${JSON.stringify(result.result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to call contract: ${error}`);
    }
  }

  private async handleSendContractTransaction(params: SendContractTransactionParams) {
    try {
      const wallet = this.walletManager.getCurrentWallet();
      const result = await this.hyperionClient.sendContractTransaction(
        wallet,
        params.contractAddress,
        params.methodName,
        params.parameters || [],
        params.abi,
        params.value,
        params.gasLimit,
        params.gasPrice
      );

      return {
        content: [
          {
            type: 'text',
            text: `Contract Transaction Sent:\n\nHash: ${result.hash}\nContract: ${params.contractAddress}\nMethod: ${params.methodName}\nStatus: ${result.status}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to send contract transaction: ${error}`);
    }
  }

  private async handleSetCurrentWallet(params: { address: string }) {
    try {
      this.walletManager.setCurrentWallet(params.address);
      return {
        content: [
          {
            type: 'text',
            text: `Current wallet set to: ${params.address}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to set current wallet: ${error}`);
    }
  }

  private async handleGetCurrentWallet() {
    try {
      const address = this.walletManager.getCurrentAddress();
      const walletInfo = this.walletManager.getWalletInfo(address);
      return {
        content: [
          {
            type: 'text',
            text: `Current Wallet:\n\nAddress: ${walletInfo.address}\nPublic Key: ${walletInfo.publicKey}\nPrivate Key: ${walletInfo.privateKey}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get current wallet: ${error}`);
    }
  }

  public async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Hyperion MCP Server running on stdio');
  }
}

// Start the server
async function main() {
  const server = new HyperionMCPServer();
  await server.run();
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
