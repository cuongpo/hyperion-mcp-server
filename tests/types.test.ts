/**
 * Tests for type definitions
 */

import {
  HyperionConfig,
  WalletInfo,
  TransactionResponse,
  BlockInfo,
  NetworkInfo,
  TokenBalance,
  GasEstimate,
} from '../src/types';

describe('Type Definitions', () => {
  describe('HyperionConfig', () => {
    it('should have required rpcUrl property', () => {
      const config: HyperionConfig = {
        rpcUrl: 'https://hyperion-testnet.metisdevops.link',
      };
      
      expect(config.rpcUrl).toBe('https://hyperion-testnet.metisdevops.link');
    });

    it('should accept optional properties', () => {
      const config: HyperionConfig = {
        rpcUrl: 'https://hyperion-testnet.metisdevops.link',
        chainId: 133717,
        networkName: 'Hyperion Testnet',
        explorerUrl: 'https://hyperion-testnet-explorer.metisdevops.link',
        currencySymbol: 'tMETIS',
      };
      
      expect(config.chainId).toBe(133717);
      expect(config.networkName).toBe('Hyperion Testnet');
      expect(config.currencySymbol).toBe('tMETIS');
    });
  });

  describe('WalletInfo', () => {
    it('should have required address property', () => {
      const wallet: WalletInfo = {
        address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
      };
      
      expect(wallet.address).toBe('0x742d35Cc6634C0532925a3b8D4C9db96590c6C87');
    });

    it('should accept optional properties', () => {
      const wallet: WalletInfo = {
        address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
        privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        mnemonic: 'test mnemonic phrase',
        publicKey: '0xpublickey',
        balance: '1.5',
      };
      
      expect(wallet.privateKey).toBeDefined();
      expect(wallet.mnemonic).toBeDefined();
      expect(wallet.publicKey).toBeDefined();
      expect(wallet.balance).toBe('1.5');
    });
  });

  describe('TransactionResponse', () => {
    it('should have required properties', () => {
      const tx: TransactionResponse = {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
        to: '0x1234567890123456789012345678901234567890',
        value: '1.0',
      };
      
      expect(tx.hash).toBeDefined();
      expect(tx.from).toBeDefined();
      expect(tx.to).toBeDefined();
      expect(tx.value).toBe('1.0');
    });
  });

  describe('NetworkInfo', () => {
    it('should have required properties', () => {
      const network: NetworkInfo = {
        chainId: 133717,
        networkName: 'Hyperion Testnet',
        blockNumber: 12345,
        gasPrice: '20000000000',
        isConnected: true,
      };
      
      expect(network.chainId).toBe(133717);
      expect(network.networkName).toBe('Hyperion Testnet');
      expect(network.isConnected).toBe(true);
    });
  });

  describe('TokenBalance', () => {
    it('should have required properties', () => {
      const tokenBalance: TokenBalance = {
        tokenAddress: '0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c',
        balance: '100.5',
        decimals: 18,
        symbol: 'TEST',
        name: 'Test Token',
      };
      
      expect(tokenBalance.tokenAddress).toBeDefined();
      expect(tokenBalance.balance).toBe('100.5');
      expect(tokenBalance.decimals).toBe(18);
      expect(tokenBalance.symbol).toBe('TEST');
      expect(tokenBalance.name).toBe('Test Token');
    });
  });

  describe('GasEstimate', () => {
    it('should have required properties', () => {
      const gasEstimate: GasEstimate = {
        gasLimit: '21000',
        gasPrice: '20000000000',
        estimatedCost: '0.00042',
      };
      
      expect(gasEstimate.gasLimit).toBe('21000');
      expect(gasEstimate.gasPrice).toBe('20000000000');
      expect(gasEstimate.estimatedCost).toBe('0.00042');
    });
  });
});
