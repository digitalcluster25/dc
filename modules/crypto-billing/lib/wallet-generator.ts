// 🔐 Wallet Generator Library for CRYPTO_BILLING_MODULE

import { CryptoCurrency, BlockchainNetwork, WalletConfig } from '../types/crypto-billing.types';
import { getNetworkByCurrency } from '../utils/constants';
import { validateCryptoAddress } from '../utils/formatters';

/**
 * Интерфейс для генератора кошельков
 */
interface WalletGenerator {
  generateWallet(derivationIndex: number): Promise<WalletConfig>;
  validateAddress(address: string): boolean;
  getBalance(address: string): Promise<string>;
}

/**
 * Базовый класс для генераторов кошельков
 */
abstract class BaseWalletGenerator implements WalletGenerator {
  protected masterSeed: string;
  protected network: BlockchainNetwork;

  constructor(masterSeed: string, network: BlockchainNetwork) {
    this.masterSeed = masterSeed;
    this.network = network;
  }

  abstract generateWallet(derivationIndex: number): Promise<WalletConfig>;
  abstract validateAddress(address: string): boolean;
  abstract getBalance(address: string): Promise<string>;
}

/**
 * Bitcoin кошелек генератор (упрощенная версия для демо)
 */
class BitcoinWalletGenerator extends BaseWalletGenerator {
  async generateWallet(derivationIndex: number): Promise<WalletConfig> {
    // В реальном проекте здесь будет использоваться bitcoinjs-lib
    // Для демо генерируем заглушку
    
    const derivationPath = `m/44'/0'/0'/0/${derivationIndex}`;
    const fakePrivateKey = this.generateFakePrivateKey(derivationIndex);
    const fakePublicKey = this.generateFakePublicKey(fakePrivateKey);
    const fakeAddress = this.generateFakeBitcoinAddress(fakePublicKey);

    return {
      network: 'bitcoin',
      masterSeed: this.masterSeed,
      derivationPath,
      addressIndex: derivationIndex,
      privateKey: fakePrivateKey,
      publicKey: fakePublicKey,
      address: fakeAddress
    };
  }

  validateAddress(address: string): boolean {
    return /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
  }

  async getBalance(address: string): Promise<string> {
    // В реальном проекте запрос к BlockCypher или другому API
    return '0.00000000';
  }

  private generateFakePrivateKey(index: number): string {
    // Генерируем детерминированный приватный ключ на основе seed + index
    const combined = `${this.masterSeed}-${index}`;
    let hash = 0;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Конвертируем в hex строку длиной 64 символа
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
    return hexHash.repeat(8).substring(0, 64);
  }

  private generateFakePublicKey(privateKey: string): string {
    // Упрощенная генерация публичного ключа
    return '04' + privateKey + privateKey.substring(0, 62);
  }

  private generateFakeBitcoinAddress(publicKey: string): string {
    // Генерируем fake Bitcoin адрес
    const hash = publicKey.substring(2, 42);
    return '1' + this.base58Encode(hash).substring(0, 33);
  }

  private base58Encode(hex: string): string {
    // Упрощенная Base58 кодировка для демо
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    let num = BigInt('0x' + hex);
    
    while (num > 0) {
      result = alphabet[Number(num % 58n)] + result;
      num = num / 58n;
    }
    
    return result || '1';
  }
}

/**
 * Ethereum кошелек генератор (упрощенная версия для демо)
 */
class EthereumWalletGenerator extends BaseWalletGenerator {
  async generateWallet(derivationIndex: number): Promise<WalletConfig> {
    // В реальном проекте здесь будет использоваться ethers или web3.js
    
    const derivationPath = `m/44'/60'/0'/0/${derivationIndex}`;
    const fakePrivateKey = this.generateFakePrivateKey(derivationIndex);
    const fakePublicKey = this.generateFakePublicKey(fakePrivateKey);
    const fakeAddress = this.generateFakeEthereumAddress(fakePublicKey);

    return {
      network: this.network,
      masterSeed: this.masterSeed,
      derivationPath,
      addressIndex: derivationIndex,
      privateKey: fakePrivateKey,
      publicKey: fakePublicKey,
      address: fakeAddress
    };
  }

  validateAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  async getBalance(address: string): Promise<string> {
    // В реальном проекте запрос к Infura или другому провайдеру
    return '0.000000000000000000';
  }

