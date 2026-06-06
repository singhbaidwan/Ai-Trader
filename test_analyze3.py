import sys
import asyncio
from dotenv import load_dotenv
load_dotenv()
from tradingAgents.graph.trading_graph import TradingAgentsGraph
from tradingAgents.default_config import DEFAULT_CONFIG
import traceback

async def main():
    try:
        print(f"Running graph with config: {DEFAULT_CONFIG['llm_provider']}")
        ta = TradingAgentsGraph(debug=True, config=DEFAULT_CONFIG)
        ticker = "AAPL"
        trade_date_str = "2023-10-10"
        
        args = {"config": {"recursion_limit": ta.config["max_recur_limit"]}}
        init_state = ta.propagate(ticker, trade_date_str) # wait, propagate runs the whole thing
        # actually let's just run it!
        print("Final decision:", init_state[1])
            
    except Exception as e:
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
