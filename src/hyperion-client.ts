/**
 * Hyperion Blockchain Client
 * Handles all blockchain interactions and API calls
 */

import axios, { AxiosInstance } from 'axios';
import { ethers } from 'ethers';
import {
  HyperionConfig,
  TransactionRequest,
  TransactionResponse,
  BlockInfo,
  NetworkInfo,
  ContractCallRequest,
  ContractCallResponse,
  TokenInfo,
  TokenBalance,
  GasEstimate,
  TransactionHistory
} from './types.js';

export class HyperionClient {
  private provider: ethers.JsonRpcProvider;
  private httpClient: AxiosInstance;
  private config: HyperionConfig;

  constructor(config: HyperionConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.httpClient = axios.create({
      baseURL: config.rpcUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get the native currency symbol
   */
  getCurrencySymbol(): string {
    return this.config.currencySymbol || 'ETH';
  }

  /**
   * Get native token balance for an address
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`);
    }
  }

  /**
   * Get ERC20 token balance
   */
  async getTokenBalance(address: string, tokenAddress: string): Promise<TokenBalance> {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function balanceOf(address) view returns (uint256)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)',
          'function name() view returns (string)',
        ],
        this.provider
      );

      const [balance, decimals, symbol, name] = await Promise.all([
        tokenContract.balanceOf(address),
        tokenContract.decimals(),
        tokenContract.symbol(),
        tokenContract.name(),
      ]);

      return {
        tokenAddress,
        balance: ethers.formatUnits(balance, decimals),
        decimals,
        symbol,
        name,
      };
    } catch (error) {
      throw new Error(`Failed to get token balance: ${error}`);
    }
  }

  /**
   * Send native token transaction
   */
  async sendTransaction(
    wallet: ethers.Wallet | ethers.HDNodeWallet,
    to: string,
    amount: string,
    gasLimit?: string,
    gasPrice?: string
  ): Promise<TransactionResponse> {
    try {
      const connectedWallet = wallet.connect(this.provider);
      
      const tx: ethers.TransactionRequest = {
        to,
        value: ethers.parseEther(amount),
        gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
        gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
      };

      const transaction = await connectedWallet.sendTransaction(tx);
      const receipt = await transaction.wait();

      return {
        hash: transaction.hash,
        from: transaction.from!,
        to: transaction.to!,
        value: ethers.formatEther(transaction.value!),
        gasUsed: receipt?.gasUsed.toString(),
        gasPrice: transaction.gasPrice?.toString(),
        blockNumber: receipt?.blockNumber,
        blockHash: receipt?.blockHash,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
      };
    } catch (error) {
      throw new Error(`Failed to send transaction: ${error}`);
    }
  }

  /**
   * Send ERC20 token transaction
   */
  async sendTokenTransaction(
    wallet: ethers.Wallet | ethers.HDNodeWallet,
    tokenAddress: string,
    to: string,
    amount: string,
    gasLimit?: string,
    gasPrice?: string
  ): Promise<TransactionResponse> {
    try {
      const connectedWallet = wallet.connect(this.provider);
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function decimals() view returns (uint8)',
        ],
        connectedWallet
      );

      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);

      const tx = await tokenContract.transfer(to, parsedAmount, {
        gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
        gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
      });

      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: wallet.address,
        to,
        value: amount,
        gasUsed: receipt?.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString(),
        blockNumber: receipt?.blockNumber,
        blockHash: receipt?.blockHash,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
      };
    } catch (error) {
      throw new Error(`Failed to send token transaction: ${error}`);
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(hash: string): Promise<TransactionResponse> {
    try {
      const [tx, receipt] = await Promise.all([
        this.provider.getTransaction(hash),
        this.provider.getTransactionReceipt(hash),
      ]);

      if (!tx) {
        throw new Error('Transaction not found');
      }

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: ethers.formatEther(tx.value),
        gasUsed: receipt?.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString(),
        blockNumber: receipt?.blockNumber,
        blockHash: receipt?.blockHash,
        status: receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : 'pending',
      };
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error}`);
    }
  }

  /**
   * Get block information
   */
  async getBlock(blockNumber?: number, blockHash?: string): Promise<BlockInfo> {
    try {
      let block;
      if (blockHash) {
        block = await this.provider.getBlock(blockHash);
      } else if (blockNumber !== undefined) {
        block = await this.provider.getBlock(blockNumber);
      } else {
        block = await this.provider.getBlock('latest');
      }

      if (!block) {
        throw new Error('Block not found');
      }

      return {
        number: block.number,
        hash: block.hash || '',
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        miner: block.miner,
        difficulty: block.difficulty?.toString(),
        size: block.length || 0,
        transactionCount: block.transactions.length,
      };
    } catch (error) {
      throw new Error(`Failed to get block: ${error}`);
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const [network, blockNumber, feeData] = await Promise.all([
        this.provider.getNetwork(),
        this.provider.getBlockNumber(),
        this.provider.getFeeData(),
      ]);

      return {
        chainId: Number(network.chainId),
        networkName: network.name || this.config.networkName || 'Unknown',
        blockNumber,
        gasPrice: feeData.gasPrice?.toString() || '0',
        isConnected: true,
      };
    } catch (error) {
      return {
        chainId: this.config.chainId || 0,
        networkName: this.config.networkName || 'Unknown',
        blockNumber: 0,
        gasPrice: '0',
        isConnected: false,
      };
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(to: string, value?: string, data?: string): Promise<GasEstimate> {
    try {
      const tx: ethers.TransactionRequest = {
        to,
        value: value ? ethers.parseEther(value) : 0,
        data: data || '0x',
      };

      const [gasLimit, feeData] = await Promise.all([
        this.provider.estimateGas(tx),
        this.provider.getFeeData(),
      ]);

      const gasPrice = feeData.gasPrice || BigInt(0);
      const estimatedCost = gasLimit * gasPrice;

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
        estimatedCost: ethers.formatEther(estimatedCost),
      };
    } catch (error) {
      throw new Error(`Failed to estimate gas: ${error}`);
    }
  }

  /**
   * Call a smart contract method (read-only)
   */
  async callContract(
    contractAddress: string,
    methodName: string,
    parameters: any[] = [],
    abi?: any[]
  ): Promise<ContractCallResponse> {
    try {
      // Use a basic ABI if none provided
      const contractAbi = abi || [
        `function ${methodName}(${parameters.map((_, i) => `uint256 param${i}`).join(', ')}) view returns (uint256)`,
      ];

      const contract = new ethers.Contract(contractAddress, contractAbi, this.provider);
      const result = await contract[methodName](...parameters);

      return {
        result: result.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to call contract: ${error}`);
    }
  }

  /**
   * Send a transaction to a smart contract
   */
  async sendContractTransaction(
    wallet: ethers.Wallet | ethers.HDNodeWallet,
    contractAddress: string,
    methodName: string,
    parameters: any[] = [],
    abi?: any[],
    value?: string,
    gasLimit?: string,
    gasPrice?: string
  ): Promise<TransactionResponse> {
    try {
      const connectedWallet = wallet.connect(this.provider);
      
      // Use a basic ABI if none provided
      const contractAbi = abi || [
        `function ${methodName}(${parameters.map((_, i) => `uint256 param${i}`).join(', ')})`,
      ];

      const contract = new ethers.Contract(contractAddress, contractAbi, connectedWallet);
      
      const tx = await contract[methodName](...parameters, {
        value: value ? ethers.parseEther(value) : 0,
        gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
        gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
      });

      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: wallet.address,
        to: contractAddress,
        value: value || '0',
        gasUsed: receipt?.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString(),
        blockNumber: receipt?.blockNumber,
        blockHash: receipt?.blockHash,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
      };
    } catch (error) {
      throw new Error(`Failed to send contract transaction: ${error}`);
    }
  }
}
