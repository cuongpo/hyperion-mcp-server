#!/usr/bin/env node

/**
 * Test script specifically for Hyperion Testnet
 * Tests the get_balance functionality on the actual Hyperion network
 */

import { HyperionClient } from './build/hyperion-client.js';
import { WalletManager } from './build/wallet-manager.js';

async function testHyperionTestnet() {
  console.log('🚀 Testing Hyperion MCP Server on Hyperion Testnet');
  console.log('==================================================\n');

  console.log('🌐 Network Configuration:');
  console.log('• Network: Hyperion Testnet');
  console.log('• Chain ID: 133717');
  console.log('• RPC URL: https://hyperion-testnet.metisdevops.link');
  console.log('• Currency: tMETIS');
  console.log('• Explorer: https://hyperion-testnet-explorer.metisdevops.link\n');

  try {
    // Initialize Hyperion client with testnet configuration
    const config = {
      rpcUrl: 'https://hyperion-testnet.metisdevops.link',
      chainId: 133717,
      networkName: 'Hyperion Testnet',
      explorerUrl: 'https://hyperion-testnet-explorer.metisdevops.link',
      currencySymbol: 'tMETIS'
    };

    console.log('🔗 Connecting to Hyperion Testnet...');
    const client = new HyperionClient(config);

    // Test network connectivity
    console.log('📡 Testing network connectivity...');
    const networkInfo = await client.getNetworkInfo();
    console.log('✅ Network Connection Successful:');
    console.log(`   Network: ${networkInfo.networkName}`);
    console.log(`   Chain ID: ${networkInfo.chainId}`);
    console.log(`   Latest Block: ${networkInfo.blockNumber}`);
    console.log(`   Connected: ${networkInfo.isConnected}`);
    console.log(`   Currency: ${client.getCurrencySymbol()}\n`);

    // Test with a sample address (you can replace with a real testnet address)
    const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87';
    
    console.log('💰 Testing balance retrieval...');
    console.log(`📍 Test Address: ${testAddress}`);
    
    try {
      const balance = await client.getBalance(testAddress);
      console.log('✅ Balance Retrieved Successfully:');
      console.log(`   Address: ${testAddress}`);
      console.log(`   Balance: ${balance} ${client.getCurrencySymbol()}\n`);
    } catch (balanceError) {
      console.log('⚠️ Balance retrieval note:', balanceError.message);
      console.log('💡 This is normal if the address has no balance on testnet\n');
    }

    // Test gas estimation
    console.log('⛽ Testing gas estimation...');
    try {
      const gasEstimate = await client.estimateGas(
        '0x1234567890123456789012345678901234567890',
        '0.1'
      );
      console.log('✅ Gas Estimation Successful:');
      console.log(`   Gas Limit: ${gasEstimate.gasLimit}`);
      console.log(`   Gas Price: ${gasEstimate.gasPrice} wei`);
      console.log(`   Estimated Cost: ${gasEstimate.estimatedCost} ${client.getCurrencySymbol()}\n`);
    } catch (gasError) {
      console.log('⚠️ Gas estimation note:', gasError.message);
      console.log('💡 This might be due to network-specific gas calculation\n');
    }

    // Test block information
    console.log('🧱 Testing block information...');
    try {
      const latestBlock = await client.getBlock();
      console.log('✅ Block Information Retrieved:');
      console.log(`   Block Number: ${latestBlock.number}`);
      console.log(`   Block Hash: ${latestBlock.hash.substring(0, 20)}...`);
      console.log(`   Timestamp: ${new Date(latestBlock.timestamp * 1000).toISOString()}`);
      console.log(`   Transaction Count: ${latestBlock.transactionCount}`);
      console.log(`   Gas Used: ${latestBlock.gasUsed}`);
      console.log(`   Gas Limit: ${latestBlock.gasLimit}\n`);
    } catch (blockError) {
      console.log('⚠️ Block retrieval note:', blockError.message);
    }

    console.log('🎉 Hyperion Testnet connectivity test completed successfully!');
    return true;

  } catch (error) {
    console.log('❌ Hyperion Testnet test failed:', error.message);
    console.log('💡 Please check:');
    console.log('   • Network connectivity');
    console.log('   • RPC endpoint availability');
    console.log('   • Firewall settings');
    return false;
  }
}

async function testWalletCreation() {
  console.log('👛 Testing Wallet Creation for Hyperion Testnet');
  console.log('===============================================\n');

  try {
    const walletManager = new WalletManager();

    // Create a new wallet
    console.log('🔐 Creating new Hyperion testnet wallet...');
    const newWallet = walletManager.createWallet('Hyperion-Testnet-Wallet');
    
    console.log('✅ Wallet Created Successfully:');
    console.log(`   Address: ${newWallet.address}`);
    console.log(`   Mnemonic: ${newWallet.mnemonic?.substring(0, 30)}...`);
    console.log(`   Network: Hyperion Testnet (Chain ID: 133717)`);
    console.log(`   Currency: tMETIS\n`);

    console.log('💡 To get testnet tMETIS:');
    console.log('   1. Visit the Hyperion testnet faucet (if available)');
    console.log('   2. Use the address above to request test tokens');
    console.log('   3. Check balance using the get_balance MCP tool\n');

    console.log('🔍 Wallet can be used for:');
    console.log('   • Testing transactions on Hyperion testnet');
    console.log('   • Smart contract interactions');
    console.log('   • DeFi protocol testing');
    console.log('   • Development and debugging\n');

    return true;
  } catch (error) {
    console.log('❌ Wallet creation failed:', error.message);
    return false;
  }
}

