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
    // Fetch categories from CoinGecko
    const response = await fetchWithTimeout(
      `${COINGECKO_BASE_URL}/coins/categories`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to match our expected format
    const categories = data.map((category: any) => ({
      id: category.category_id,
      name: category.name,
      slug: category.category_id,
      market_cap: category.market_cap,
      market_cap_change_24h: category.market_cap_change_24h,
      content: category.content,
      top_3_coins:
        category.top_3_coins?.map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          thumb: coin.thumb,
        })) || [],
    }));

    // Set caching headers (5 minutes cache for categories)
    const headers = {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Content-Type": "application/json",
    };

    return NextResponse.json(
      {
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Categories API error:", error);

    // Return cached fallback data if available
    const fallbackData = {
      success: false,
      error: "Failed to fetch categories",
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