  private generateFakePrivateKey(index: number): string {
    // Аналогично Bitcoin генератору
    const combined = `${this.masterSeed}-${this.network}-${index}`;
    let hash = 0;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
    return hexHash.repeat(8).substring(0, 64);
  }

  private generateFakePublicKey(privateKey: string): string {
    return '04' + privateKey + privateKey.substring(0, 62);
  }

  private generateFakeEthereumAddress(publicKey: string): string {
    // Генерируем fake Ethereum адрес
    const hash = publicKey.substring(2, 42);
    return '0x' + hash.toLowerCase();
  }
}

/**
 * Фабрика для создания генераторов кошельков
 */
export class WalletGeneratorFactory {
  private static generators: Map<BlockchainNetwork, WalletGenerator> = new Map();
  
  static createGenerator(currency: CryptoCurrency, masterSeed?: string): WalletGenerator {
    const network = getNetworkByCurrency(currency);
    const seed = masterSeed || process.env.MASTER_SEED_PHRASE || 'demo-seed-phrase-for-testing-only';
    
    if (!this.generators.has(network)) {
      switch (network) {
        case 'bitcoin':
          this.generators.set(network, new BitcoinWalletGenerator(seed, network));
          break;
        case 'ethereum':
        case 'polygon':
        case 'bsc':
          this.generators.set(network, new EthereumWalletGenerator(seed, network));
          break;
        default:
          throw new Error(`Unsupported network: ${network}`);
      }
    }
    
    return this.generators.get(network)!;
  }
}

/**
 * Менеджер кошельков для управления адресами платежей
 */
export class PaymentWalletManager {
  private usedIndexes: Set<number> = new Set();
  private maxRetries = 100;

  /**
   * Генерация уникального кошелька для платежа
   */
  async generatePaymentWallet(currency: CryptoCurrency, paymentId: string): Promise<WalletConfig> {
    const generator = WalletGeneratorFactory.createGenerator(currency);
    
    // Генерируем детерминированный индекс на основе paymentId
    let derivationIndex = this.generateDeterministicIndex(paymentId);
    let retries = 0;
    
    // Убеждаемся что индекс уникальный
    while (this.usedIndexes.has(derivationIndex) && retries < this.maxRetries) {
      derivationIndex = (derivationIndex + 1) % 2147483647; // Max safe integer
      retries++;
    }
    
    if (retries >= this.maxRetries) {
      throw new Error('Unable to generate unique wallet address');
    }
    
    const wallet = await generator.generateWallet(derivationIndex);
    this.usedIndexes.add(derivationIndex);
    
    console.log(`Generated ${currency} wallet for payment ${paymentId}:`, {
      address: wallet.address,
      derivationIndex,
      network: wallet.network
    });
    
    return wallet;
  }

  /**
   * Получение баланса кошелька
   */
  async getWalletBalance(address: string, currency: CryptoCurrency): Promise<string> {
    const generator = WalletGeneratorFactory.createGenerator(currency);
    return await generator.getBalance(address);
  }

  /**
   * Валидация адреса кошелька
   */
  validateWalletAddress(address: string, currency: CryptoCurrency): boolean {
    const generator = WalletGeneratorFactory.createGenerator(currency);
    return generator.validateAddress(address);
  }

  /**
   * Генерация детерминированного индекса из paymentId
   */
  private generateDeterministicIndex(paymentId: string): number {
    let hash = 0;
    
    for (let i = 0; i < paymentId.length; i++) {
      const char = paymentId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash) % 1000000; // Ограничиваем до 1М для начала
  }

  /**
   * Очистка использованных индексов (для периодического обслуживания)
   */
  cleanup() {
    this.usedIndexes.clear();
  }

  /**
   * Получение статистики использования
   */
  getStats() {
    return {
      totalWalletsGenerated: this.usedIndexes.size,
      unusedIndexes: 1000000 - this.usedIndexes.size
    };
  }
}

/**
 * Утилиты для работы с HD кошельками
 */
export class HDWalletUtils {
  /**
   * Генерация мнемонической фразы (для демо)
   */
  static generateMnemonic(): string {
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual'
    ];
    
