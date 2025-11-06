/**
 * Portfolio Service
 * Manages portfolio data, calculations, and storage
 */

import { Portfolio, Holding, Transaction, DCAStrategy } from '../../types/crypto';
import { LocalStorageManager } from '../../utils/localStorage';
import { cryptoApiService } from './cryptoApiService';

const PORTFOLIO_STORAGE_KEY = 'dlx-crypto-portfolios';
const TRANSACTIONS_STORAGE_KEY = 'dlx-crypto-transactions';

class PortfolioService {
  /**
   * Get all portfolios
   */
  getPortfolios(): Portfolio[] {
    return LocalStorageManager.get<Portfolio[]>(PORTFOLIO_STORAGE_KEY, []);
  }

  /**
   * Get portfolio by ID
   */
  getPortfolio(id: string): Portfolio | null {
    const portfolios = this.getPortfolios();
    return portfolios.find(p => p.id === id) || null;
  }

  /**
   * Create new portfolio
   */
  createPortfolio(name: string): Portfolio {
    const portfolios = this.getPortfolios();
    const newPortfolio: Portfolio = {
      id: `portfolio-${Date.now()}`,
      name,
      totalValue: 0,
      totalCost: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      holdings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    portfolios.push(newPortfolio);
    LocalStorageManager.set(PORTFOLIO_STORAGE_KEY, portfolios);
    return newPortfolio;
  }

  /**
   * Update portfolio
   */
  updatePortfolio(portfolio: Portfolio): void {
    const portfolios = this.getPortfolios();
    const index = portfolios.findIndex(p => p.id === portfolio.id);
    if (index !== -1) {
      portfolios[index] = { ...portfolio, updatedAt: new Date().toISOString() };
      LocalStorageManager.set(PORTFOLIO_STORAGE_KEY, portfolios);
    }
  }

  /**
   * Delete portfolio
   */
  deletePortfolio(id: string): void {
    const portfolios = this.getPortfolios();
    const filtered = portfolios.filter(p => p.id !== id);
    LocalStorageManager.set(PORTFOLIO_STORAGE_KEY, filtered);
    
    // Also delete related transactions
    const transactions = this.getTransactions(id);
    transactions.forEach(t => this.deleteTransaction(t.id));
  }

  /**
   * Recalculate portfolio values
   */
  async recalculatePortfolio(portfolioId: string): Promise<Portfolio | null> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return null;

    const transactions = this.getTransactions(portfolioId);
    
    // Group transactions by coin
    const holdingsMap = new Map<string, {
      amount: number;
      totalCost: number;
      firstPurchase: string;
      lastPurchase: string;
    }>();

    transactions.forEach(tx => {
      if (tx.type === 'buy' || tx.type === 'transfer') {
        const existing = holdingsMap.get(tx.coinId) || {
          amount: 0,
          totalCost: 0,
          firstPurchase: tx.timestamp,
          lastPurchase: tx.timestamp,
        };
        existing.amount += tx.amount;
        existing.totalCost += tx.total;
        if (new Date(tx.timestamp) < new Date(existing.firstPurchase)) {
          existing.firstPurchase = tx.timestamp;
        }
        if (new Date(tx.timestamp) > new Date(existing.lastPurchase)) {
          existing.lastPurchase = tx.timestamp;
        }
        holdingsMap.set(tx.coinId, existing);
      } else if (tx.type === 'sell') {
        const existing = holdingsMap.get(tx.coinId);
        if (existing) {
          // FIFO cost basis calculation
          const costPerUnit = existing.totalCost / existing.amount;
          const costOfSale = tx.amount * costPerUnit;
          existing.amount -= tx.amount;
          existing.totalCost -= costOfSale;
          if (existing.amount <= 0) {
            holdingsMap.delete(tx.coinId);
          } else {
            holdingsMap.set(tx.coinId, existing);
          }
        }
      }
    });

    // Fetch current prices and build holdings
    const holdings: Holding[] = [];
    let totalCost = 0;
    let totalValue = 0;

    for (const [coinId, data] of holdingsMap.entries()) {
      if (data.amount <= 0) continue;

      const coin = await cryptoApiService.getCoin(coinId);
      if (!coin) continue;

      const currentPrice = coin.current_price;
      const currentValue = data.amount * currentPrice;
      const returnAmount = currentValue - data.totalCost;
      const returnPercent = (returnAmount / data.totalCost) * 100;

      holdings.push({
        coinId,
        symbol: coin.symbol,
        name: coin.name,
        amount: data.amount,
        costBasis: data.totalCost,
        currentPrice,
        currentValue,
        return: returnAmount,
        returnPercent,
        allocation: 0, // Will calculate after
        firstPurchaseDate: data.firstPurchase,
        lastPurchaseDate: data.lastPurchase,
      });

      totalCost += data.totalCost;
      totalValue += currentValue;
    }

    // Calculate allocations
    holdings.forEach(holding => {
      holding.allocation = totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0;
    });

    // Update portfolio
    const updatedPortfolio: Portfolio = {
      ...portfolio,
      holdings,
      totalCost,
      totalValue,
      totalReturn: totalValue - totalCost,
      totalReturnPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      updatedAt: new Date().toISOString(),
    };

    this.updatePortfolio(updatedPortfolio);
    return updatedPortfolio;
  }

