import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Settings from '../Settings';

// Mock the supabase module
vi.mock('../../lib/supabase', () => ({
  isDemoMode: false,
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render settings title', () => {
    render(<Settings />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should display provider configuration section', () => {
    render(<Settings />);
    expect(screen.getByText('LLM Providers')).toBeInTheDocument();
  });

  it('should display models section', () => {
    render(<Settings />);
    expect(screen.getByText('Models')).toBeInTheDocument();
  });
});

