import { NextRequest } from "next/server";
import { GET } from "../route";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("/api/markets/overview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return normalized JSON with proper structure", async () => {
    // Mock CoinGecko API responses
    const mockGlobalData = {
      data: {
        total_market_cap: { usd: 3880763323715.0083 },
        total_volume: { usd: 123456789012.34 },
        market_cap_percentage: {
          btc: 45.2,
          eth: 18.5,
        },
        active_cryptocurrencies: 8500,
        markets: 500,
        market_cap_change_percentage_24h_usd: 2.5,
      },
    };

    const mockTop100Data = [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://example.com/btc.png",
        current_price: 45000,
        price_change_percentage_1h_in_currency: 0.5,
        price_change_percentage_24h: 2.1,
        price_change_percentage_7d_in_currency: -1.2,
        market_cap: 850000000000,
        total_volume: 25000000000,
        circulating_supply: 19500000,
        sparkline_in_7d: {
          price: [44000, 44500, 45000, 44800, 45200, 45000, 45000],
        },
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        image: "https://example.com/eth.png",
        current_price: 3000,
        price_change_percentage_1h_in_currency: -0.2,
        price_change_percentage_24h: 1.8,
        price_change_percentage_7d_in_currency: 0.5,
        market_cap: 360000000000,
        total_volume: 15000000000,
        circulating_supply: 120000000,
        sparkline_in_7d: { price: [2950, 2980, 3000, 3020, 3010, 3000, 3000] },
      },
    ];

    const mockTrendingData = {
      coins: [
        {
          item: {
            id: "bitcoin",
            symbol: "btc",
            name: "Bitcoin",
            score: 1,
          },
        },
        {
          item: {
            id: "ethereum",
            symbol: "eth",
            name: "Ethereum",
            score: 2,
          },
        },
      ],
    };

    // Mock fetch responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGlobalData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTop100Data),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendingData),
      });

    const request = new NextRequest(
      "http://localhost:3000/api/markets/overview"
    );
    const response = await GET(request);
    const data = await response.json();

    // Assert response structure
    expect(data).toHaveProperty("global");
    expect(data).toHaveProperty("top100");
    expect(data).toHaveProperty("trending");

    // Assert global data structure
    expect(data.global).toHaveProperty("market_cap_usd");
    expect(data.global).toHaveProperty("volume_24h_usd");
    expect(data.global).toHaveProperty("btc_dominance");
    expect(data.global).toHaveProperty("eth_dominance");
    expect(data.global).toHaveProperty("coins");
    expect(data.global).toHaveProperty("exchanges");
    expect(data.global).toHaveProperty("market_cap_change_24h_pct");

    // Assert top100 data structure
    expect(Array.isArray(data.top100)).toBe(true);
    expect(data.top100.length).toBe(2);

    const firstCoin = data.top100[0];
    expect(firstCoin).toHaveProperty("id");
    expect(firstCoin).toHaveProperty("symbol");
    expect(firstCoin).toHaveProperty("name");
    expect(firstCoin).toHaveProperty("image");
    expect(firstCoin).toHaveProperty("price");
    expect(firstCoin).toHaveProperty("change_1h");
    expect(firstCoin).toHaveProperty("change_24h");
    expect(firstCoin).toHaveProperty("change_7d");
    expect(firstCoin).toHaveProperty("market_cap");
    expect(firstCoin).toHaveProperty("volume_24h");
    expect(firstCoin).toHaveProperty("circulating_supply");
    expect(firstCoin).toHaveProperty("sparkline_7d");

    // Assert trending data structure
    expect(Array.isArray(data.trending)).toBe(true);
    expect(data.trending.length).toBe(2);

    const firstTrending = data.trending[0];
    expect(firstTrending).toHaveProperty("id");
    expect(firstTrending).toHaveProperty("symbol");
    expect(firstTrending).toHaveProperty("name");
    expect(firstTrending).toHaveProperty("score");

    // Assert data values
    expect(data.global.market_cap_usd).toBe(3880763323715.0083);
    expect(data.global.btc_dominance).toBe(45.2);
    expect(data.global.eth_dominance).toBe(18.5);
    expect(data.top100[0].price).toBe(45000);
    expect(data.top100[0].change_24h).toBe(2.1);
  });

  it("should set proper cache headers", async () => {
    // Mock successful responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/markets/overview"
    );
    const response = await GET(request);

    // Assert cache headers
    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=60, stale-while-revalidate=300"
    );
  });

  it("should handle partial data when trending API fails", async () => {
    // Mock responses - trending API fails
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockRejectedValueOnce(new Error("Rate limited"));

    const request = new NextRequest(
      "http://localhost:3000/api/markets/overview"
    );
    const response = await GET(request);
    const data = await response.json();

    // Should still return data with partial flag
    expect(data).toHaveProperty("partial", true);
    expect(data).toHaveProperty("global");
    expect(data).toHaveProperty("top100");
    expect(data).toHaveProperty("trending");
    expect(Array.isArray(data.trending)).toBe(true);
  });

  it("should handle complete API failure gracefully", async () => {
    // Mock all API calls to fail
    mockFetch.mockRejectedValue(new Error("Network error"));

    const request = new NextRequest(
      "http://localhost:3000/api/markets/overview"
    );
    const response = await GET(request);
    const data = await response.json();

    // Should return fallback data with partial flag
    expect(data).toHaveProperty("partial", true);
    expect(data.global.market_cap_usd).toBe(0);
    expect(Array.isArray(data.top100)).toBe(true);
    expect(data.top100.length).toBe(0);
    expect(Array.isArray(data.trending)).toBe(true);
    expect(data.trending.length).toBe(0);
  });

  it("should return 200 status code", async () => {
    // Mock successful responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/markets/overview"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it("should call CoinGecko APIs with correct URLs", async () => {
    // Mock successful responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/markets/overview"
    );
    await GET(request);

    // Verify API calls
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.coingecko.com/api/v3/global",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=100&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.coingecko.com/api/v3/search/trending",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
  });
});
