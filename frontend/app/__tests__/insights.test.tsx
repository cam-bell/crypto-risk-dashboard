import { render, screen } from '@testing-library/react';
import InsightsPage from '../insights/page';

// Mock the hooks
jest.mock('@/hooks/useAIInsightsHub', () => ({
  useAIInsightsHub: () => ({
    weeklyAnalysis: null,
    marketSentiment: null,
    rebalancingSuggestions: null,
    isLoading: false,
    weeklyLoading: false,
    sentimentLoading: false,
    rebalancingLoading: false,
    generateWeeklyAnalysis: jest.fn(),
    generateMarketSentiment: jest.fn(),
    generateRebalancingSuggestions: jest.fn(),
    deleteInsight: jest.fn(),
    isGeneratingWeekly: false,
    isGeneratingSentiment: false,
    isGeneratingRebalancing: false,
    isDeleting: false,
  }),
}));

jest.mock('@/hooks/usePortfolios', () => ({
  usePortfolios: () => ({
    portfolios: [
      {
        id: '1',
        name: 'Test Portfolio',
        description: 'A test portfolio',
        total_value: 10000,
        total_cost: 8000,
        total_pnl: 2000,
        total_pnl_percentage: 25,
        risk_score: 5,
        holdings: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
  }),
}));

describe('InsightsPage', () => {
  it('renders the page title and description', () => {
    render(<InsightsPage />);
    
    expect(screen.getByText('AI Insights Hub')).toBeInTheDocument();
    expect(screen.getByText(/AI-powered analysis and recommendations/)).toBeInTheDocument();
  });

  it('renders the action buttons', () => {
    render(<InsightsPage />);
    
    expect(screen.getByText('Weekly Analysis')).toBeInTheDocument();
    expect(screen.getByText('Market Sentiment')).toBeInTheDocument();
    expect(screen.getByText('Rebalancing')).toBeInTheDocument();
  });

  it('renders the insights sections', () => {
    render(<InsightsPage />);
    
    expect(screen.getByText('Weekly Analysis')).toBeInTheDocument();
    expect(screen.getByText('Market Sentiment')).toBeInTheDocument();
    expect(screen.getByText('Rebalancing Suggestions')).toBeInTheDocument();
  });

  it('renders the AI status section', () => {
    render(<InsightsPage />);
    
    expect(screen.getByText('AI Insights Engine')).toBeInTheDocument();
    expect(screen.getByText(/Our AI analyzes market data/)).toBeInTheDocument();
  });

  it('renders portfolio selection dropdown', () => {
    render(<InsightsPage />);
    
    expect(screen.getByDisplayValue('Select Portfolio')).toBeInTheDocument();
  });
});
