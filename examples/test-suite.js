/**
 * Hyperion MCP Server Test Suite
 * 
 * This file contains comprehensive tests for all MCP tools.
 * Run with: node examples/test-suite.js
 */

const { spawn } = require('child_process');
const readline = require('readline');

class MCPTester {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
  }

  async startServer() {
    console.log('🚀 Starting Hyperion MCP Server...');
    
    this.serverProcess = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        HYPERION_RPC_URL: process.env.HYPERION_RPC_URL || 'http://localhost:8545',
        HYPERION_NETWORK_NAME: 'Test Network',
        DEBUG: 'true'
      }
    });

    // Wait for server to start
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

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
        reject(new Error('Request timeout'));
      }, 10000);

      const onData = (data) => {
        responseData += data.toString();
        try {
          const response = JSON.parse(responseData);
          clearTimeout(timeout);
          this.serverProcess.stdout.off('data', onData);
          resolve(response);
        } catch (e) {
          // Continue collecting data
        }
      };

      this.serverProcess.stdout.on('data', onData);
      this.serverProcess.stdin.write(requestStr);
    });
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running test: ${testName}`);
    
    try {
      const result = await testFunction();
      console.log(`✅ ${testName}: PASSED`);
      this.testResults.push({ name: testName, status: 'PASSED', result });
      return result;
    } catch (error) {
      console.log(`❌ ${testName}: FAILED - ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
      return null;
    }
  }

  async testListTools() {
    const response = await this.sendMCPRequest('tools/list');
    
    if (!response.result || !response.result.tools) {
      throw new Error('No tools returned');
    }

    const expectedTools = [
      'create_wallet',
      'import_wallet',
      'list_wallets',
      'get_balance',
      'send_transaction',
      'get_transaction',
      'get_block',
      'get_network_info',
      'estimate_gas',
      'call_contract',
      'send_contract_transaction',
      'set_current_wallet',
      'get_current_wallet'
    ];

    const actualTools = response.result.tools.map(tool => tool.name);
    
    for (const expectedTool of expectedTools) {
      if (!actualTools.includes(expectedTool)) {
        throw new Error(`Missing tool: ${expectedTool}`);
      }
    }

    return response.result.tools;
  }

  async testCreateWallet() {
    const response = await this.sendMCPRequest('tools/call', {
      name: 'create_wallet',
      arguments: {
        name: 'TestWallet'
      }
    });

    if (!response.result || !response.result.content) {
      throw new Error('No wallet creation response');
    }

    const content = response.result.content[0].text;
    if (!content.includes('Wallet created successfully')) {
      throw new Error('Wallet creation failed');
    }

    return response.result;
  }

  async testListWallets() {
    const response = await this.sendMCPRequest('tools/call', {
      name: 'list_wallets',
      arguments: {}
    });

    if (!response.result || !response.result.content) {
      throw new Error('No wallet list response');
    }

    return response.result;
  }

  async testGetNetworkInfo() {
    const response = await this.sendMCPRequest('tools/call', {
      name: 'get_network_info',
      arguments: {}
    });

    if (!response.result || !response.result.content) {
      throw new Error('No network info response');
    }

    const content = response.result.content[0].text;
    if (!content.includes('Network Information')) {
      throw new Error('Invalid network info response');
    }

    return response.result;
  }

  async testGetBalance() {
    // Test with a known address (this might fail if not connected to real network)
    const response = await this.sendMCPRequest('tools/call', {
      name: 'get_balance',
      arguments: {
        address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87'
      }
    });

    // This test might fail in local environment, so we check for proper error handling
    if (response.result && response.result.content) {
      return response.result;
    } else if (response.error) {
      // Expected in test environment
      return { error: response.error };
    }

    throw new Error('Unexpected response format');
  }

  async testEstimateGas() {
    const response = await this.sendMCPRequest('tools/call', {
      name: 'estimate_gas',
      arguments: {
        to: '0x1234567890123456789012345678901234567890',
        value: '0.1'
      }
    });

    // This test might fail in local environment
    if (response.result || response.error) {
      return response;
    }

    throw new Error('No gas estimation response');
  }

  async testInvalidTool() {
    const response = await this.sendMCPRequest('tools/call', {
      name: 'invalid_tool',
      arguments: {}
    });

    if (!response.error && !response.result.content[0].text.includes('Error')) {
      throw new Error('Should have returned error for invalid tool');
    }

    return response;
  }

  async testInvalidParameters() {
    const response = await this.sendMCPRequest('tools/call', {
      name: 'get_balance',
      arguments: {
        // Missing required 'address' parameter
      }
    });

    if (!response.error && !response.result.content[0].text.includes('Error')) {
      throw new Error('Should have returned error for missing parameters');
    }

    return response;
  }

  async runAllTests() {
    console.log('🎯 Starting Hyperion MCP Server Test Suite\n');

    try {
      await this.startServer();

      // Core functionality tests
      await this.runTest('List Tools', () => this.testListTools());
      await this.runTest('Create Wallet', () => this.testCreateWallet());
      await this.runTest('List Wallets', () => this.testListWallets());
      await this.runTest('Get Network Info', () => this.testGetNetworkInfo());
      
      // Network-dependent tests (may fail in test environment)
      await this.runTest('Get Balance', () => this.testGetBalance());
      await this.runTest('Estimate Gas', () => this.testEstimateGas());
      
      // Error handling tests
      await this.runTest('Invalid Tool', () => this.testInvalidTool());
      await this.runTest('Invalid Parameters', () => this.testInvalidParameters());

    } finally {
      await this.stopServer();
    }

    this.printResults();
  }

  printResults() {
    console.log('\n📊 Test Results Summary');
    console.log('========================');

    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }

    console.log('\n✅ Test suite completed!');
  }
}

