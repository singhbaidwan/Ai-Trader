from langchain_core.messages import AIMessage
import time
import json
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI


def create_bull_researcher(llm, memory):
    def bull_node(state) ->dict:
        investment_debate_state = state["investment_debate_state"]
        history = investment_debate_state.get("history", "")
        bull_history = investment_debate_state.get("bull_history", "")
        current_response = investment_debate_state.get("current_response", "")
        market_research_report = state["market_report"]
        sentiment_report = state["sentiment_report"]
        news_report = state["news_report"]
        fundamentals_report = state["fundamentals_report"]
        curr_situation = f"{market_research_report}\n\n{sentiment_report}\n\n{news_report}\n\n{fundamentals_report}"
        past_memories = memory.get_memories(curr_situation, n_matches=2)
        past_memory_str = ""
        for i, rec in enumerate(past_memories, 1):
            past_memory_str += rec["recommendation"] + "\n\n"
        prompt = f"""You are a Bull Analyst advocating for investing in the stock. Your task is to build a strong, evidence-based case emphasizing growth potential, competitive advantages, and positive market indicators. Leverage the provided research and data to address concerns and counter bearish arguments effectively.

Key points to focus on:
- Growth Potential: Highlight the company's market opportunities, revenue projections, and scalability.
- Competitive Advantages: Emphasize factors like unique products, strong branding, or dominant market positioning.
- Positive Indicators: Use financial health, industry trends, and recent positive news as evidence.
- Bear Counterpoints: Critically analyze the bear argument with specific data and sound reasoning, addressing concerns thoroughly and showing why the bull perspective holds stronger merit.
- Engagement: Present your argument in a conversational style, engaging directly with the bear analyst's points and debating effectively rather than just listing data.

Resources available:
Market research report: {market_research_report}
Social media sentiment report: {sentiment_report}
Latest world affairs news: {news_report}
Company fundamentals report: {fundamentals_report}
Conversation history of the debate: {history}
Last bear argument: {current_response}
Reflections from similar situations and lessons learned: {past_memory_str}
Use this information to deliver a compelling bull argument, refute the bear's concerns, and engage in a dynamic debate that demonstrates the strengths of the bull position. You must also address reflections and learn from lessons and mistakes you made in the past.
"""     
        response = llm.invoke(prompt)
        argument = f"Bull Analyst: {response.content}"
        new_investment_debate_state = {
            "history": history + "\n" + argument,
            "bull_history": bull_history + "\n" + argument,
            "bear_history": investment_debate_state.get("bear_history", ""),
            "current_response": argument,
            "count": investment_debate_state["count"] + 1,
        }
        return {"investment_debate_state": new_investment_debate_state}
    return bull_node

class SimpleMemory:
    def __init__(self):
        self.records = []

    def add_memory(self, situation, recommendation):
        self.records.append({
            "situation": situation,
            "recommendation": recommendation
        })

    def get_memories(self, curr_situation, n_matches=2):
        return self.records[-n_matches:]

# if __name__ == "__main__":
#     load_dotenv()
#     # os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
#     # genai.configure(api_key=GOOGLE_API_KEY)

#     llm = ChatGoogleGenerativeAI(
#     model="gemini-2.5-flash",
#     temperature=0,
#     max_tokens=None,
#     timeout=None,
#     max_retries=2,
#     # other params...
#     )


#     # Memory
#     memory = SimpleMemory()
#     memory.add_memory("previous example", "Buy on dips due to strong fundamentals.")

#     # Build agent
#     bull_agent = create_bull_researcher(llm, memory)

#     # Example initial state
#     state = {
#         "market_report": "Market is trending upward due to strong earnings.",
#         "sentiment_report": "Social media sentiment is very positive.",
#         "news_report": "Company announces new AI product.",
#         "fundamentals_report": "Strong balance sheet and growing revenue.",
#         "investment_debate_state": {
#             "history": "",
#             "bull_history": "",
#             "bear_history": "",
#             "current_response": "Bear says valuation is too high.",
#             "count": 0,
#         }
#     }

#     # Run bull agent turn
#     result = bull_agent(state)

#     print("\n===== Bull Analyst Output =====\n")
#     print(result["investment_debate_state"]["current_response"])

#     print("\n===== Full Updated State =====\n")
#     print(json.dumps(result, indent=2))