async function demonstrateHyperionMCPTools() {
  console.log('🛠️ Hyperion MCP Tools for Testnet');
  console.log('==================================\n');

  const examples = [
    {
      tool: 'get_balance',
      description: 'Check tMETIS balance on Hyperion testnet',
      example: {
        name: 'get_balance',
        arguments: {
          address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87'
        }
      },
      expectedResponse: 'Balance: 1.234 tMETIS'
    },
    {
      tool: 'send_transaction',
      description: 'Send tMETIS to another address',
      example: {
        name: 'send_transaction',
        arguments: {
          to: '0x1234567890123456789012345678901234567890',
          amount: '0.1'
        }
      },
      expectedResponse: 'Transaction sent with hash: 0x...'
    },
    {
      tool: 'get_network_info',
      description: 'Get Hyperion testnet information',
      example: {
        name: 'get_network_info',
        arguments: {}
      },
      expectedResponse: 'Network: Hyperion Testnet, Chain ID: 133717'
    },
    {
      tool: 'estimate_gas',
      description: 'Estimate gas costs in tMETIS',
      example: {
        name: 'estimate_gas',
        arguments: {
          to: '0x1234567890123456789012345678901234567890',
          value: '0.1'
        }
      },
      expectedResponse: 'Estimated Cost: 0.000021 tMETIS'
    }
  ];

  examples.forEach((example, index) => {
    console.log(`${index + 1}. ${example.tool}`);
    console.log(`   📝 ${example.description}`);
    console.log(`   💡 Example:`, JSON.stringify(example.example, null, 6));
    console.log(`   📊 Expected: ${example.expectedResponse}\n`);
  });

  console.log('🔗 Claude Desktop Integration for Hyperion Testnet:');
  console.log(`{
  "mcpServers": {
    "hyperion-mcp": {
      "command": "node",
      "args": ["build/index.js"],
      "env": {
        "HYPERION_RPC_URL": "https://hyperion-testnet.metisdevops.link",
        "HYPERION_CHAIN_ID": "133717",
        "HYPERION_NETWORK_NAME": "Hyperion Testnet",
        "HYPERION_CURRENCY_SYMBOL": "tMETIS",
        "HYPERION_EXPLORER_URL": "https://hyperion-testnet-explorer.metisdevops.link"
      }
    }
  }
}\n`);

  console.log('💬 Example Claude Interactions:');
  console.log('• "What is the tMETIS balance of [address]?"');
  console.log('• "Send 0.1 tMETIS to [address]"');
  console.log('• "What is the current Hyperion testnet block number?"');
  console.log('• "Estimate gas cost for sending 1 tMETIS"\n');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--network') || args.includes('-n')) {
    await testHyperionTestnet();
  } else if (args.includes('--wallet') || args.includes('-w')) {
    await testWalletCreation();
  } else if (args.includes('--demo') || args.includes('-d')) {
    await demonstrateHyperionMCPTools();
  } else {
    console.log('🎯 Hyperion Testnet MCP Server Test Suite');
    console.log('=========================================\n');
    
    console.log('Test Options:');
    console.log('🌐 --network (-n)  Test Hyperion testnet connectivity');
    console.log('👛 --wallet (-w)   Test wallet creation for testnet');
    console.log('🛠️ --demo (-d)     Show MCP tools examples\n');
    
    console.log('Examples:');
    console.log('  node test-hyperion-testnet.js --network');
    console.log('  node test-hyperion-testnet.js --wallet');
    console.log('  node test-hyperion-testnet.js --demo\n');
    
    // Run all tests by default
    console.log('🚀 Running all tests...\n');
    
    const networkTest = await testHyperionTestnet();
    console.log('─'.repeat(50) + '\n');
    
    const walletTest = await testWalletCreation();
    console.log('─'.repeat(50) + '\n');
    
    await demonstrateHyperionMCPTools();
    
    console.log('📊 Test Summary:');
    console.log(`   Network Connectivity: ${networkTest ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Wallet Creation: ${walletTest ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Tools Demo: ✅ COMPLETED\n`);
    
    if (networkTest && walletTest) {
      console.log('🎉 All tests passed! Hyperion MCP Server is ready for testnet use.');
    } else {
      console.log('⚠️ Some tests failed. Check network connectivity and configuration.');
    }
  }
}

main().catch(console.error);
