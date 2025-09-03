from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class AlphaVantageExchangeRate(BaseModel):
    """Model for Alpha Vantage exchange rate data"""
    From_Currency_Code: str
    From_Currency_Name: str
    To_Currency_Code: str
    To_Currency_Name: str
    Exchange_Rate: str
    Last_Refreshed: str
    Time_Zone: str
    Bid_Price: Optional[str] = None
    Ask_Price: Optional[str] = None


class AlphaVantageExchangeRateResponse(BaseModel):
    """Model for Alpha Vantage exchange rate response"""
    Realtime_Currency_Exchange_Rate: AlphaVantageExchangeRate


class AlphaVantageCryptoDaily(BaseModel):
    """Model for Alpha Vantage daily cryptocurrency data"""
    Time_Series__Digital_Currency_Daily: Dict[str, Dict[str, str]]
    Meta_Data: Dict[str, str]


class AlphaVantageCryptoIntraday(BaseModel):
    """Model for Alpha Vantage intraday cryptocurrency data"""
    Time_Series__Digital_Currency_Intraday: Dict[str, Dict[str, str]]
    Meta_Data: Dict[str, str]


class AlphaVantageEconomicIndicator(BaseModel):
    """Model for Alpha Vantage economic indicator data"""
    name: str
    interval: str
    unit: str
    data: List[Dict[str, str]]


class AlphaVantageSectorPerformance(BaseModel):
    """Model for Alpha Vantage sector performance data"""
    Rank_A__Real_Time_Performance: str
    Rank_B__1_Day_Performance: str
    Rank_C__5_Day_Performance: str
    Rank_D__1_Month_Performance: str
    Rank_E__3_Month_Performance: str
    Rank_F__YTD_Performance: str
    Rank_G__1_Year_Performance: str
    Rank_H__3_Year_Performance: str
    Rank_I__5_Year_Performance: str
    Rank_J__10_Year_Performance: str


class AlphaVantageSectorPerformanceResponse(BaseModel):
    """Model for Alpha Vantage sector performance response"""
    Meta_Data: Dict[str, str]
    Rank_A__Real_Time_Performance: Dict[str, str]
    Rank_B__1_Day_Performance: Dict[str, str]
    Rank_C__5_Day_Performance: Dict[str, str]
    Rank_D__1_Month_Performance: Dict[str, str]
    Rank_E__3_Month_Performance: Dict[str, str]
    Rank_F__YTD_Performance: Dict[str, str]
    Rank_G__1_Year_Performance: Dict[str, str]
    Rank_H__3_Year_Performance: Dict[str, str]
    Rank_I__5_Year_Performance: Dict[str, str]
    Rank_J__10_Year_Performance: Dict[str, str]


class AlphaVantageNewsSentiment(BaseModel):
    """Model for Alpha Vantage news sentiment data"""
    title: str
    url: str
    time_published: str
    authors: List[str]
    summary: str
    banner_image: Optional[str] = None
    source: str
    category_within_source: str
    source_domain: str
    topics: List[Dict[str, Any]]
    overall_sentiment_score: float
    overall_sentiment_label: str
    ticker_sentiment: List[Dict[str, Any]]


class AlphaVantageNewsSentimentResponse(BaseModel):
    """Model for Alpha Vantage news sentiment response"""
    items: str
    sentiment_score_definition: str
    relevance_score_definition: str
    feed: List[AlphaVantageNewsSentiment]


class AlphaVantageTimeSeriesIntraday(BaseModel):
    """Model for Alpha Vantage time series intraday data"""
    Meta_Data: Dict[str, str]
    Time_Series__1min: Dict[str, Dict[str, str]]


class AlphaVantageErrorResponse(BaseModel):
    """Model for Alpha Vantage error response"""
    Error_Message: str
