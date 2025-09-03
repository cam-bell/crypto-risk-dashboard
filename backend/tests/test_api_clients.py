import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from app.api_clients.coingecko_client import CoinGeckoClient
from app.api_clients.etherscan_client import EtherscanClient
from app.api_clients.alphavantage_client import AlphaVantageClient
from app.api_clients.base_client import APIResponse


class TestCoinGeckoClient:
    """Test CoinGecko API client"""
    
    @pytest.fixture
    def client(self):
        return CoinGeckoClient()
    
    @pytest.mark.asyncio
    async def test_health_check(self, client):
        """Test health check endpoint"""
        with patch.object(client, '_make_request') as mock_request:
            mock_response = APIResponse(success=True, data={"gecko_says": "V3 API is running"})
            mock_request.return_value = mock_response
            
            result = await client.health_check()
            
            assert result.success is True
            assert result.data["gecko_says"] == "V3 API is running"
            mock_request.assert_called_once_with("GET", "ping")
    
    @pytest.mark.asyncio
    async def test_get_coin_price(self, client):
        """Test getting coin price"""
        with patch.object(client, '_make_request') as mock_request:
            mock_response = APIResponse(
                success=True, 
                data={"bitcoin": {"usd": 50000}}
            )
            mock_request.return_value = mock_response
            
            result = await client.get_coin_price(["bitcoin"], ["usd"])
            
            assert result.success is True
            assert result.data["bitcoin"]["usd"] == 50000
            mock_request.assert_called_once_with(
                "GET", "simple/price", 
                {"ids": ["bitcoin"], "vs_currencies": ["usd"]}
            )
    
    @pytest.mark.asyncio
    async def test_get_coin_market_data(self, client):
        """Test getting market data"""
        with patch.object(client, '_make_request') as mock_request:
            mock_response = APIResponse(
                success=True, 
                data=[{"id": "bitcoin", "name": "Bitcoin", "current_price": 50000}]
            )
            mock_request.return_value = mock_response
            
            result = await client.get_coin_market_data(["bitcoin"])
            
            assert result.success is True
            assert len(result.data) == 1
            assert result.data[0]["id"] == "bitcoin"
    
    @pytest.mark.asyncio
    async def test_get_coin_detail(self, client):
        """Test getting coin details"""
        with patch.object(client, '_make_request') as mock_request:
            mock_response = APIResponse(
                success=True, 
                data={"id": "bitcoin", "name": "Bitcoin", "symbol": "btc"}
            )
            mock_request.return_value = mock_response
            
            result = await client.get_coin_detail("bitcoin")
            
            assert result.success is True
            assert result.data["id"] == "bitcoin"
            assert result.data["name"] == "Bitcoin"


class TestEtherscanClient:
    """Test Etherscan API client"""
    
    @pytest.fixture
    def client(self):
        return EtherscanClient()
    
    @pytest.mark.asyncio
    async def test_health_check(self, client):
        """Test health check endpoint"""
        with patch.object(client, '_make_request') as mock_request:
            mock_response = APIResponse(success=True, data={"result": "0x12345"})
            mock_request.return_value = mock_response
            
            result = await client.health_check()
            
            assert result.success is True
            mock_request.assert_called_once_with("GET", "", {"module": "proxy", "action": "eth_blockNumber"})
    
    @pytest.mark.asyncio
    async def test_get_account_balance(self, client):
        """Test getting account balance"""
        with patch.object(client, '_make_request') as mock_request:
            mock_response = APIResponse(
                success=True, 
                data={"status": "1", "result": "1000000000000000000"}
            )
            mock_request.return_value = mock_response
            
            result = await client.get_account_balance("0x123")
            
            assert result.success is True
            mock_request.assert_called_once_with(
                "GET", "", 
                {"module": "account", "action": "balance", "address": "0x123", "tag": "latest"}
            )
    
    @pytest.mark.asyncio
    async def test_get_account_transactions(self, client):
        """Test getting account transactions"""
        with patch.object(client, '_make_request') as mock_request:
            mock_response = APIResponse(
                success=True, 
                data={"status": "1", "result": []}
            )
            mock_request.return_value = mock_response
            
            result = await client.get_account_transactions("0x123")
            
            assert result.success is True
            mock_request.assert_called_once_with(
                "GET", "", 
                {"module": "account", "action": "txlist", "address": "0x123", 
                 "startblock": 0, "endblock": 99999999, "page": 1, "offset": 100, "sort": "desc"}
            )


