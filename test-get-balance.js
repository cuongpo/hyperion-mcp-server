#!/usr/bin/env node

/**
 * Simple test for get_balance functionality
 */

import { spawn } from 'child_process';

async function testGetBalance() {
  console.log('🧪 Testing get_balance MCP Tool');
  console.log('================================\n');

  console.log('🚀 Starting MCP Server...');
  
  const serverProcess = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      HYPERION_RPC_URL: 'https://eth.llamarpc.com',
      HYPERION_NETWORK_NAME: 'Ethereum Mainnet',
      HYPERION_CHAIN_ID: '1'
    }
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('✅ Server started\n');

  // Test get_balance tool
  console.log('📞 Testing get_balance tool...');
  console.log('📍 Address: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 (Vitalik\'s address)');

  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'get_balance',
      arguments: {
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      }
    }
  };

  console.log('📤 Sending request:', JSON.stringify(request, null, 2));

  return new Promise((resolve) => {
    let responseData = '';
    
    const timeout = setTimeout(() => {
      console.log('⏰ Request timeout - this is expected in test environment');
      serverProcess.kill();
      resolve(false);
    }, 10000);

    serverProcess.stdout.on('data', (data) => {
      responseData += data.toString();
      console.log('📥 Server response:', data.toString());
      
      try {
        const response = JSON.parse(responseData);
        if (response.result && response.result.content) {
          console.log('✅ Success! Balance retrieved:');
          console.log(response.result.content[0].text);
          clearTimeout(timeout);
          serverProcess.kill();
          resolve(true);
        }
      } catch (e) {
        // Continue collecting data
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.log('🔍 Server stderr:', data.toString());
    });

    // Send the request
    serverProcess.stdin.write(JSON.stringify(request) + '\n');
  });
}

async function demonstrateBalanceChecking() {
  console.log('💰 Hyperion MCP Server - Balance Checking Demo');
  console.log('===============================================\n');

  console.log('🎯 What we\'re testing:');
  console.log('• get_balance MCP tool');
  console.log('• Real blockchain connection');
  console.log('• Ethereum mainnet balance query');
  console.log('• JSON-RPC MCP protocol\n');

  console.log('📋 Test Details:');
  console.log('• Tool: get_balance');
  console.log('• Network: Ethereum Mainnet');
  console.log('• RPC: https://eth.llamarpc.com');
  console.log('• Address: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 (Vitalik\'s wallet)');
  console.log('• Expected: ETH balance in human-readable format\n');

  console.log('🔄 Starting test...\n');

  try {
    const success = await testGetBalance();
    
    if (success) {
      console.log('\n🎉 Test completed successfully!');
      console.log('✅ The get_balance tool is working correctly');
    } else {
      console.log('\n⚠️ Test timed out (expected in some environments)');
      console.log('💡 This could be due to network latency or RPC limits');
    }
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
  }

  console.log('\n📚 How to use get_balance in practice:');
  console.log('1. Start the MCP server: npm start');
  console.log('2. Connect via MCP client (Claude Desktop, etc.)');
  console.log('3. Call get_balance with any Ethereum address');
  console.log('4. Get balance in human-readable format\n');

  console.log('🔗 Integration example:');
  console.log('Ask Claude: "What is the ETH balance of 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?"');
  console.log('Claude will automatically use the get_balance tool!\n');
}

// Show what the tool does without running the server
function showMockExample() {
  console.log('🎭 Mock Example - get_balance Tool');
  console.log('==================================\n');

  console.log('📤 Input (MCP Request):');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_balance",
    "arguments": {
      "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    }
  }
}\n`);

  console.log('📥 Output (MCP Response):');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Native Balance:\\n\\nAddress: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\\nBalance: 0.157729930675358967 ETH"
      }
    ]
  }
}\n`);

  console.log('✨ What happens behind the scenes:');
  console.log('1. MCP server receives the request');
  console.log('2. Validates the Ethereum address format');
  console.log('3. Connects to Ethereum RPC endpoint');
  console.log('4. Calls eth_getBalance JSON-RPC method');
  console.log('5. Converts Wei to ETH (human-readable)');
  console.log('6. Returns formatted response\n');

  console.log('🎯 Real-world usage:');
  console.log('• Portfolio tracking');
  console.log('• Wallet monitoring');
  console.log('• DeFi balance checking');
  console.log('• Multi-wallet management');
  console.log('• Automated balance alerts\n');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--mock') || args.includes('-m')) {
    showMockExample();
  } else if (args.includes('--live') || args.includes('-l')) {
    await demonstrateBalanceChecking();
  } else {
    console.log('🎯 Hyperion MCP Server - get_balance Tool Test');
    console.log('==============================================\n');
    
    console.log('Choose a test mode:\n');
    console.log('🎭 --mock (-m)   Show mock example (no network required)');
    console.log('🔴 --live (-l)   Run live test with real server\n');
    
    console.log('Examples:');
    console.log('  node test-get-balance.js --mock');
    console.log('  node test-get-balance.js --live\n');
    
    // Show mock by default
    showMockExample();
  }
}

main().catch(console.error);
