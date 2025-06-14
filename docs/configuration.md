# Configuration Guide

This guide explains how to configure the Hyperion MCP Server for different environments and use cases.

## Environment Variables

The server uses environment variables for configuration. Create a `.env` file in the project root or set these variables in your system environment.

### Required Configuration

#### HYPERION_RPC_URL
The RPC endpoint URL for the Hyperion blockchain.

```env
HYPERION_RPC_URL=http://localhost:8545
```

**Examples:**
- Local development: `http://localhost:8545`
- Testnet: `https://testnet-rpc.hyperion.io`
- Mainnet: `https://mainnet-rpc.hyperion.io`

### Optional Configuration

#### HYPERION_CHAIN_ID
The chain ID of the Hyperion network.

```env
HYPERION_CHAIN_ID=1
```

**Common values:**
- Mainnet: `1`
- Testnet: `3` or `4`
- Local development: `1337`

#### HYPERION_NETWORK_NAME
Human-readable name for the network.

```env
HYPERION_NETWORK_NAME=Hyperion
```

#### HYPERION_EXPLORER_URL
Block explorer URL for viewing transactions and addresses.

```env
HYPERION_EXPLORER_URL=https://explorer.hyperion.io
```

### Wallet Configuration

#### HYPERION_PRIVATE_KEYS
Comma-separated list of private keys for pre-configured wallets.

```env
HYPERION_PRIVATE_KEYS=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef,0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

**Security Note:** Never commit private keys to version control. Use secure key management in production.

#### HYPERION_ADDRESSES
Comma-separated list of addresses corresponding to the private keys.

```env
HYPERION_ADDRESSES=0x742d35Cc6634C0532925a3b8D4C9db96590c6C87,0x1234567890123456789012345678901234567890
```

**Note:** If not provided, addresses will be derived from private keys.

#### HYPERION_CURRENT_ADDRESS
The default active wallet address.

```env
HYPERION_CURRENT_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96590c6C87
```

### Performance Configuration

#### HYPERION_API_TIMEOUT
Request timeout in milliseconds.

```env
HYPERION_API_TIMEOUT=30000
```

#### HYPERION_MAX_RETRIES
Maximum number of retry attempts for failed requests.

```env
HYPERION_MAX_RETRIES=3
```

### Development Configuration

#### NODE_ENV
Environment mode.

```env
NODE_ENV=production
```

**Values:**
- `development`: Development mode with verbose logging
- `production`: Production mode with minimal logging
- `test`: Test mode

#### DEBUG
Enable debug logging.

```env
DEBUG=false
```

## Configuration Examples

### Local Development

```env
# Local Development Configuration
HYPERION_RPC_URL=http://localhost:8545
HYPERION_CHAIN_ID=1337
HYPERION_NETWORK_NAME=Local Hyperion
HYPERION_EXPLORER_URL=http://localhost:4000

# Development wallet (DO NOT use in production)
HYPERION_PRIVATE_KEYS=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
HYPERION_CURRENT_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Development settings
NODE_ENV=development
DEBUG=true
HYPERION_API_TIMEOUT=10000
```

### Testnet Configuration

```env
# Testnet Configuration
HYPERION_RPC_URL=https://testnet-rpc.hyperion.io
HYPERION_CHAIN_ID=3
HYPERION_NETWORK_NAME=Hyperion Testnet
HYPERION_EXPLORER_URL=https://testnet-explorer.hyperion.io

# Testnet wallet
HYPERION_PRIVATE_KEYS=your_testnet_private_key_here
HYPERION_CURRENT_ADDRESS=your_testnet_address_here

# Production-like settings
NODE_ENV=production
DEBUG=false
HYPERION_API_TIMEOUT=30000
HYPERION_MAX_RETRIES=3
```

### Production Configuration

```env
# Production Configuration
HYPERION_RPC_URL=https://mainnet-rpc.hyperion.io
HYPERION_CHAIN_ID=1
HYPERION_NETWORK_NAME=Hyperion Mainnet
HYPERION_EXPLORER_URL=https://explorer.hyperion.io

# Production wallets (use secure key management)
HYPERION_PRIVATE_KEYS=${SECURE_PRIVATE_KEY_1},${SECURE_PRIVATE_KEY_2}
HYPERION_ADDRESSES=${WALLET_ADDRESS_1},${WALLET_ADDRESS_2}
HYPERION_CURRENT_ADDRESS=${WALLET_ADDRESS_1}

# Production settings
NODE_ENV=production
DEBUG=false
HYPERION_API_TIMEOUT=30000
HYPERION_MAX_RETRIES=5
```

## MCP Client Configuration

### Claude Desktop

Add to your Claude Desktop configuration file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "hyperion-mcp": {
      "command": "node",
      "args": ["path/to/hyperion-mcp-server/build/index.js"],
      "env": {
        "HYPERION_RPC_URL": "https://mainnet-rpc.hyperion.io",
        "HYPERION_PRIVATE_KEYS": "your_private_key_here",
        "HYPERION_CURRENT_ADDRESS": "your_address_here"
      }
    }
  }
}
```

### Other MCP Clients

For other MCP clients, refer to their documentation for server configuration. The general pattern is:

1. Specify the command: `node build/index.js`
2. Set environment variables
3. Configure any client-specific settings

## Security Best Practices

### Private Key Management

1. **Never commit private keys to version control**
2. **Use environment variables or secure key management systems**
3. **Rotate keys regularly**
4. **Use different keys for different environments**

### Network Security

1. **Use HTTPS endpoints in production**
2. **Validate SSL certificates**
3. **Use VPN or private networks when possible**
4. **Monitor for unusual activity**

### Access Control

1. **Limit access to the MCP server**
2. **Use firewall rules to restrict connections**
3. **Implement logging and monitoring**
4. **Regular security audits**

## Troubleshooting

### Common Issues

#### Connection Errors
- Check RPC URL is correct and accessible
- Verify network connectivity
- Check firewall settings

#### Authentication Errors
- Verify private keys are correct
- Check address format
- Ensure sufficient balance for gas fees

#### Transaction Failures
- Check gas limit and price
- Verify recipient address
- Ensure sufficient balance

### Debug Mode

Enable debug mode for detailed logging:

```env
DEBUG=true
NODE_ENV=development
```

This will provide verbose output to help diagnose issues.

### Log Files

The server logs to stdout/stderr. In production, consider redirecting logs to files:

```bash
node build/index.js > hyperion-mcp.log 2>&1
```

## Performance Tuning

### Request Timeouts

Adjust timeout values based on network conditions:

```env
HYPERION_API_TIMEOUT=60000  # 60 seconds for slow networks
```

### Retry Logic

Configure retry attempts for unreliable networks:

```env
HYPERION_MAX_RETRIES=5
```

### Connection Pooling

For high-throughput scenarios, consider implementing connection pooling in the client configuration.

## Monitoring

### Health Checks

The server provides basic health information through the network info tool:

```json
{
  "name": "get_network_info",
  "arguments": {}
}
```

### Metrics

Consider implementing custom metrics for:
- Request latency
- Error rates
- Transaction success rates
- Wallet balances

### Alerting

Set up alerts for:
- Connection failures
- Transaction failures
- Low wallet balances
- High error rates