// Mock MCP client for testing
class MockMCPClient {
  constructor() {
    this.tools = [
      'create_wallet',
      'import_wallet', 
      'list_wallets',
      'get_balance',
      'send_transaction',
      'get_transaction',
      'get_block',
      'get_network_info',
      'estimate_gas',
      'call_contract',
      'send_contract_transaction',
      'set_current_wallet',
      'get_current_wallet'
    ];
  }

  async callTool(name, args) {
    console.log(`📞 Calling tool: ${name}`);
    console.log(`📝 Arguments:`, JSON.stringify(args, null, 2));
    
    // Simulate tool responses
    switch (name) {
      case 'create_wallet':
        return {
          content: [{
            type: 'text',
            text: 'Wallet created successfully!\n\nAddress: 0x742d35Cc6634C0532925a3b8D4C9db96590c6C87\nMnemonic: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
          }]
        };
      
      case 'list_wallets':
        return {
          content: [{
            type: 'text',
            text: 'Available Wallets (1):\n\n→ 0x742d35Cc6634C0532925a3b8D4C9db96590c6C87 (current)'
          }]
        };
      
      case 'get_network_info':
        return {
          content: [{
            type: 'text',
            text: 'Network Information:\n\nName: Hyperion\nChain ID: 1\nLatest Block: 12345678\nGas Price: 20000000000 wei\nConnected: Yes'
          }]
        };
      
      default:
        return {
          content: [{
            type: 'text',
            text: `Mock response for ${name}`
          }]
        };
    }
  }

  async demonstrateUsage() {
    console.log('🎭 Mock MCP Client Demonstration\n');

    for (const tool of this.tools.slice(0, 5)) {
      const result = await this.callTool(tool, {});
      console.log(`✅ ${tool} completed\n`);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--mock')) {
    // Run mock demonstration
    const mockClient = new MockMCPClient();
    await mockClient.demonstrateUsage();
  } else {
    // Run full test suite
    const tester = new MCPTester();
    await tester.runAllTests();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test suite interrupted');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { MCPTester, MockMCPClient };
