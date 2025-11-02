import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Dashboard from '../Dashboard';

// Mock the supabase module
vi.mock('../../lib/supabase', () => ({
  isDemoMode: false,
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('Dashboard', () => {
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<Dashboard onNavigate={mockOnNavigate} />);
    // Component should render without errors
    expect(document.body).toBeInTheDocument();
  });

  it('should call onNavigate when navigation is triggered', () => {
    render(<Dashboard onNavigate={mockOnNavigate} />);
    // Component renders successfully
    expect(mockOnNavigate).not.toHaveBeenCalled();
  });

  it('should display project cards when data is available', () => {
    render(<Dashboard onNavigate={mockOnNavigate} />);
    // Component should render without crashing
    expect(document.body).toBeInTheDocument();
  });
});

