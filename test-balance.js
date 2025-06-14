#!/usr/bin/env node

/**
 * Test script to demonstrate get_balance functionality
 * This script tests the Hyperion MCP Server's balance checking capabilities
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

class BalanceTester {
  constructor() {
    this.serverProcess = null;
  }

  async startServer() {
    console.log('🚀 Starting Hyperion MCP Server for balance testing...');
    
    this.serverProcess = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        HYPERION_RPC_URL: process.env.HYPERION_RPC_URL || 'https://eth.llamarpc.com',
        HYPERION_NETWORK_NAME: 'Ethereum Mainnet',
        HYPERION_CHAIN_ID: '1',
        DEBUG: 'false'
      }
    });

    // Wait for server to initialize
    await setTimeout(2000);
    console.log('✅ Server started');
  }

  async stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      console.log('🛑 Server stopped');
    }
  }

  async sendMCPRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: method,
        params: params
      };

      const requestStr = JSON.stringify(request) + '\n';
      let responseData = '';
      
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout after 10 seconds'));
      }, 10000);

      const onData = (data) => {
        responseData += data.toString();
        
        // Try to parse complete JSON responses
        const lines = responseData.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              clearTimeout(timeout);
              this.serverProcess.stdout.off('data', onData);
              resolve(response);
              return;
            }
          } catch (e) {
            // Continue collecting data
          }
        }
      };

      this.serverProcess.stdout.on('data', onData);
      this.serverProcess.stderr.on('data', (data) => {
        console.log('Server stderr:', data.toString());
      });
      
      this.serverProcess.stdin.write(requestStr);
    });
  }

  async testGetBalance() {
    console.log('\n🧪 Testing get_balance tool...');
    
    // Test with a well-known Ethereum address (Vitalik's address)
    const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    
    try {
      console.log(`📍 Testing balance for address: ${testAddress}`);
      
      const response = await this.sendMCPRequest('tools/call', {
        name: 'get_balance',
        arguments: {
          address: testAddress
        }
      });

      if (response.result && response.result.content) {
        console.log('✅ Balance check successful!');
        console.log('📊 Response:', response.result.content[0].text);
        return true;
      } else if (response.error) {
        console.log('⚠️ Expected error (likely network issue):', response.error.message);
        return false;
      } else {
        console.log('❌ Unexpected response format:', response);
        return false;
      }
    } catch (error) {
      console.log('❌ Balance check failed:', error.message);
      return false;
    }
  }

  async testGetTokenBalance() {
    console.log('\n🧪 Testing ERC20 token balance...');
    
    // Test with USDC token contract
    const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const usdcContract = '0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c'; // Example token address
    
    try {
      console.log(`📍 Testing USDC balance for address: ${testAddress}`);
      
      const response = await this.sendMCPRequest('tools/call', {
        name: 'get_balance',
        arguments: {
          address: testAddress,
          tokenAddress: usdcContract
        }
      });

      if (response.result && response.result.content) {
        console.log('✅ Token balance check successful!');
        console.log('📊 Response:', response.result.content[0].text);
        return true;
      } else if (response.error) {
        console.log('⚠️ Expected error (token contract may not exist):', response.error.message);
        return false;
      } else {
        console.log('❌ Unexpected response format:', response);
        return false;
      }
    } catch (error) {
      console.log('❌ Token balance check failed:', error.message);
      return false;
    }
  }

  async testListTools() {
    console.log('\n🧪 Testing tools/list...');
    
    try {
      const response = await this.sendMCPRequest('tools/list');
      
      if (response.result && response.result.tools) {
        console.log('✅ Tools list successful!');
        const tools = response.result.tools.map(tool => tool.name);
        console.log('🛠️ Available tools:', tools.join(', '));
        
        // Check if get_balance tool is available
        if (tools.includes('get_balance')) {
          console.log('✅ get_balance tool is available');
          return true;
        } else {
          console.log('❌ get_balance tool not found');
          return false;
        }
      } else {
        console.log('❌ No tools returned');
        return false;
      }
    } catch (error) {
      console.log('❌ Tools list failed:', error.message);
      return false;
    }
  }

  async runDemo() {
    console.log('🎯 Hyperion MCP Server - Balance Testing Demo');
    console.log('==============================================\n');

    try {
      await this.startServer();
      
      // Test 1: List available tools
      const toolsTest = await this.testListTools();
      
      if (toolsTest) {
        // Test 2: Get native balance
        await this.testGetBalance();
        
        // Test 3: Get token balance
        await this.testGetTokenBalance();
      }
      
    } catch (error) {
      console.log('💥 Demo failed:', error.message);
    } finally {
      await this.stopServer();
    }

    console.log('\n🏁 Balance testing demo completed!');
  }
}

// Mock demonstration (doesn't require real network)
class MockBalanceDemo {
  async runMockDemo() {
    console.log('🎭 Mock Balance Testing Demo');
    console.log('============================\n');

    console.log('📞 Simulating MCP call: tools/list');
    console.log('✅ Response: 14 tools available including get_balance\n');

    console.log('📞 Simulating MCP call: get_balance');
    console.log('📝 Arguments: { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" }');
    console.log('✅ Mock Response:');
    console.log(`
Native Balance:

Address: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
Balance: 1.234 ETH
`);

    console.log('📞 Simulating MCP call: get_balance (ERC20 token)');
    console.log('📝 Arguments: { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", tokenAddress: "0xA0b86a33E6441e8e4E2f4c6c8C6c8C6c8C6c8C6c" }');
    console.log('✅ Mock Response:');
    console.log(`
Token Balance:

Address: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
Token: USD Coin (USDC)
Balance: 1000.50 USDC
`);

    console.log('🎉 Mock demo completed successfully!');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--mock') || args.includes('-m')) {
    // Run mock demonstration
    const mockDemo = new MockBalanceDemo();
    await mockDemo.runMockDemo();
  } else {
    // Run real server test
    const tester = new BalanceTester();
    await tester.runDemo();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  process.exit(0);
});

// Run the demo
main().catch(console.error);