  /**
   * Get transactions for a portfolio
   */
  getTransactions(portfolioId: string): Transaction[] {
    const allTransactions = LocalStorageManager.get<Transaction[]>(TRANSACTIONS_STORAGE_KEY, []);
    return allTransactions.filter(t => t.portfolioId === portfolioId);
  }

  /**
   * Add transaction
   */
  addTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
    const transactions = this.getTransactions(transaction.portfolioId);
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    transactions.push(newTransaction);
    
    // Update all transactions
    const allTransactions = LocalStorageManager.get<Transaction[]>(TRANSACTIONS_STORAGE_KEY, []);
    const otherTransactions = allTransactions.filter(t => t.portfolioId !== transaction.portfolioId);
    LocalStorageManager.set(TRANSACTIONS_STORAGE_KEY, [...otherTransactions, ...transactions]);

    // Recalculate portfolio
    this.recalculatePortfolio(transaction.portfolioId);

    return newTransaction;
  }

  /**
   * Delete transaction
   */
  deleteTransaction(transactionId: string): void {
    const allTransactions = LocalStorageManager.get<Transaction[]>(TRANSACTIONS_STORAGE_KEY, []);
    const transaction = allTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const filtered = allTransactions.filter(t => t.id !== transactionId);
    LocalStorageManager.set(TRANSACTIONS_STORAGE_KEY, filtered);

    // Recalculate portfolio
    this.recalculatePortfolio(transaction.portfolioId);
  }

  /**
   * Calculate DCA strategy results
   */
  async calculateDCA(strategy: Omit<DCAStrategy, 'totalCoins' | 'averagePrice' | 'currentValue' | 'return' | 'returnPercent'>): Promise<DCAStrategy> {
    const { coinId, amount, frequency, startDate, endDate, totalInvested } = strategy;
    
    // Get historical data
    const end = endDate ? new Date(endDate) : new Date();
    const start = new Date(startDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const historicalData = await cryptoApiService.getHistoricalData(coinId, Math.min(daysDiff, 365), 'daily');
    
    if (historicalData.length === 0) {
      throw new Error('No historical data available');
    }

    // Calculate purchases based on frequency
    const purchases: { date: Date; price: number; amount: number }[] = [];
    let currentDate = new Date(start);
    let totalCoins = 0;
    let totalSpent = 0;

    while (currentDate <= end) {
      // Find closest price data point
      const priceData = historicalData.find(
        d => Math.abs(d.timestamp - currentDate.getTime()) < 24 * 60 * 60 * 1000
      );

      if (priceData) {
        const coinsBought = amount / priceData.price;
        purchases.push({
          date: new Date(currentDate),
          price: priceData.price,
          amount: coinsBought,
        });
        totalCoins += coinsBought;
        totalSpent += amount;
      }

      // Move to next purchase date
      if (frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // Get current price
    const coin = await cryptoApiService.getCoin(coinId);
    if (!coin) {
      throw new Error('Coin not found');
    }

    const currentPrice = coin.current_price;
    const averagePrice = totalSpent / totalCoins;
    const currentValue = totalCoins * currentPrice;
    const returnAmount = currentValue - totalSpent;
    const returnPercent = (returnAmount / totalSpent) * 100;

    return {
      ...strategy,
      totalCoins,
      averagePrice,
      currentValue,
      return: returnAmount,
      returnPercent,
    };
  }
}

export const portfolioService = new PortfolioService();

