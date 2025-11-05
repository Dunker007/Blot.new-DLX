/**
 * Spaceship DNS Manager
 * Automated DNS management for dlxstudios.ai via Spaceship API
 */

import React, { useState, useEffect } from 'react';
import { Network, RefreshCw, Save, AlertCircle, CheckCircle, Key, Loader2 } from 'lucide-react';
import { spaceshipAPI } from '../services/spaceshipApi';
import { HolographicCard } from './HolographicCard';
import { CompactSection } from './CompactSection';

interface DNSRecord {
  host: string;
  type: string;
  value: string;
  ttl: number;
}

const SpaceshipDNSManager: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [domain] = useState('dlxstudios.ai');
  const [newIP, setNewIP] = useState('');

  useEffect(() => {
    setIsConfigured(spaceshipAPI.isConfigured());
    if (spaceshipAPI.isConfigured()) {
      loadDNSRecords();
    }
  }, []);

  const handleSaveCredentials = () => {
    if (spaceshipAPI.setCredentials(apiKey, apiSecret)) {
      setIsConfigured(true);
      setSuccess('API credentials saved successfully!');
      setError(null);
      loadDNSRecords();
    } else {
      setError('Failed to save credentials');
    }
  };

  const loadDNSRecords = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const dnsRecords = await spaceshipAPI.getDNSRecords(domain);
      setRecords(dnsRecords);
      
      // Find current A record IP
      const aRecord = dnsRecords.find(r => r.host === '@' && r.type === 'A');
      if (aRecord) {
        setNewIP(aRecord.value);
      }
      
      if (dnsRecords.length === 0) {
        setError('No DNS records found. Domain may not be configured in Spaceship.');
      }
    } catch (err: any) {
      console.error('DNS Manager Error:', err);
      const errorMessage = err.message || 'Failed to load DNS records';
      setError(errorMessage);
      
      // Check if it's an authentication error
      if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('not configured')) {
        setError('API credentials invalid or not configured. Please check your API key and secret.');
        setIsConfigured(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateARecord = async () => {
    if (!newIP) {
      setError('Please enter an IP address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await spaceshipAPI.updateARecord(domain, newIP, 300);
      
      if (result.operationId) {
        setSuccess(`DNS update initiated! Operation ID: ${result.operationId}`);
        // Wait a moment then reload records
        setTimeout(() => {
          loadDNSRecords();
        }, 2000);
      } else {
        setSuccess('DNS record updated successfully!');
        loadDNSRecords();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update DNS record');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPublicIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setNewIP(data.ip);
    } catch (err) {
      setError('Failed to fetch public IP');
    }
  };

  if (!isConfigured) {
    return (
      <div className="space-y-3">
        <CompactSection title="Spaceship API Configuration" card glow="cyan">
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">
                API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Your Spaceship API Key"
                className="w-full px-2 py-1.5 bg-[rgba(0,255,255,0.1)] border border-[rgba(0,255,255,0.3)] rounded text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">
                API Secret
              </label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Your Spaceship API Secret"
                className="w-full px-2 py-1.5 bg-[rgba(0,255,255,0.1)] border border-[rgba(0,255,255,0.3)] rounded text-xs text-white"
              />
            </div>
            <div className="text-[9px] text-gray-500">
              Get your API key from{' '}
              <a
                href="https://www.spaceship.com/application/api-manager/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                Spaceship API Manager
              </a>
            </div>
            <button
              onClick={handleSaveCredentials}
              disabled={!apiKey || !apiSecret}
              className="w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Key className="w-3 h-3" />
              Save Credentials
            </button>
          </div>
        </CompactSection>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Current DNS Records */}
      <CompactSection title={`DNS Records for ${domain}`} card glow="cyan">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              loadDNSRecords();
            }}
            disabled={loading}
            type="button"
            className="flex items-center gap-1.5 px-2 py-1 bg-[rgba(0,255,255,0.1)] hover:bg-[rgba(0,255,255,0.2)] border border-[rgba(0,255,255,0.3)] rounded text-xs text-cyan-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-2 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400 flex items-center gap-2">
            <CheckCircle className="w-3 h-3" />
            {success}
          </div>
        )}

        {loading && !records.length ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="space-y-1">
            {records.map((record, index) => (
              <HolographicCard key={index} glow="none" compact className="border-[rgba(0,255,255,0.2)]">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {record.host === '@' ? domain : `${record.host}.${domain}`}
                    </span>
                    <span className="text-gray-500">{record.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 font-mono">{record.value}</div>
                    <div className="text-gray-600">TTL: {record.ttl}s</div>
                  </div>
                </div>
              </HolographicCard>
            ))}
          </div>
        )}
      </CompactSection>

      {/* Update A Record */}
      <CompactSection title="Update A Record" card glow="magenta">
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-400 uppercase mb-1">
              IP Address
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                placeholder="74.208.170.210"
                className="flex-1 px-2 py-1.5 bg-[rgba(255,0,255,0.1)] border border-[rgba(255,0,255,0.3)] rounded text-xs text-white font-mono"
              />
              <button
                onClick={getCurrentPublicIP}
                className="px-2 py-1.5 bg-[rgba(255,0,255,0.1)] hover:bg-[rgba(255,0,255,0.2)] border border-[rgba(255,0,255,0.3)] rounded text-xs text-magenta-400 transition-colors"
                title="Get current public IP"
              >
                <Network className="w-3 h-3" />
              </button>
            </div>
          </div>
          <button
            onClick={updateARecord}
            disabled={loading || !newIP}
            className="w-full px-3 py-2 bg-magenta-600 hover:bg-magenta-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                Update DNS Record
              </>
            )}
          </button>
          <p className="text-[9px] text-gray-500">
            This will update the A record for {domain} to point to the specified IP address.
            DNS propagation typically takes 5-15 minutes.
          </p>
        </div>
      </CompactSection>
    </div>
  );
};

export default SpaceshipDNSManager;

