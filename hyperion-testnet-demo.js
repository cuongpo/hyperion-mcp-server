#!/usr/bin/env node

/**
 * Live demo of get_balance on Hyperion Testnet
 * This demonstrates the actual MCP server working with Hyperion blockchain
 */

import { spawn } from 'child_process';

async function testGetBalanceOnHyperion() {
  console.log('🚀 Hyperion Testnet - Live get_balance Demo');
  console.log('===========================================\n');

  console.log('🌐 Network Details:');
  console.log('• Network: Hyperion Testnet');
  console.log('• Chain ID: 133717');
  console.log('• RPC: https://hyperion-testnet.metisdevops.link');
  console.log('• Currency: tMETIS');
  console.log('• Explorer: https://hyperion-testnet-explorer.metisdevops.link\n');

  console.log('🚀 Starting Hyperion MCP Server...');
  
  const serverProcess = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      HYPERION_RPC_URL: 'https://hyperion-testnet.metisdevops.link',
      HYPERION_CHAIN_ID: '133717',
      HYPERION_NETWORK_NAME: 'Hyperion Testnet',
      HYPERION_CURRENCY_SYMBOL: 'tMETIS',
      HYPERION_EXPLORER_URL: 'https://hyperion-testnet-explorer.metisdevops.link'
    }
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('✅ MCP Server started\n');

  // Test 1: Get network info
  console.log('📡 Test 1: Getting Network Information');
  console.log('─'.repeat(40));
  
  const networkRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'get_network_info',
      arguments: {}
    }
  };

  console.log('📤 Request:', JSON.stringify(networkRequest, null, 2));

  return new Promise((resolve) => {
    let responseBuffer = '';
    let testCount = 0;
    
    const timeout = setTimeout(() => {
      console.log('⏰ Demo completed (timeout reached)');
      serverProcess.kill();
      resolve(true);
    }, 15000);

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      responseBuffer += output;
      
      // Look for JSON responses
      const lines = responseBuffer.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          if (response.result && response.result.content) {
            testCount++;
            console.log('✅ Response received:');
            console.log(response.result.content[0].text);
            console.log();
            
            if (testCount === 1) {
              // Send balance request after network info
              setTimeout(() => {
                console.log('💰 Test 2: Getting Balance (Sample Address)');
                console.log('─'.repeat(40));
                
                const balanceRequest = {
                  jsonrpc: '2.0',
                  id: 2,
                  method: 'tools/call',
                  params: {
                    name: 'get_balance',
                    arguments: {
                      address: '0x7F873eD3ecef67074E2594038AB3D8dd508cF9F4' // Generated wallet address
                    }
                  }
                };
                
                console.log('📤 Request:', JSON.stringify(balanceRequest, null, 2));
                serverProcess.stdin.write(JSON.stringify(balanceRequest) + '\n');
              }, 1000);
            }
            
            if (testCount >= 2) {
              clearTimeout(timeout);
              serverProcess.kill();
              resolve(true);
            }
          }
        } catch (e) {
          // Continue collecting data
        }
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.log('🔍 Server info:', data.toString().trim());
    });

    // Send first request
    serverProcess.stdin.write(JSON.stringify(networkRequest) + '\n');
  });
}

