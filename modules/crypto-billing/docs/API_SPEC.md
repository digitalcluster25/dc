# 📚 API Documentation - CRYPTO_BILLING_MODULE

## Overview
Crypto Billing API предоставляет полный функционал для приема криптовалютных платежей в SaaS хостинг платформе.

**Base URL:** `https://your-domain.com/api/crypto`

## Authentication
Все API endpoints требуют аутентификации через JWT токен в заголовке:
```
Authorization: Bearer <access_token>
```

## Supported Cryptocurrencies
- **USDT** - Tether USD (Ethereum/Tron)
- **USDC** - USD Coin (Ethereum/Polygon)  
- **BUSD** - Binance USD (BSC)
- **BTC** - Bitcoin
- **ETH** - Ethereum
- **MATIC** - Polygon

## Service Types
- `wordpress` - WordPress CMS
- `nextjs` - Next.js Application
- `api` - REST API Service
- `database` - PostgreSQL Database
- `docker` - Custom Docker Container
- `static-site` - Static Website

---

## Endpoints

### 1. Create Payment

Creates a new crypto payment for a service.

**POST** `/api/crypto/create-payment`

#### Request Body
```json
{
  "serviceType": "wordpress",
  "cryptoCurrency": "USDT",
  "network": "ethereum"  // Optional
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Платеж успешно создан",
  "payment": {
    "id": "pay_1a2b3c4d",
    "userId": "user_12345",
    "serviceType": "wordpress",
    "cryptoCurrency": "USDT",
    "network": "ethereum",
    "priceEUR": 10,
    "priceUSD": 10.90,
    "cryptoAmount": "10.85",
    "exchangeRate": 0.92,
    "paymentAddress": "0x1234567890abcdef...",
    "qrCode": "base64_encoded_qr_code",
    "status": "pending",
    "createdAt": "2025-09-22T10:00:00Z",
    "expiresAt": "2025-09-22T11:00:00Z",
    "confirmations": 0,
    "requiredConfirmations": 12
  }
}
```

#### Error Responses
- **400 Bad Request** - Invalid parameters
- **401 Unauthorized** - Missing or invalid token
- **429 Too Many Requests** - Rate limit exceeded

---

### 2. Check Payment Status

Checks the current status of a payment.

**GET** `/api/crypto/check-payment?paymentId={id}`

**POST** `/api/crypto/check-payment`
```json
{
  "paymentId": "pay_1a2b3c4d"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "payment": {
    "id": "pay_1a2b3c4d",
    "status": "confirming",
    "confirmations": 8,
    "requiredConfirmations": 12,
    "transactionHash": "0xabcdef123456...",
    "blockHeight": 18500000,
    // ... other payment fields
  },
  "transactionInfo": {
    "hash": "0xabcdef123456...",
    "confirmations": 8,
    "amount": "10.85",
    "timestamp": "2025-09-22T10:05:00Z"
  }
}
```

#### Payment Statuses
- `pending` - Waiting for payment
- `confirming` - Payment received, waiting for confirmations
- `confirmed` - Payment confirmed, activating service
- `completed` - Service activated successfully
- `expired` - Payment time expired
- `failed` - Payment processing failed

---

### 3. Confirm Payment

Manually confirm a payment with transaction hash.

**POST** `/api/crypto/confirm-payment`

#### Request Body
```json
{
  "paymentId": "pay_1a2b3c4d",
  "transactionHash": "0xabcdef123456...",
  "blockHeight": 18500000  // Optional
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Платеж подтвержден и сервис активирован",
  "serviceActivated": true,
  "serviceDetails": {
    "type": "wordpress",
    "url": "https://wordpress-abc123.railway.app",
    "adminUrl": "https://wordpress-abc123.railway.app/wp-admin",
    "credentials": {
      "username": "admin",
      "password": "secure_password_123"
    }
  }
}
```

---

### 4. Get Crypto Rates

Retrieves current cryptocurrency exchange rates.

**GET** `/api/crypto/rates`

#### Query Parameters
- `currency` (string, optional) - Specific currency to fetch (e.g., "USDT")
- `stablecoins` (boolean, optional) - Only return stablecoin rates

#### Response (200 OK)
```json
{
  "success": true,
  "rates": [
    {
      "currency": "USDT",
      "priceUSD": 1.00,
      "priceEUR": 0.92,
      "change24h": 0.1,
      "lastUpdated": "2025-09-22T10:00:00Z"
    },
    {
      "currency": "BTC",
      "priceUSD": 43000.00,
      "priceEUR": 39560.00,
      "change24h": 2.5,
      "lastUpdated": "2025-09-22T10:00:00Z"
    }
  ],
  "lastUpdated": "2025-09-22T10:00:00Z"
}
```

