/**
 * Crypto API Service
 * Aggregates data from multiple sources (CoinGecko, CoinMarketCap, etc.)
 * Falls back to CoinGecko if Google Finance Beta is unavailable
 */

import { Coin, MarketData, PriceChartData } from '../../types/crypto';
import { googleFinanceService } from './googleFinanceService';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const COINMARKETCAP_API = 'https://pro-api.coinmarketcap.com/v1';

class CryptoApiService {
  private coinGeckoCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 60000; // 1 minute

  /**
   * Get top coins by market cap (CoinMarketCap-style)
   */
  async getTopCoins(limit: number = 100): Promise<Coin[]> {
    try {
      // Try CoinGecko first (free, no API key needed)
      const cached = this.getCached(`top-${limit}`);
      if (cached) return cached;

      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
      }

      const data = await response.json();
      const coins: Coin[] = data.map((item: any) => this.mapCoinGeckoToCoin(item));
      
      this.setCache(`top-${limit}`, coins);
      return coins;
    } catch (error) {
      console.error('Failed to fetch top coins:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Get coin by ID or symbol
   */
  async getCoin(id: string): Promise<Coin | null> {
    try {
      const cached = this.getCached(`coin-${id}`);
      if (cached) return cached;

      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${id}&sparkline=true`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.length === 0) return null;

      const coin = this.mapCoinGeckoToCoin(data[0]);
      this.setCache(`coin-${id}`, coin);
      return coin;
    } catch (error) {
      console.error('Failed to fetch coin:', error);
      return null;
    }
  }

  /**
   * Get coin by symbol
   */
  async getCoinBySymbol(symbol: string): Promise<Coin | null> {
    try {
      // First get coin ID from symbol
      const response = await fetch(
        `${COINGECKO_API}/coins/list?include_platform=false`
      );

      if (!response.ok) {
        return null;
      }

      const coins = await response.json();
      const coin = coins.find((c: any) => c.symbol.toLowerCase() === symbol.toLowerCase());
      
      if (!coin) return null;

      return this.getCoin(coin.id);
    } catch (error) {
      console.error('Failed to fetch coin by symbol:', error);
      return null;
    }
  }

  /**
   * Get historical price data
   */
  async getHistoricalData(
    coinId: string,
    days: number = 30,
    interval: 'daily' | 'hourly' = 'daily'
  ): Promise<PriceChartData[]> {
    try {
      const cached = this.getCached(`history-${coinId}-${days}`);
      if (cached) return cached;

      const response = await fetch(
        `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${interval === 'hourly' ? 'hourly' : 'daily'}`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
      }

      const data = await response.json();
      const prices = data.prices || [];
      
      const chartData: PriceChartData[] = prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
      }));

      this.setCache(`history-${coinId}-${days}`, chartData);
      return chartData;
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      return [];
    }
  }

  /**
   * Get market overview data
   */
  async getMarketData(): Promise<MarketData> {
    try {
      const cached = this.getCached('market-data');
      if (cached) return cached;

      const response = await fetch(`${COINGECKO_API}/global`);

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
      }

      const data = await response.json();
      const global = data.data;

      const marketData: MarketData = {
        totalMarketCap: global.total_market_cap.usd,
        totalVolume: global.total_volume.usd,
        btcDominance: global.market_cap_percentage.btc,
        ethDominance: global.market_cap_percentage.eth,
        activeCryptocurrencies: global.active_cryptocurrencies,
        marketCapChange24h: global.market_cap_change_percentage_24h_usd,
        volumeChange24h: 0, // Not provided by CoinGecko global endpoint
      };

      this.setCache('market-data', marketData);
      return marketData;
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      // Return default structure
      return {
        totalMarketCap: 0,
        totalVolume: 0,
        btcDominance: 0,
        ethDominance: 0,
        activeCryptocurrencies: 0,
        marketCapChange24h: 0,
        volumeChange24h: 0,
      };
    }
  }

  /**
   * Search coins
   */
  async searchCoins(query: string): Promise<Coin[]> {
    try {
      const response = await fetch(
        `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const coinIds = data.coins?.slice(0, 10).map((c: any) => c.id) || [];
      
      if (coinIds.length === 0) return [];

      // Fetch full coin data
      const coins = await Promise.all(
        coinIds.map((id: string) => this.getCoin(id))
      );

      return coins.filter((c): c is Coin => c !== null);
    } catch (error) {
      console.error('Failed to search coins:', error);
      return [];
    }
  }

  /**
   * Get trending coins
   */
  async getTrendingCoins(): Promise<Coin[]> {
    try {
      const cached = this.getCached('trending');
      if (cached) return cached;

      const response = await fetch(`${COINGECKO_API}/search/trending`);

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const trendingIds = data.coins?.map((c: any) => c.item.id) || [];
      
      if (trendingIds.length === 0) return [];

      const coins = await Promise.all(
        trendingIds.map((id: string) => this.getCoin(id))
      );

      const validCoins = coins.filter((c): c is Coin => c !== null);
      this.setCache('trending', validCoins);
      return validCoins;
    } catch (error) {
      console.error('Failed to fetch trending coins:', error);
      return [];
    }
  }

  /**
   * Map CoinGecko data to our Coin interface
   */
  private mapCoinGeckoToCoin(data: any): Coin {
    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image,
      current_price: data.current_price,
      market_cap: data.market_cap,
      market_cap_rank: data.market_cap_rank,
      fully_diluted_valuation: data.fully_diluted_valuation,
      total_volume: data.total_volume,
      high_24h: data.high_24h,
      low_24h: data.low_24h,
      price_change_24h: data.price_change_24h,
      price_change_percentage_24h: data.price_change_percentage_24h,
      market_cap_change_24h: data.market_cap_change_24h,
      market_cap_change_percentage_24h: data.market_cap_change_percentage_24h,
      circulating_supply: data.circulating_supply,
      total_supply: data.total_supply,
      max_supply: data.max_supply,
      ath: data.ath,
      ath_change_percentage: data.ath_change_percentage,
      ath_date: data.ath_date,
      atl: data.atl,
      atl_change_percentage: data.atl_change_percentage,
      atl_date: data.atl_date,
      last_updated: data.last_updated,
      sparkline_in_7d: data.sparkline_in_7d ? {
        price: data.sparkline_in_7d.price || []
      } : undefined,
    };
  }

  /**
   * Cache management
   */
  private getCached(key: string): any {
    const cached = this.coinGeckoCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.coinGeckoCache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.coinGeckoCache.clear();
  }
}

export const cryptoApiService = new CryptoApiService();

