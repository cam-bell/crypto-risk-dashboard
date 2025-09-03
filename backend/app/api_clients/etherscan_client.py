from app.api_clients.base_client import BaseAPIClient, APIResponse
from app.core.api_config import api_config


class EtherscanClient(BaseAPIClient):
    """Etherscan API client for Ethereum blockchain data"""

    def __init__(self):
        super().__init__(
            base_url=api_config.etherscan_base_url,
            api_key=api_config.etherscan_api_key,
            rate_limit=api_config.etherscan_rate_limit,
            timeout=api_config.etherscan_timeout,
        )

    async def health_check(self) -> APIResponse:
        """Check Etherscan API health"""
        params = {
            "module": "proxy",
            "action": "eth_blockNumber",
            "apikey": self.api_key,
        }
        return await self._make_request("GET", "", params=params)

    async def get_account_balance(self, address: str) -> APIResponse:
        """Get account balance for a given address"""
        params = {
            "module": "account",
            "action": "balance",
            "address": address,
            "tag": "latest",
            "apikey": self.api_key,
        }
        return await self._make_request("GET", "", params=params)

    async def get_account_transactions(
        self,
        address: str,
        start_block: int = 0,
        end_block: int = 99999999,
        page: int = 1,
        offset: int = 100,
    ) -> APIResponse:
        """Get normal transactions for an account"""
        params = {
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": start_block,
            "endblock": end_block,
            "page": page,
            "offset": offset,
            "sort": "desc",
            "apikey": self.api_key,
        }
        return await self._make_request("GET", "", params=params)

    async def get_internal_transactions(
        self,
        address: str,
        start_block: int = 0,
        end_block: int = 99999999,
        page: int = 1,
        offset: int = 100,
    ) -> APIResponse:
        """Get internal transactions for an account"""
        params = {
            "module": "account",
            "action": "txlistinternal",
            "address": address,
            "startblock": start_block,
            "endblock": end_block,
            "page": page,
            "offset": offset,
            "sort": "desc",
        }
        return await self._make_request("GET", "", params=params)

    async def get_erc20_token_transfers(
        self,
        address: str,
        contract_address: str = "",
        start_block: int = 0,
        end_block: int = 99999999,
        page: int = 1,
        offset: int = 100,
    ) -> APIResponse:
        """Get ERC-20 token transfers for an account"""
        params = {
            "module": "account",
            "action": "tokentx",
            "address": address,
            "contractaddress": contract_address,
            "startblock": start_block,
            "endblock": end_block,
            "page": page,
            "offset": offset,
            "sort": "desc",
        }
        return await self._make_request("GET", "", params=params)

    async def get_nft_transfers(
        self,
        address: str,
        contract_address: str = "",
        start_block: int = 0,
        end_block: int = 99999999,
        page: int = 1,
        offset: int = 100,
    ) -> APIResponse:
        """Get NFT transfers for an account"""
        params = {
            "module": "account",
            "action": "tokennfttx",
            "address": address,
            "contractaddress": contract_address,
            "startblock": start_block,
            "endblock": end_block,
            "page": page,
            "offset": offset,
            "sort": "desc",
        }
        return await self._make_request("GET", "", params=params)

    async def get_contract_abi(self, contract_address: str) -> APIResponse:
        """Get contract ABI for a given contract address"""
        params = {"module": "contract", "action": "getabi", "address": contract_address}
        return await self._make_request("GET", "", params=params)

    async def get_gas_estimate(self) -> APIResponse:
        """Get current gas price estimates"""
        params = {"module": "gastracker", "action": "gasoracle"}
        return await self._make_request("GET", "", params=params)

    async def get_block_info(self, block_number: str = "latest") -> APIResponse:
        """Get block information by block number"""
        params = {
            "module": "proxy",
            "action": "eth_getBlockByNumber",
            "tag": block_number,
            "boolean": "false",
        }
        return await self._make_request("GET", "", params=params)

    async def get_transaction_receipt(self, tx_hash: str) -> APIResponse:
        """Get transaction receipt by transaction hash"""
        params = {
            "module": "proxy",
            "action": "eth_getTransactionReceipt",
            "txhash": tx_hash,
        }
        return await self._make_request("GET", "", params=params)
