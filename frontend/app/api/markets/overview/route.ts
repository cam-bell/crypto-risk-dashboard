import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod schemas for response validation
const GlobalDataSchema = z.object({
  market_cap_usd: z.number(),
  volume_24h_usd: z.number(),
  btc_dominance: z.number(),
  eth_dominance: z.number(),
  coins: z.number(),
  exchanges: z.number(),
  market_cap_change_24h_pct: z.number(),
});

const Top100CoinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  change_1h: z.number(),
  change_24h: z.number(),
  change_7d: z.number(),
  market_cap: z.number(),
  volume_24h: z.number(),
  circulating_supply: z.number(),
  sparkline_7d: z.array(z.number()),
});

const TrendingCoinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  score: z.number(),
});

const MarketsOverviewSchema = z.object({
  global: GlobalDataSchema,
  top100: z.array(Top100CoinSchema),
  trending: z.array(TrendingCoinSchema).optional(),
  partial: z.boolean().optional(),
});

type MarketsOverview = z.infer<typeof MarketsOverviewSchema>;

// CoinGecko API base URL
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

// Fetch with timeout using AbortController
async function fetchWithTimeout(
  url: string,
  timeoutMs: number = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Crypto-Risk-Dashboard/1.0",
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Fetch global market data
async function fetchGlobalData(): Promise<any> {
  const response = await fetchWithTimeout(`${COINGECKO_BASE_URL}/global`);
  if (!response.ok) {
    throw new Error(`Global data fetch failed: ${response.status}`);
  }
  return response.json();
}

// Fetch top 100 coins
async function fetchTop100Coins(): Promise<any> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    per_page: "100",
    order: "market_cap_desc",
    sparkline: "true",
    price_change_percentage: "1h,24h,7d",
  });

  const response = await fetchWithTimeout(
    `${COINGECKO_BASE_URL}/coins/markets?${params}`
  );
  if (!response.ok) {
    throw new Error(`Top 100 coins fetch failed: ${response.status}`);
  }
  return response.json();
}

// Fetch trending coins (optional, ignore errors)
async function fetchTrendingCoins(): Promise<any> {
  try {
    const response = await fetchWithTimeout(
      `${COINGECKO_BASE_URL}/search/trending`
    );
    if (!response.ok) {
      console.warn(`Trending coins fetch failed: ${response.status}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.warn("Trending coins fetch error:", error);
    return null;
  }
}

// Transform global data to our schema
function transformGlobalData(globalData: any): any {
  const data = globalData.data;
  return {
    market_cap_usd: data.total_market_cap?.usd || 0,
    volume_24h_usd: data.total_volume?.usd || 0,
    btc_dominance: data.market_cap_percentage?.btc || 0,
    eth_dominance: data.market_cap_percentage?.eth || 0,
    coins: data.active_cryptocurrencies || 0,
    exchanges: data.markets || 0,
    market_cap_change_24h_pct: data.market_cap_change_percentage_24h_usd || 0,
  };
}

// Transform top 100 coins data
function transformTop100Coins(coinsData: any[]): any[] {
  return coinsData.map((coin) => ({
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    image: coin.image,
    price: coin.current_price || 0,
    change_1h: coin.price_change_percentage_1h_in_currency || 0,
    change_24h: coin.price_change_percentage_24h || 0,
    change_7d: coin.price_change_percentage_7d_in_currency || 0,
    market_cap: coin.market_cap || 0,
    volume_24h: coin.total_volume || 0,
    circulating_supply: coin.circulating_supply || 0,
    sparkline_7d: coin.sparkline_in_7d?.price || [],
  }));
}

// Transform trending coins data
function transformTrendingCoins(trendingData: any): any[] {
  if (!trendingData?.coins) return [];

  return trendingData.coins.map((item: any) => ({
    id: item.item.id,
    symbol: item.item.symbol,
    name: item.item.name,
    score: item.item.score || 0,
  }));
}

export async function GET(request: NextRequest) {
  try {
    const result: MarketsOverview = {
      global: {
        market_cap_usd: 0,
        volume_24h_usd: 0,
        btc_dominance: 0,
        eth_dominance: 0,
        coins: 0,
        exchanges: 0,
        market_cap_change_24h_pct: 0,
      },
      top100: [],
      partial: false,
    };

    let hasErrors = false;

    // Fetch global data
    try {
      const globalData = await fetchGlobalData();
      result.global = transformGlobalData(globalData);
    } catch (error) {
      console.error("Error fetching global data:", error);
      hasErrors = true;
    }

    // Fetch top 100 coins
    try {
      const top100Data = await fetchTop100Coins();
      result.top100 = transformTop100Coins(top100Data);
    } catch (error) {
      console.error("Error fetching top 100 coins:", error);
      hasErrors = true;
    }

    // Fetch trending coins (optional)
    try {
      const trendingData = await fetchTrendingCoins();
      if (trendingData) {
        result.trending = transformTrendingCoins(trendingData);
      }
    } catch (error) {
      console.error("Error fetching trending coins:", error);
      // Don't set hasErrors for trending since it's optional
    }

    // Set partial flag if any required data failed
    if (hasErrors) {
      result.partial = true;
    }

    // Validate the response with zod
    const validatedResult = MarketsOverviewSchema.parse(result);

    // Set caching headers
    const headers = {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "Content-Type": "application/json",
    };

    return NextResponse.json(validatedResult, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Markets overview API error:", error);

    // Return a minimal error response
    const errorResponse = {
      global: {
        market_cap_usd: 0,
        volume_24h_usd: 0,
        btc_dominance: 0,
        eth_dominance: 0,
        coins: 0,
        exchanges: 0,
        market_cap_change_24h_pct: 0,
      },
      top100: [],
      partial: true,
      error: "Failed to fetch market data",
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
      },
    });
  }
}