class TestAlphaVantageClient:
    """Test Alpha Vantage API client"""
    
    @pytest.fixture
    def client(self):
        return AlphaVantageClient()
    
    @pytest.mark.asyncio
    async def test_health_check(self, client):
        """Test health check endpoint"""
        with patch.object(client, '_make_request') as mock_request:
            mock_response = APIResponse(
                success=True, 
                data={"Meta Data": {"1. Information": "Intraday (1min) open, high, low, close prices and volume"}}
            )
            mock_request.return_value = mock_response
            
            result = await client.health_check()
            
            assert result.success is True
            mock_request.assert_called_once_with(
                "GET", "", 
                {"function": "TIME_SERIES_INTRADAY", "symbol": "AAPL", 
                 "interval": "1min", "apikey": client.api_key}
            )
    
    @pytest.mark.asyncio
    async def test_get_crypto_price(self, client):
        """Test getting crypto price"""
        with patch.object(client, '_make_request') as mock_request:
            mock_response = APIResponse(
                success=True, 
                data={"Realtime_Currency_Exchange_Rate": {"5. Exchange Rate": "50000"}}
            )
            mock_request.return_value = mock_response
            
            result = await client.get_crypto_price("BTC", "USD")
            
            assert result.success is True
            mock_request.assert_called_once_with(
                "GET", "", 
                {"function": "CURRENCY_EXCHANGE_RATE", "from_currency": "BTC", 
                 "to_currency": "USD", "apikey": client.api_key}
            )
    
    @pytest.mark.asyncio
    async def test_get_crypto_daily(self, client):
        """Test getting daily crypto data"""
        with patch.object(client, '_make_request') as mock_request:
            mock_response = APIResponse(
                success=True, 
                data={"Meta Data": {"1. Information": "Daily Prices and Volumes"}}
            )
            mock_request.return_value = mock_response
            
            result = await client.get_crypto_daily("BTC", "USD")
            
            assert result.success is True
            mock_request.assert_called_once_with(
                "GET", "", 
                {"function": "DIGITAL_CURRENCY_DAILY", "symbol": "BTC", 
                 "market": "USD", "apikey": client.api_key}
            )


class TestBaseAPIClient:
    """Test base API client functionality"""
    
    @pytest.fixture
    def client(self):
        from app.api_clients.base_client import BaseAPIClient
        
        class TestClient(BaseAPIClient):
            async def health_check(self):
                return await self._make_request("GET", "test")
        
        return TestClient("https://api.test.com", "test_key", 1, 30)
    
    @pytest.mark.asyncio
    async def test_context_manager(self, client):
        """Test async context manager"""
        async with client as c:
            assert c.client is not None
            assert c.client.timeout == 30
        
        assert client.client is None
    
    @pytest.mark.asyncio
    async def test_rate_limiting(self, client):
        """Test rate limiting functionality"""
        import time
        
        start_time = time.time()
        
        # First call should not wait
        await client.rate_limiter.wait_if_needed()
        first_call_time = time.time()
        
        # Second call should wait
        await client.rate_limiter.wait_if_needed()
        second_call_time = time.time()
        
        # Should have waited at least 1 second (1 call per second rate limit)
        assert second_call_time - first_call_time >= 0.9
    
    def test_generate_cache_key(self, client):
        """Test cache key generation"""
        key = client._generate_cache_key("test", "endpoint", {"param": "value"})
        assert "test" in key
        assert "endpoint" in key
        assert "param" in key


class TestAPIResponse:
    """Test API response wrapper"""
    
    def test_successful_response(self):
        """Test successful API response"""
        response = APIResponse(
            success=True,
            data={"test": "data"},
            status_code=200
        )
        
        assert response.success is True
        assert response.data["test"] == "data"
        assert response.status_code == 200
        assert response.error is None
    
    def test_error_response(self):
        """Test error API response"""
        response = APIResponse(
            success=False,
            error="API error occurred",
            status_code=500
        )
        
        assert response.success is False
        assert response.error == "API error occurred"
        assert response.status_code == 500
        assert response.data is None
    
    def test_cached_response(self):
        """Test cached API response"""
        response = APIResponse(
            success=True,
            data={"cached": "data"},
            cached=True
        )
        
        assert response.cached is True
        assert response.success is True


if __name__ == "__main__":
    pytest.main([__file__])
