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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter 'q' is required",
          data: [],
        },
        { status: 400 }
      );
    }

    // Fetch search results from CoinGecko
    const response = await fetchWithTimeout(
      `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query.trim())}`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to match our expected format
    const searchResults =
      data.coins?.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        thumb: coin.thumb,
        market_cap_rank: coin.market_cap_rank,
      })) || [];

    // Set caching headers (1 minute cache for search results)
    const headers = {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "Content-Type": "application/json",
    };

    return NextResponse.json(
      {
        success: true,
        data: searchResults,
        query,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Search API error:", error);

    // Return cached fallback data if available
    const fallbackData = {
      success: false,
      error: "Failed to search assets",
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
