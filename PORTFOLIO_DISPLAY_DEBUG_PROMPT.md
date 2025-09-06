# Portfolio Display Debug Prompt for Cursor

## Problem Statement

The portfolio information is not displaying correctly in the frontend. Portfolios are being created but the data within them (assets, values, totals) is not showing up properly on the frontend interface.

## Diagnostic Checklist

### 1. Frontend to Database Data Flow

**Check if portfolio creation is properly saving data from frontend to database:**

- [ ] Verify the `PortfoliosList.tsx` component's `handleCreatePortfolio` function
- [ ] Check if the `createPortfolio` mutation is being called correctly
- [ ] Verify the asset ID mapping in `PortfoliosList.tsx` (lines 36-41)
- [ ] Test if `addPortfolioHolding` API calls are being made with correct parameters
- [ ] Check browser Network tab for failed API requests during portfolio creation
- [ ] Verify the API client's `createPortfolio` and `addPortfolioHolding` methods in `lib/api.ts`

**Key files to examine:**

- `frontend/components/PortfoliosList.tsx` (lines 35-108)
- `frontend/lib/api.ts` (lines 215-245, 273-279)
- `frontend/hooks/usePortfolios.ts` (lines 52-92)

### 2. Backend Data Processing and Calculations

**Check if the backend is correctly processing and calculating portfolio data:**

- [ ] Verify the portfolio creation endpoint in `backend/app/api/v1/portfolios.py` (lines 66-89)
- [ ] Check the portfolio holdings creation endpoint (lines 163-214)
- [ ] Verify the `_update_portfolio_totals` function (lines 25-48)
- [ ] Test if portfolio totals are being calculated correctly when holdings are added
- [ ] Check database schema for portfolio and portfolio_holding tables
- [ ] Verify foreign key relationships between portfolios and holdings

**Key files to examine:**

- `backend/app/api/v1/portfolios.py` (entire file)
- `backend/app/models/portfolio.py`
- `backend/app/models/portfolio_holding.py`
- `backend/app/schemas/portfolio.py`

### 3. Frontend Data Retrieval and Display

**Check if the frontend is correctly fetching and displaying portfolio data:**

- [ ] Verify the `usePortfolios` hook is fetching data correctly
- [ ] Check if the `getPortfolios` API call is returning the expected data structure
- [ ] Verify the data transformation in `api.ts` (lines 178-190)
- [ ] Check if React Query is caching and updating portfolio data properly
- [ ] Verify the portfolio display logic in `PortfoliosList.tsx` (lines 168-299)
- [ ] Check if portfolio stats calculation is working (`getPortfolioStats` function)

**Key files to examine:**

- `frontend/hooks/usePortfolios.ts` (lines 18-29, 180-200)
- `frontend/lib/api.ts` (lines 166-191)
- `frontend/components/PortfoliosList.tsx` (lines 168-299)

### 4. API Integration and Data Flow

**Check the complete data flow from frontend to backend to database:**

- [ ] Test the backend API endpoints directly with curl/Postman
- [ ] Verify the Next.js API proxy configuration in `next.config.js`
- [ ] Check if CORS is properly configured
- [ ] Verify environment variables in `.env.local`
- [ ] Test the complete flow: create portfolio → add holdings → fetch portfolios

**Test commands to run:**

```bash
# Test portfolio creation
curl -X POST "http://localhost:8000/api/v1/portfolios/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Portfolio", "description": "Test", "user_id": "6abf5032-143e-41b4-a664-bda6e193000d", "is_default": false, "is_public": false}'

# Test portfolio retrieval
curl -X GET "http://localhost:8000/api/v1/portfolios/" \
  -H "Content-Type: application/json"

# Test holding creation
curl -X POST "http://localhost:8000/api/v1/portfolios/{portfolio_id}/holdings" \
  -H "Content-Type: application/json" \
  -d '{"crypto_asset_id": "93c19608-441b-454c-af58-3d3c3846aa5d", "quantity": 0.1, "average_buy_price_usd": 45000, "notes": "Test holding"}'
```

### 5. Database State Verification

**Check the actual database state:**

- [ ] Query the portfolios table to see if portfolios are being created
- [ ] Query the portfolio_holdings table to see if holdings are being saved
- [ ] Verify the crypto_assets table has the expected assets
- [ ] Check if portfolio totals are being updated in the database

**Database queries to run:**

```sql
-- Check portfolios
SELECT id, name, total_value_usd, total_invested_usd, created_at FROM portfolios;

-- Check holdings
SELECT id, portfolio_id, crypto_asset_id, quantity, average_buy_price_usd, total_invested_usd FROM portfolio_holdings;

-- Check crypto assets
SELECT id, name, symbol FROM crypto_assets;
```

### 6. Frontend State Management

**Check React state and caching:**

- [ ] Verify React Query cache is being invalidated after portfolio creation
- [ ] Check if the portfolio list is being refetched after mutations
- [ ] Verify optimistic updates are working correctly
- [ ] Check for any console errors in browser dev tools

### 7. Asset ID Mapping Issues

**Check the asset ID mapping between frontend and backend:**

- [ ] Verify the asset ID mapping in `PortfoliosList.tsx` matches actual database UUIDs
- [ ] Check if all required crypto assets exist in the database
- [ ] Verify the mapping covers all assets used in the frontend

**Current mapping to verify:**

```javascript
const assetIdMapping = {
  bitcoin: "93c19608-441b-454c-af58-3d3c3846aa5d",
  ethereum: "3d79dad5-e930-4a17-a035-878031e68a6a",
  cardano: "158c9204-1b0e-4b78-8a39-80ba975a5759",
  ripple: "ripple", // XRP not in database yet
};
```

## Expected Behavior

1. User creates portfolio with assets
2. Portfolio is saved to database with correct totals
3. Holdings are saved with correct asset references
4. Portfolio totals are calculated and updated
5. Frontend displays portfolio with correct asset count and values
6. Portfolio list shows updated totals

## Current Issues to Investigate

- Portfolios show "0 assets" and "$0" total value
- Asset holdings are not being displayed
- Portfolio totals are not being calculated correctly
- Frontend may not be fetching updated data after creation

## Debug Steps

1. Start with backend API testing to verify data is being saved
2. Check database state to confirm data persistence
3. Verify frontend API calls are working
4. Check data transformation and display logic
5. Test the complete end-to-end flow

## Files to Focus On

- `frontend/components/PortfoliosList.tsx` - Main portfolio display component
- `frontend/lib/api.ts` - API client and data transformation
- `frontend/hooks/usePortfolios.ts` - Data fetching and state management
- `backend/app/api/v1/portfolios.py` - Backend API endpoints
- `backend/app/models/portfolio.py` - Database models
- `backend/app/schemas/portfolio.py` - API schemas

## Success Criteria

- Portfolio creation saves data to database
- Holdings are properly linked to portfolios
- Portfolio totals are calculated correctly
- Frontend displays portfolio data immediately after creation
- Portfolio list shows correct asset counts and values