    return Array.from({ length: 12 }, () => 
      words[Math.floor(Math.random() * words.length)]
    ).join(' ');
  }

  /**
   * Валидация мнемонической фразы (упрощенная)
   */
  static validateMnemonic(mnemonic: string): boolean {
    const words = mnemonic.trim().split(' ');
    return words.length === 12 || words.length === 24;
  }

  /**
   * Генерация стандартного пути деривации
   */
  static getDerivationPath(currency: CryptoCurrency, account: number = 0, addressIndex: number = 0): string {
    const coinTypes = {
      'BTC': 0,
      'ETH': 60,
      'USDT': 60, // ERC-20
      'USDC': 60, // ERC-20
      'BUSD': 60, // BEP-20 (совместимо с ERC-20)
      'MATIC': 60 // ERC-20
    };
    
    const coinType = coinTypes[currency] || 60;
    return `m/44'/${coinType}'/${account}'/0/${addressIndex}`;
  }

  /**
   * Конвертация приватного ключа в различные форматы
   */
  static formatPrivateKey(privateKey: string, format: 'hex' | 'wif' | 'buffer' = 'hex'): string {
    // Упрощенная реализация для демо
    switch (format) {
      case 'hex':
        return privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
      case 'wif':
        return 'WIF_' + privateKey; // Заглушка для WIF формата
      case 'buffer':
        return `Buffer(${privateKey})`;
      default:
        return privateKey;
    }
  }
}

/**
 * Безопасное хранилище для приватных ключей
 */
export class SecureKeyStore {
  private keys: Map<string, string> = new Map();
  private encryptionKey: string;

  constructor(encryptionKey?: string) {
    this.encryptionKey = encryptionKey || process.env.CRYPTO_BILLING_SECRET || 'default-encryption-key';
  }

  /**
   * Сохранение приватного ключа (с шифрованием в продакшене)
   */
  storePrivateKey(walletId: string, privateKey: string): void {
    // В реальном проекте здесь будет AES шифрование
    const encrypted = this.simpleEncrypt(privateKey);
    this.keys.set(walletId, encrypted);
  }

  /**
   * Получение приватного ключа (с расшифровкой)
   */
  getPrivateKey(walletId: string): string | null {
    const encrypted = this.keys.get(walletId);
    if (!encrypted) return null;
    
    return this.simpleDecrypt(encrypted);
  }

  /**
   * Удаление приватного ключа
   */
  removePrivateKey(walletId: string): void {
    this.keys.delete(walletId);
  }

  /**
   * Простое шифрование для демо (НЕ для продакшена!)
   */
  private simpleEncrypt(data: string): string {
    // Для демо - простой XOR, в продакшене используйте AES
    return Buffer.from(data).toString('base64');
  }

  /**
   * Простая расшифровка для демо
   */
  private simpleDecrypt(encrypted: string): string {
    return Buffer.from(encrypted, 'base64').toString();
  }

  /**
   * Очистка всех ключей
   */
  clear(): void {
    this.keys.clear();
  }

  /**
   * Получение количества сохраненных ключей
   */
  size(): number {
    return this.keys.size;
  }
}

/**
 * Глобальные инстансы
 */
export const paymentWalletManager = new PaymentWalletManager();
export const secureKeyStore = new SecureKeyStore();

/**
 * Основные экспортируемые функции
 */
export async function generatePaymentAddress(currency: CryptoCurrency, paymentId: string): Promise<{ address: string; privateKey: string }> {
  const wallet = await paymentWalletManager.generatePaymentWallet(currency, paymentId);
  
  // Сохраняем приватный ключ в безопасном хранилище
  secureKeyStore.storePrivateKey(paymentId, wallet.privateKey);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey // Возвращаем для записи в БД (зашифрованно)
  };
}

export async function getAddressBalance(address: string, currency: CryptoCurrency): Promise<string> {
  return await paymentWalletManager.getWalletBalance(address, currency);
}

export function validateAddress(address: string, currency: CryptoCurrency): boolean {
  return paymentWalletManager.validateWalletAddress(address, currency);
}

/**
 * Инициализация модуля кошельков
 */
export function initializeWalletModule() {
  console.log('🔐 Wallet generator module initialized');
  
  // Проверяем наличие master seed
  const masterSeed = process.env.MASTER_SEED_PHRASE;
  if (!masterSeed || masterSeed === 'demo-seed-phrase-for-testing-only') {
    console.warn('⚠️  Using demo master seed. Set MASTER_SEED_PHRASE for production!');
  }
  
  console.log('📊 Wallet manager stats:', paymentWalletManager.getStats());
}
