/**
 * Spaceship API Integration
 * Automated DNS management for dlxstudios.ai
 * Based on Spaceship.com API v1.0.0
 */

interface SpaceshipConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
}

interface DNSRecord {
  host: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV';
  value: string;
  ttl?: number;
}

interface SpaceshipDNSRecord {
  host: string;
  type: string;
  value: string;
  ttl: number;
}

class SpaceshipAPIService {
  private config: SpaceshipConfig | null = null;
  private baseUrl = 'https://spaceship.dev/api';

  constructor() {
    // Load API credentials from localStorage
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const apiKey = localStorage.getItem('spaceship_api_key');
      const apiSecret = localStorage.getItem('spaceship_api_secret');
      
      if (apiKey && apiSecret) {
        this.config = {
          apiKey,
          apiSecret,
          baseUrl: this.baseUrl,
        };
      }
    } catch (error) {
      console.error('Failed to load Spaceship API config:', error);
    }
  }

  public setCredentials(apiKey: string, apiSecret: string) {
    try {
      localStorage.setItem('spaceship_api_key', apiKey);
      localStorage.setItem('spaceship_api_secret', apiSecret);
      this.config = {
        apiKey,
        apiSecret,
        baseUrl: this.baseUrl,
      };
      return true;
    } catch (error) {
      console.error('Failed to save Spaceship API credentials:', error);
      return false;
    }
  }

  public isConfigured(): boolean {
    return this.config !== null;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    if (!this.config) {
      throw new Error('Spaceship API not configured. Please set API key and secret.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'X-Api-Key': this.config.apiKey,
      'X-Api-Secret': this.config.apiSecret,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorCode = response.headers.get('spaceship-error-code');
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Spaceship API error: ${errorCode || response.status} - ${errorData.detail || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Spaceship API request failed:', error);
      throw error;
    }
  }

  /**
   * Get DNS records for a domain
   */
  public async getDNSRecords(domain: string): Promise<DNSRecord[]> {
    const response = await this.request(`/v1/dns/records/${domain}`);
    
    if (response.records && Array.isArray(response.records)) {
      return response.records.map((record: SpaceshipDNSRecord) => ({
        host: record.host || '@',
        type: record.type as DNSRecord['type'],
        value: record.value,
        ttl: record.ttl,
      }));
    }
    
    return [];
  }

  /**
   * Update DNS records for a domain
   */
  public async updateDNSRecords(
    domain: string,
    records: DNSRecord[]
  ): Promise<{ success: boolean; operationId?: string }> {
    const payload = {
      records: records.map(record => ({
        host: record.host === '@' ? '' : record.host,
        type: record.type,
        value: record.value,
        ttl: record.ttl || 300, // Default 5 minutes
      })),
    };

    const response = await this.request(`/v1/dns/records/${domain}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    // Spaceship uses async operations for DNS updates
    if (response.operationId) {
      return {
        success: true,
        operationId: response.operationId,
      };
    }

    return { success: true };
  }

  /**
   * Update A record for root domain
   */
  public async updateARecord(
    domain: string,
    ipAddress: string,
    ttl: number = 300
  ): Promise<{ success: boolean; operationId?: string }> {
    // First get existing records
    const existingRecords = await this.getDNSRecords(domain);
    
    // Filter out existing A record for root
    const otherRecords = existingRecords.filter(
      (r) => !(r.host === '@' && r.type === 'A')
    );

    // Add new A record
    const updatedRecords: DNSRecord[] = [
      {
        host: '@',
        type: 'A',
        value: ipAddress,
        ttl,
      },
      ...otherRecords,
    ];

    return this.updateDNSRecords(domain, updatedRecords);
  }

  /**
   * Check async operation status
   */
  public async getOperationStatus(operationId: string): Promise<{
    status: 'pending' | 'completed' | 'failed';
    details?: any;
  }> {
    const response = await this.request(`/v1/async-operations/${operationId}`);
    
    return {
      status: response.status || 'pending',
      details: response,
    };
  }

  /**
   * Get domain information
   */
  public async getDomainInfo(domain: string): Promise<any> {
    return this.request(`/v1/domains/${domain}`);
  }

  /**
   * Check if domain is available
   */
  public async checkDomainAvailability(domain: string): Promise<boolean> {
    try {
      const response = await this.request(`/v1/domains/available?domain=${domain}`);
      return response.available === true;
    } catch {
      return false;
    }
  }
}

export const spaceshipAPI = new SpaceshipAPIService();

