from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class EtherscanTransaction(BaseModel):
    """Model for Etherscan transaction data"""
    blockNumber: str
    timeStamp: str
    hash: str
    nonce: str
    blockHash: str
    transactionIndex: str
    from_address: str = Field(alias="from")
    to_address: str = Field(alias="to")
    value: str
    gas: str
    gasPrice: str
    isError: str
    txreceipt_status: str
    input: str
    contractAddress: str
    cumulativeGasUsed: str
    gasUsed: str
    confirmations: str


class EtherscanInternalTransaction(BaseModel):
    """Model for Etherscan internal transaction data"""
    blockNumber: str
    timeStamp: str
    hash: str
    from_address: str = Field(alias="from")
    to_address: str = Field(alias="to")
    value: str
    contractAddress: str
    input: str
    type: str
    gas: str
    gasUsed: str
    traceId: str
    isError: str
    errCode: str


class EtherscanTokenTransfer(BaseModel):
    """Model for Etherscan token transfer data"""
    blockNumber: str
    timeStamp: str
    hash: str
    nonce: str
    blockHash: str
    from_address: str = Field(alias="from")
    to_address: str = Field(alias="to")
    value: str
    contractAddress: str
    tokenName: str
    tokenSymbol: str
    tokenDecimal: str
    transactionIndex: str
    gas: str
    gasPrice: str
    gasUsed: str
    cumulativeGasUsed: str
    input: str
    confirmations: str


class EtherscanNFTTransfer(BaseModel):
    """Model for Etherscan NFT transfer data"""
    blockNumber: str
    timeStamp: str
    hash: str
    nonce: str
    blockHash: str
    from_address: str = Field(alias="from")
    to_address: str = Field(alias="to")
    contractAddress: str
    tokenID: str
    tokenName: str
    tokenSymbol: str
    tokenDecimal: str
    transactionIndex: str
    gas: str
    gasPrice: str
    gasUsed: str
    cumulativeGasUsed: str
    input: str
    confirmations: str


class EtherscanGasOracle(BaseModel):
    """Model for Etherscan gas oracle data"""
    SafeLow: str
    SafeLowWait: str
    Fast: str
    FastWait: str
    Standard: str
    StandardWait: str
    Fastest: str
    FastestWait: str
    blockNum: str


class EtherscanBlock(BaseModel):
    """Model for Etherscan block data"""
    number: str
    hash: str
    parentHash: str
    nonce: str
    sha3Uncles: str
    logsBloom: str
    transactionsRoot: str
    stateRoot: str
    receiptsRoot: str
    miner: str
    difficulty: str
    totalDifficulty: str
    extraData: str
    size: str
    gasLimit: str
    gasUsed: str
    timestamp: str
    transactions: List[str]
    uncles: List[str]


class EtherscanTransactionReceipt(BaseModel):
    """Model for Etherscan transaction receipt data"""
    transactionHash: str
    transactionIndex: str
    blockHash: str
    blockNumber: str
    from_address: str = Field(alias="from")
    to_address: str = Field(alias="to")
    cumulativeGasUsed: str
    gasUsed: str
    contractAddress: Optional[str]
    logs: List[Dict[str, Any]]
    status: str
    logsBloom: str
    effectiveGasPrice: str


class EtherscanAccountBalance(BaseModel):
    """Model for Etherscan account balance response"""
    status: str
    message: str
    result: str


class EtherscanTransactionList(BaseModel):
    """Model for Etherscan transaction list response"""
    status: str
    message: str
    result: List[EtherscanTransaction]


class EtherscanInternalTransactionList(BaseModel):
    """Model for Etherscan internal transaction list response"""
    status: str
    message: str
    result: List[EtherscanInternalTransaction]


class EtherscanTokenTransferList(BaseModel):
    """Model for Etherscan token transfer list response"""
    status: str
    message: str
    result: List[EtherscanTokenTransfer]


class EtherscanNFTTransferList(BaseModel):
    """Model for Etherscan NFT transfer list response"""
    status: str
    message: str
    result: List[EtherscanNFTTransfer]


class EtherscanGasOracleResponse(BaseModel):
    """Model for Etherscan gas oracle response"""
    status: str
    message: str
    result: EtherscanGasOracle


class EtherscanBlockResponse(BaseModel):
    """Model for Etherscan block response"""
    jsonrpc: str
    id: int
    result: EtherscanBlock


class EtherscanTransactionReceiptResponse(BaseModel):
    """Model for Etherscan transaction receipt response"""
    jsonrpc: str
    id: int
    result: EtherscanTransactionReceipt
