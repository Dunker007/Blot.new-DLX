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
  name?: string;  // API uses 'name' not 'host'
  type: string;
  address?: string;  // A/AAAA records use 'address'
  cname?: string;  // CNAME records use 'cname'
  value?: string;  // Other records use 'value'
  text?: string;  // TXT records use 'text'
  ttl?: number;
  [key: string]: any;  // Allow other fields for different record types
}

class SpaceshipAPIService {
  private config: SpaceshipConfig | null = null;
  // Use proxy in development to avoid CORS issues
  private baseUrl = import.meta.env.DEV 
    ? '/api/spaceship' 
    : 'https://spaceship.dev/api';

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

  public clearCredentials(): void {
    try {
      localStorage.removeItem('spaceship_api_key');
      localStorage.removeItem('spaceship_api_secret');
      this.config = null;
    } catch (error) {
      console.error('Failed to clear Spaceship API credentials:', error);
    }
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    if (!this.config) {
      throw new Error('Spaceship API not configured. Please set API key and secret.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey,
      'X-API-Secret': this.config.apiSecret,
    };
    
    // Merge with any existing headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorCode = response.headers.get('spaceship-error-code');
        let errorData = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch {
          // Ignore JSON parse errors for error responses
        }
        throw new Error(
          `Spaceship API error: ${errorCode || response.status} - ${errorData.detail || response.statusText}`
        );
      }

      // Handle 204 No Content responses (common for PUT requests)
      if (response.status === 204) {
        return { success: true };
      }

      // Read response body (can only read once)
      // Some APIs return 200 OK with empty body for successful PUT requests
      const text = await response.text();
      
      // Handle empty responses (common for PUT/UPDATE operations)
      if (!text || text.trim() === '') {
        console.log('Empty response body, treating as success');
        return { success: true };
      }

      // Try to parse as JSON
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON response:', json);
        return json;
      } catch (error) {
        // If parsing fails, log the text but still treat as success
        // (some APIs return plain text success messages like "OK")
        console.warn('Failed to parse JSON response. Response text:', text.substring(0, 200));
        console.warn('Treating as success since status was OK');
        return { success: true };
      }
    } catch (error: any) {
      console.error('Spaceship API request failed:', error);
      
      // Better error messages for common issues
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        // CORS or network error
        throw new Error(
          'Network error: Unable to reach Spaceship API. This may be a CORS issue. ' +
          'The API may require server-side requests. Check browser console for details.'
        );
      }
      
      // Re-throw with original message if it's already formatted
      if (error.message?.includes('Spaceship API error')) {
        throw error;
      }
      
      // Generic error
      throw new Error(error.message || 'Failed to connect to Spaceship API');
    }
  }

  /**
   * Get DNS records for a domain
   */
  public async getDNSRecords(domain: string): Promise<DNSRecord[]> {
    // API requires take and skip parameters for pagination
    const response = await this.request(`/v1/dns/records/${domain}?take=500&skip=0`);
    
    // API returns { items: [...], total: number }
    if (response.items && Array.isArray(response.items)) {
      return response.items.map((record: SpaceshipDNSRecord) => {
        // API uses 'name' for host
        const host = record.name || '@';
        
        // API uses different fields for different record types:
        // - 'address' for A/AAAA records
        // - 'cname' for CNAME records
        // - 'value' for other types
        let value = '';
        if (record.type === 'A' || record.type === 'AAAA') {
          value = record.address || '';
        } else if (record.type === 'CNAME') {
          value = record.cname || '';
        } else {
          value = record.value || record.text || '';
        }
        
        return {
          host,
          type: record.type as DNSRecord['type'],
          value,
          ttl: record.ttl,
        };
      });
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
    // API expects { force: boolean, items: [{ type, name, address/value, ttl }] }
    // Filter out records with empty/invalid values before creating payload
    const validRecords = records.filter(record => {
      // Skip records with empty or undefined values
      if (!record.value || !record.value.trim()) {
        console.log(`Skipping ${record.type} record for ${record.host} - empty value (value: "${record.value}")`);
        return false;
      }
      return true;
    });

    console.log(`Filtered ${records.length} records down to ${validRecords.length} valid records`);

    const payload = {
      force: true, // Force update even if record exists
      items: validRecords.map(record => {
        const item: any = {
          type: record.type,
          name: record.host === '@' ? '@' : record.host,
          ttl: record.ttl || 300,
        };
        
        // A and AAAA records use 'address', others use different fields
        if (record.type === 'A' || record.type === 'AAAA') {
          if (!record.value || !record.value.trim()) {
            throw new Error(`A record requires a valid IP address`);
          }
          item.address = record.value.trim();
        } else if (record.type === 'CNAME') {
          if (!record.value || !record.value.trim()) {
            throw new Error(`CNAME record requires a valid target`);
          }
          item.cname = record.value.trim();
        } else if (record.type === 'MX') {
          // MX records have priority and exchange
          const parts = record.value.split(' ');
          item.priority = parseInt(parts[0]) || 10;
          item.exchange = parts.slice(1).join(' ') || record.value;
        } else if (record.type === 'TXT') {
          item.text = record.value;
        } else {
          // Fallback for other types
          item.value = record.value;
        }
        
        return item;
      }),
    };

    console.log('DNS Update Payload:', JSON.stringify(payload, null, 2));

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
   * Removes ALL existing A records for '@' and adds the new one
   * Also ensures www CNAME points to root domain
   */
  public async updateARecord(
    domain: string,
    ipAddress: string,
    ttl: number = 300
  ): Promise<{ success: boolean; operationId?: string }> {
    // First get existing records
    const existingRecords = await this.getDNSRecords(domain);
    
    console.log('Existing records before update:', existingRecords);
    
    // Filter out ALL existing A records for root domain
    // Also filter out existing www CNAME records (we'll add a proper one)
    const otherRecords = existingRecords.filter(
      (r) => !(r.host === '@' && r.type === 'A') && 
             !(r.host === 'www' && r.type === 'CNAME')
    );

    console.log('Filtered out A records for @ and www CNAME, remaining records:', otherRecords);

    // Add new A record for root domain
    const updatedRecords: DNSRecord[] = [
      {
        host: '@',
        type: 'A',
        value: ipAddress.trim(),
        ttl,
      },
      // Add CNAME for www pointing to root domain
      {
        host: 'www',
        type: 'CNAME',
        value: domain, // www.dlxstudios.ai -> dlxstudios.ai
        ttl: ttl, // Use same TTL as A record
      },
      ...otherRecords,
    ];

    console.log('Final records to send:', updatedRecords);
    console.log(`Total records: ${updatedRecords.length}`);
    console.log(`A records for @: ${updatedRecords.filter(r => r.host === '@' && r.type === 'A').length}`);
    console.log(`CNAME records for www: ${updatedRecords.filter(r => r.host === 'www' && r.type === 'CNAME').length}`);

    return this.updateDNSRecords(domain, updatedRecords);
  }

  /**
   * Clean up duplicate A records for root domain
   * Keeps only the most recent one (highest TTL or first found)
   */
  public async cleanupDuplicateARecords(
    domain: string
  ): Promise<{ success: boolean; removed: number }> {
    const existingRecords = await this.getDNSRecords(domain);
    
    // Find all A records for '@'
    const aRecords = existingRecords.filter(
      (r) => r.host === '@' && r.type === 'A'
    );
    
    if (aRecords.length <= 1) {
      // No duplicates, nothing to clean
      return { success: true, removed: 0 };
    }
    
    console.log(`Found ${aRecords.length} A records for @, cleaning up duplicates`);
    
    // Keep the first one (or you could keep the one with highest TTL)
    const keepRecord = aRecords[0];
    const otherRecords = existingRecords.filter(
      (r) => !(r.host === '@' && r.type === 'A')
    );
    
    // Add back only one A record
    const cleanedRecords: DNSRecord[] = [
      keepRecord,
      ...otherRecords,
    ];
    
    await this.updateDNSRecords(domain, cleanedRecords);
    
    return { success: true, removed: aRecords.length - 1 };
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

