import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  try {
    // Fetch trending coins from CoinGecko
    const response = await fetchWithTimeout(
      `${COINGECKO_BASE_URL}/search/trending`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to match our expected format
    const trendingCoins =
      data.coins?.map((item: any) => ({
        id: item.item.id,
        symbol: item.item.symbol,
        name: item.item.name,
        score: item.item.score || 0,
        thumb: item.item.thumb,
        market_cap_rank: item.item.market_cap_rank,
      })) || [];

    // Set caching headers (5 minutes cache)
    const headers = {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Content-Type": "application/json",
    };

    return NextResponse.json(
      {
        success: true,
        data: trendingCoins,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Trending coins API error:", error);

    // Return cached fallback data if available
    const fallbackData = {
      success: false,
      error: "Failed to fetch trending coins",
      data: [],
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(fallbackData, {
      status: 500,
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
      },
    });
  }
}
