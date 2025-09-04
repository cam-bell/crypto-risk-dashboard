# Crypto Risk Dashboard Frontend

A modern, responsive React/Next.js frontend for the AI-powered crypto portfolio risk analysis dashboard.

## Features

### 🎯 Core Components

- **Portfolio Overview Dashboard** - Comprehensive portfolio metrics and allocation charts
- **Interactive Risk Heatmap** - Real-time risk visualization using Recharts
- **Portfolio Allocation Charts** - Pie/donut charts with drill-down capabilities
- **Real-time Price Tracking** - Live price updates and historical data
- **AI Insights Panel** - AI-generated portfolio analysis and recommendations
- **Alert Management** - Configurable risk and price alerts
- **Portfolio Configuration** - Easy portfolio setup and management

### 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach with tablet and desktop optimization
- **Dark/Light Theme** - Automatic theme switching with system preference detection
- **Real-time Updates** - Live data using React Query with automatic refresh
- **Loading States** - Smooth loading animations and skeleton screens
- **Error Handling** - Comprehensive error boundaries and user-friendly error messages
- **Accessibility** - WCAG 2.1 compliant with proper ARIA labels and keyboard navigation

### 📊 Data Visualization

- **Interactive Charts** - Built with Recharts for smooth animations and interactions
- **Real-time Updates** - Live data streaming with configurable refresh intervals
- **Responsive Charts** - Automatically adapt to different screen sizes
- **Custom Tooltips** - Rich information display on chart interactions

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query + Context API
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Notifications**: React Hot Toast
- **Theme**: next-themes

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and Tailwind config
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   └── providers.tsx      # Context providers
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx    # Button component
│   │   ├── Card.tsx      # Card components
│   │   ├── Input.tsx     # Input component
│   │   ├── Badge.tsx     # Badge component
│   │   └── LoadingSpinner.tsx
│   ├── Dashboard.tsx     # Main dashboard
│   ├── Header.tsx        # Navigation header
│   ├── PortfolioOverview.tsx
│   ├── RiskMetrics.tsx   # Risk analysis
│   └── AIInsights.tsx    # AI insights
├── contexts/             # React contexts
│   ├── PortfolioContext.tsx
│   └── ThemeContext.tsx
├── hooks/                # Custom React hooks
│   ├── usePortfolios.ts
│   ├── useRiskMetrics.ts
│   ├── useAIInsights.ts
│   └── useCryptoAssets.ts
├── lib/                  # Utility functions
│   ├── api.ts           # API client
│   └── utils.ts         # Helper functions
├── types/                # TypeScript type definitions
│   └── index.ts
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend README)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd crypto-risk-dashboard/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Next.js rules
- **Prettier**: Automatic code formatting
- **Tailwind**: Utility-first CSS approach

### Component Guidelines

- Use TypeScript interfaces for all props
- Implement proper error boundaries
- Add loading states for async operations
- Use semantic HTML elements
- Ensure accessibility compliance

## API Integration

The frontend integrates with the backend API through:

- **RESTful endpoints** for portfolio management
- **WebSocket connections** for real-time updates
- **JWT authentication** for secure access
- **Rate limiting** and error handling

### Key API Endpoints

- `GET /api/v1/portfolios` - Fetch user portfolios
- `GET /api/v1/portfolios/{id}/risk-metrics` - Get risk analysis
- `GET /api/v1/portfolios/{id}/ai-insights` - Get AI insights
- `GET /api/v1/crypto-assets` - Get market data

## State Management

### React Query

- **Server state management** for API data
- **Automatic caching** and background updates
- **Optimistic updates** for better UX
- **Error handling** and retry logic

### Context API

- **Portfolio state** across components
- **Theme preferences** and user settings
- **Global UI state** management

## Performance Features

- **Code splitting** with Next.js dynamic imports
- **Image optimization** with Next.js Image component
- **Lazy loading** for non-critical components
- **Memoization** for expensive calculations
- **Debounced search** and input handling

## Testing

### Test Structure

- **Unit tests** for utility functions
- **Component tests** with React Testing Library
- **Integration tests** for API interactions
- **E2E tests** with Playwright (planned)

### Running Tests

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- `NEXT_PUBLIC_APP_ENV` - Environment (development/production)

### Docker Support

```bash
docker build -t crypto-dashboard-frontend .
docker run -p 3000:3000 crypto-dashboard-frontend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Workflow

- Follow the existing code style
- Add TypeScript types for new features
- Update documentation as needed
- Ensure all tests pass

## Troubleshooting

### Common Issues

**Build Errors**

- Clear `.next` folder and reinstall dependencies
- Check TypeScript configuration
- Verify all imports are correct

**API Connection Issues**

- Verify backend is running
- Check environment variables
- Test API endpoints directly

**Performance Issues**

- Check React Query cache settings
- Optimize component re-renders
- Use React DevTools Profiler

## Support

For issues and questions:

- Check existing GitHub issues
- Review the documentation
- Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.
