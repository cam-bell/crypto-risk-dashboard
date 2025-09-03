from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class CoinGeckoCoin(BaseModel):
    """Model for CoinGecko coin data"""

    id: str
    symbol: str
    name: str
    platforms: Optional[Dict[str, str]] = None
    block_time_in_minutes: Optional[int] = None
    hashing_algorithm: Optional[str] = None
    categories: Optional[List[str]] = None
    public_notice: Optional[str] = None
    additional_notices: Optional[List[str]] = None
    localization: Optional[Dict[str, str]] = None
    description: Optional[Dict[str, str]] = None
    links: Optional[Dict[str, List[str]]] = None
    image: Optional[Dict[str, str]] = None
    country_origin: Optional[str] = None
    genesis_date: Optional[str] = None
    sentiment_votes_up_percentage: Optional[float] = None
    sentiment_votes_down_percentage: Optional[float] = None
    market_cap_rank: Optional[int] = None
    coingecko_rank: Optional[int] = None
    coingecko_score: Optional[float] = None
    developer_score: Optional[float] = None
    community_score: Optional[float] = None
    liquidity_score: Optional[float] = None
    public_interest_score: Optional[float] = None
    market_data: Optional[Dict[str, Any]] = None
    community_data: Optional[Dict[str, Any]] = None
    developer_data: Optional[Dict[str, Any]] = None
    public_interest_data: Optional[Dict[str, Any]] = None
    status_updates: Optional[List[Dict[str, Any]]] = None
    last_updated: Optional[str] = None


class CoinGeckoMarketData(BaseModel):
    """Model for CoinGecko market data"""

    current_price: Optional[Dict[str, float]] = None
    total_value_locked: Optional[Dict[str, float]] = None
    mcap_to_tvl_ratio: Optional[float] = None
    fdv_to_tvl_ratio: Optional[float] = None
    roi: Optional[Dict[str, Any]] = None
    ath: Optional[Dict[str, float]] = None
    ath_change_percentage: Optional[Dict[str, float]] = None
    ath_date: Optional[Dict[str, str]] = None
    atl: Optional[Dict[str, float]] = None
    atl_change_percentage: Optional[Dict[str, float]] = None
    atl_date: Optional[Dict[str, str]] = None
    market_cap: Optional[Dict[str, float]] = None
    market_cap_rank: Optional[int] = None
    fully_diluted_valuation: Optional[Dict[str, float]] = None
    market_cap_fdv_ratio: Optional[float] = None
    total_volume: Optional[Dict[str, float]] = None
    high_24h: Optional[Dict[str, float]] = None
    low_24h: Optional[Dict[str, float]] = None
    price_change_24h: Optional[float] = None
    price_change_percentage_24h: Optional[float] = None
    price_change_percentage_7d: Optional[float] = None
    price_change_percentage_30d: Optional[float] = None
    price_change_percentage_60d: Optional[float] = None
    price_change_percentage_200d: Optional[float] = None
    price_change_percentage_1y: Optional[float] = None
    price_change_24h_in_currency: Optional[Dict[str, float]] = None
    price_change_percentage_1h_in_currency: Optional[Dict[str, float]] = None
    price_change_percentage_24h_in_currency: Optional[Dict[str, float]] = None
    price_change_percentage_7d_in_currency: Optional[Dict[str, float]] = None
    price_change_percentage_30d_in_currency: Optional[Dict[str, float]] = None
    price_change_percentage_60d_in_currency: Optional[Dict[str, float]] = None
    price_change_percentage_200d_in_currency: Optional[Dict[str, float]] = None
    price_change_percentage_1y_in_currency: Optional[Dict[str, float]] = None
    market_cap_change_24h_in_currency: Optional[Dict[str, float]] = None
    market_cap_change_percentage_24h_in_currency: Optional[Dict[str, float]] = None
    total_supply: Optional[float] = None
    max_supply: Optional[float] = None
    circulating_supply: Optional[float] = None
    last_updated: Optional[str] = None


class CoinGeckoPriceHistory(BaseModel):
    """Model for CoinGecko price history data"""

    prices: List[List[float]] = Field(description="List of [timestamp, price] pairs")
    market_caps: List[List[float]] = Field(
        description="List of [timestamp, market_cap] pairs"
    )
    total_volumes: List[List[float]] = Field(
        description="List of [timestamp, volume] pairs"
    )


class CoinGeckoTrendingCoin(BaseModel):
    """Model for CoinGecko trending coin data"""

    item: Dict[str, Any] = Field(description="Trending coin item data")


class CoinGeckoGlobalData(BaseModel):
    """Model for CoinGecko global market data"""

    active_cryptocurrencies: int
    upcoming_icos: int
    ongoing_icos: int
    ended_icos: int
    markets: int
    total_market_cap: Dict[str, float]
    total_volume: Dict[str, float]
    market_cap_percentage: Dict[str, float]
    market_cap_change_percentage_24h_usd: float
    updated_at: int


class CoinGeckoExchangeRates(BaseModel):
    """Model for CoinGecko exchange rates"""

    rates: Dict[str, Dict[str, Any]]


class CoinGeckoSearchResult(BaseModel):
    """Model for CoinGecko search results"""

    coins: List[Dict[str, Any]]
    exchanges: List[Dict[str, Any]]
    categories: List[Dict[str, Any]]
    nfts: List[Dict[str, Any]]