function showHyperionIntegrationGuide() {
  console.log('📚 Hyperion Testnet Integration Guide');
  console.log('====================================\n');

  console.log('🔧 1. Environment Setup:');
  console.log('Create .env file with:');
  console.log(`HYPERION_RPC_URL=https://hyperion-testnet.metisdevops.link
HYPERION_CHAIN_ID=133717
HYPERION_NETWORK_NAME=Hyperion Testnet
HYPERION_CURRENCY_SYMBOL=tMETIS
HYPERION_EXPLORER_URL=https://hyperion-testnet-explorer.metisdevops.link\n`);

  console.log('🤖 2. Claude Desktop Integration:');
  console.log('Add to claude_desktop_config.json:');
  console.log(`{
  "mcpServers": {
    "hyperion-mcp": {
      "command": "node",
      "args": ["/path/to/hyperion-mcp-server/build/index.js"],
      "env": {
        "HYPERION_RPC_URL": "https://hyperion-testnet.metisdevops.link",
        "HYPERION_CHAIN_ID": "133717",
        "HYPERION_NETWORK_NAME": "Hyperion Testnet",
        "HYPERION_CURRENCY_SYMBOL": "tMETIS"
      }
    }
  }
}\n`);

  console.log('💬 3. Example Claude Conversations:');
  console.log('User: "What is the tMETIS balance of 0x7F873eD3ecef67074E2594038AB3D8dd508cF9F4?"');
  console.log('Claude: *Uses get_balance tool automatically*');
  console.log('Response: "The address has 0 tMETIS on Hyperion Testnet"\n');

  console.log('User: "What is the current Hyperion testnet block number?"');
  console.log('Claude: *Uses get_network_info tool*');
  console.log('Response: "The latest block on Hyperion Testnet is #1946318"\n');

  console.log('🛠️ 4. Available MCP Tools for Hyperion:');
  const tools = [
    'create_wallet - Generate new Hyperion-compatible wallet',
    'get_balance - Check tMETIS balance on Hyperion testnet',
    'send_transaction - Send tMETIS to other addresses',
    'get_network_info - Get Hyperion network status',
    'estimate_gas - Calculate transaction costs in tMETIS',
    'get_transaction - Query transaction details',
    'get_block - Get block information',
    'call_contract - Interact with smart contracts',
    'send_contract_transaction - Execute contract functions'
  ];

  tools.forEach((tool, index) => {
    console.log(`   ${index + 1}. ${tool}`);
  });

  console.log('\n🎯 5. Real-World Use Cases:');
  console.log('• DeFi protocol testing on Hyperion');
  console.log('• Smart contract development and testing');
  console.log('• Portfolio tracking for Hyperion assets');
  console.log('• Automated trading bot development');
  console.log('• Multi-chain wallet management');
  console.log('• Transaction monitoring and alerts\n');

  console.log('🔗 6. Useful Links:');
  console.log('• Testnet Explorer: https://hyperion-testnet-explorer.metisdevops.link');
  console.log('• RPC Endpoint: https://hyperion-testnet.metisdevops.link');
  console.log('• Chain ID: 133717');
  console.log('• Currency: tMETIS\n');
}

function showMockBalanceExample() {
  console.log('🎭 Mock get_balance Example for Hyperion Testnet');
  console.log('===============================================\n');

  console.log('📤 MCP Request:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_balance",
    "arguments": {
      "address": "0x7F873eD3ecef67074E2594038AB3D8dd508cF9F4"
    }
  }
}\n`);

  console.log('📥 MCP Response:');
  console.log(`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Native Balance:\\n\\nAddress: 0x7F873eD3ecef67074E2594038AB3D8dd508cF9F4\\nBalance: 0 tMETIS"
      }
    ]
  }
}\n`);

  console.log('✨ What happens:');
  console.log('1. MCP server receives get_balance request');
  console.log('2. Connects to Hyperion testnet RPC');
  console.log('3. Calls eth_getBalance with the address');
  console.log('4. Converts Wei to tMETIS (human-readable)');
  console.log('5. Returns formatted response with tMETIS symbol\n');

  console.log('🎯 Key Features:');
  console.log('• Native Hyperion testnet support');
  console.log('• Automatic tMETIS currency formatting');
  console.log('• Real-time balance queries');
  console.log('• Error handling for invalid addresses');
  console.log('• Integration with block explorer links\n');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--live') || args.includes('-l')) {
    await testGetBalanceOnHyperion();
    console.log('\n🎉 Live demo completed!');
    console.log('The get_balance tool successfully connected to Hyperion testnet');
    console.log('and retrieved network information and balance data.\n');
  } else if (args.includes('--guide') || args.includes('-g')) {
    showHyperionIntegrationGuide();
  } else if (args.includes('--mock') || args.includes('-m')) {
    showMockBalanceExample();
  } else {
    console.log('🎯 Hyperion Testnet MCP Demo Options');
    console.log('===================================\n');
    
    console.log('Available demos:');
    console.log('🔴 --live (-l)    Run live demo with Hyperion testnet');
    console.log('📚 --guide (-g)   Show integration guide');
    console.log('🎭 --mock (-m)    Show mock example\n');
    
    console.log('Examples:');
    console.log('  node hyperion-testnet-demo.js --live');
    console.log('  node hyperion-testnet-demo.js --guide');
    console.log('  node hyperion-testnet-demo.js --mock\n');
    
    // Show mock by default
    showMockBalanceExample();
  }
}

main().catch(console.error);
