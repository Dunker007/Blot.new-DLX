import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TokenAnalytics from '../TokenAnalytics';
import { tokenTrackingService } from '../../services/tokenTracking';
import { providerRouter } from '../../services/providerRouter';

// Mock the services
vi.mock('../../services/tokenTracking', () => ({
  tokenTrackingService: {
    getUsageStats: vi.fn(),
    getBudgetStatus: vi.fn(),
    getTopProviders: vi.fn(),
  },
}));

vi.mock('../../services/providerRouter', () => ({
  providerRouter: {
    getProviderStats: vi.fn(),
  },
}));

describe('TokenAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    (tokenTrackingService.getUsageStats as any).mockResolvedValue({
      totalTokens: 10000,
      totalCost: 0.5,
      requestCount: 50,
      avgResponseTime: 1500,
    });

    (tokenTrackingService.getBudgetStatus as any).mockResolvedValue([]);

    (tokenTrackingService.getTopProviders as any).mockResolvedValue([
      {
        provider_id: 'lmstudio',
        provider_name: 'LM Studio',
        request_count: 30,
        total_tokens: 6000,
        total_cost: 0,
      },
    ]);

    (providerRouter.getProviderStats as any).mockResolvedValue([
      {
        providerId: 'lmstudio',
        name: 'LM Studio',
        requestCount: 30,
        successRate: 0.95,
        avgLatency: 1200,
      },
    ]);
  });

  it('should render token analytics sections', async () => {
    render(<TokenAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Usage Overview (Last 30 Days)')).toBeInTheDocument();
    });
  });

  it('should fetch usage stats on mount', async () => {
    render(<TokenAnalytics />);

    await waitFor(() => {
      expect(tokenTrackingService.getUsageStats).toHaveBeenCalled();
    });
  });

  it('should fetch budget status on mount', async () => {
    render(<TokenAnalytics />);

    await waitFor(() => {
      expect(tokenTrackingService.getBudgetStatus).toHaveBeenCalled();
    });
  });

  it('should fetch top providers on mount', async () => {
    render(<TokenAnalytics />);

    await waitFor(() => {
      expect(tokenTrackingService.getTopProviders).toHaveBeenCalledWith(5);
    });
  });

  it('should fetch provider stats on mount', async () => {
    render(<TokenAnalytics />);

    await waitFor(() => {
      expect(providerRouter.getProviderStats).toHaveBeenCalled();
    });
  });

  it('should display usage statistics', async () => {
    render(<TokenAnalytics />);

    await waitFor(() => {
      expect(tokenTrackingService.getUsageStats).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Component should render without errors
    await waitFor(() => {
      expect(screen.getByText('Total Tokens')).toBeInTheDocument();
    });
  });

  it('should handle service errors gracefully', async () => {
    (tokenTrackingService.getUsageStats as any).mockRejectedValue(
      new Error('Failed to fetch stats')
    );

    render(<TokenAnalytics />);

    await waitFor(() => {
      expect(tokenTrackingService.getUsageStats).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Component should still render
    await waitFor(() => {
      expect(screen.getByText('Usage Overview (Last 30 Days)')).toBeInTheDocument();
    });
  });

  it('should display provider statistics when available', async () => {
    const mockProviders = [
      {
        provider_id: 'lmstudio',
        provider_name: 'LM Studio',
        request_count: 30,
        total_tokens: 6000,
        total_cost: 0,
      },
      {
        provider_id: 'ollama',
        provider_name: 'Ollama',
        request_count: 20,
        total_tokens: 4000,
        total_cost: 0,
      },
    ];

    (tokenTrackingService.getTopProviders as any).mockResolvedValue(mockProviders);

    render(<TokenAnalytics />);

    await waitFor(() => {
      expect(tokenTrackingService.getTopProviders).toHaveBeenCalled();
    });
  });
});

