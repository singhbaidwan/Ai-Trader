from langchain_core.tools import tool
from typing import Annotated


@tool
def get_stock_data(symbol: Annotated[str, "The stock ticker symbol, e.g., AAPL for Apple Inc."],
                   start_date: Annotated[str, "Start date in yyyy-mm-dd format"], end_date: Annotated[str, "End date in yyyy-mm-dd format"]) -> str:
    """
    Fetches the latest stock data for the given symbol.

    Args:
        symbol (str): The stock ticker symbol.
        start_date (str): Start date in yyyy-mm-dd format.
        end_date (str): End date in yyyy-mm-dd format.

    Returns:
        str: A formatted dataframe containing the stock price data for the specified ticker symbol in the specified date range.
    """
    
    raise NotImplementedError("get_stock_data function is not yet implemented.")