---

## Error Codes

### Standard HTTP Status Codes
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid auth token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (payment not found)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Custom Error Codes
```json
{
  "success": false,
  "message": "Error description",
  "code": "CRYPTO_ERROR_CODE"
}
```

- `INVALID_CURRENCY` - Unsupported cryptocurrency
- `INSUFFICIENT_AMOUNT` - Payment amount too low
- `PAYMENT_EXPIRED` - Payment time expired  
- `TRANSACTION_FAILED` - Blockchain transaction failed
- `NETWORK_ERROR` - Blockchain network error
- `WALLET_ERROR` - Wallet generation error
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Create Payment | 5 requests | 1 minute |
| Check Payment | 60 requests | 1 minute |
| Confirm Payment | 10 requests | 1 minute |
| Get Rates | 30 requests | 1 minute |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1695369600
```

---

## WebSocket Events (Future)

For real-time payment updates:

```javascript
const ws = new WebSocket('wss://your-domain.com/api/crypto/ws');

// Subscribe to payment updates
ws.send(JSON.stringify({
  type: 'subscribe',
  paymentId: 'pay_1a2b3c4d'
}));

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Payment update:', data);
};
```

---

## SDK Examples

### JavaScript/TypeScript
```javascript
import { CryptoBillingAPI } from '@your-org/crypto-billing';

const client = new CryptoBillingAPI({
  baseUrl: 'https://your-domain.com/api',
  accessToken: 'your-jwt-token'
});

// Create payment
const payment = await client.createPayment({
  serviceType: 'wordpress',
  cryptoCurrency: 'USDT'
});

// Monitor payment status
const status = await client.checkPayment(payment.id);
```

### cURL
```bash
# Create payment
curl -X POST https://your-domain.com/api/crypto/create-payment \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "wordpress",
    "cryptoCurrency": "USDT"
  }'

# Check status
curl https://your-domain.com/api/crypto/check-payment?paymentId=pay_1a2b3c4d \
  -H "Authorization: Bearer your-jwt-token"
```

---

## Testing

### Test Mode
Set environment variable `NODE_ENV=test` to enable test mode:
- No real blockchain transactions
- Mock payment confirmations
- Faster confirmation times
- Test service activation

### Test Credentials
```
Test User: test@example.com
Password: test123
Access Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Test Scenarios

#### Successful Payment Flow
1. Create payment for USDT
2. Payment status: `pending`
3. Mock transaction confirmation
4. Payment status: `confirming` → `confirmed` → `completed`
5. Service activated

#### Failed Payment Flow
1. Create payment with expired time
2. Payment status: `pending` → `expired`

#### Network Congestion Simulation
1. Create payment for ETH
2. Extended confirmation time
3. Status updates with increasing confirmations

---

## Webhooks (Future)

Configure webhook endpoints to receive payment notifications:

```json
{
  "event": "payment.confirmed",
  "paymentId": "pay_1a2b3c4d",
  "status": "confirmed",
  "transactionHash": "0xabcdef123456...",
  "timestamp": "2025-09-22T10:00:00Z"
}
```

### Webhook Events
- `payment.created`
- `payment.pending`
- `payment.confirming`
- `payment.confirmed`
- `payment.completed`
- `payment.expired`
- `payment.failed`

---

## Security Best Practices

### API Security
- Always use HTTPS
- Validate JWT tokens on every request
- Implement rate limiting
- Log all payment activities
- Encrypt sensitive data in database

### Wallet Security  
- Generate unique address per payment
- Use HD wallets with proper derivation
- Store private keys encrypted
- Regular key rotation
- Cold storage for main funds

### Transaction Verification
- Verify transaction on blockchain
- Check exact amount received
- Validate sender authenticity
- Monitor for double-spending
- Set appropriate confirmation requirements

---

## Monitoring & Analytics

### Key Metrics
- Total payments processed
- Success/failure rates by currency
- Average confirmation times
- Revenue by service type
- Popular payment methods

### Alerts
- Failed payment confirmations
- Unusual transaction patterns
- API error rate spikes
- Wallet balance low warnings
- Service activation failures

---

## Support

- **Email**: crypto-support@your-domain.com
- **Documentation**: https://docs.your-domain.com/crypto-billing
- **Status Page**: https://status.your-domain.com
- **GitHub**: https://github.com/your-org/crypto-billing-module

For technical issues, include:
- Payment ID
- Error messages
- Transaction hash (if available)
- Browser/client information
- Steps to reproduce
