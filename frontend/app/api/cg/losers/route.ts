import { NextRequest, NextResponse } from "next/server";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

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
        "User-Agent": "CryptoRisk-Dashboard/1.0",
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

    // Extract query parameters
    const vsCurrency = searchParams.get("vs_currency") || "usd";
    const perPage = searchParams.get("per_page") || "50";
    const page = searchParams.get("page") || "1";
    const sparkline = searchParams.get("sparkline") || "true";
    const priceChangePercentage =
      searchParams.get("price_change_percentage") || "1h,24h,7d";

    // Build query parameters for top losers (lowest 24h price change)
    const params = new URLSearchParams({
      vs_currency: vsCurrency,
      order: "price_change_percentage_24h_asc", // Ascending order for top losers
      per_page: perPage,
      page: page,
      sparkline: sparkline,
      price_change_percentage: priceChangePercentage,
    });

    const response = await fetchWithTimeout(
      `${COINGECKO_BASE_URL}/coins/markets?${params}`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to match our expected format
    const marketData = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      coingecko_id: coin.id,
      current_price_usd: coin.current_price,
      price_change_24h: coin.price_change_24h,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      volume_24h: coin.total_volume,
      circulating_supply: coin.circulating_supply,
      total_supply: coin.total_supply,
      max_supply: coin.max_supply,
      logo_url: coin.image,
      sparkline_7d: coin.sparkline_in_7d?.price || [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Set caching headers (2 minutes cache for top losers)
    const headers = {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      "Content-Type": "application/json",
    };

    return NextResponse.json(
      {
        success: true,
        data: marketData,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Top losers API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch top losers",
        data: [],
      },
      { status: 500 }
    );
  }
}
