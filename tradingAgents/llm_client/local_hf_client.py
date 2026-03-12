from typing import Any, Optional

from langchain_openai import ChatOpenAI

from .base_client import BaseLLMClient


class LocalHuggingFaceClient(BaseLLMClient):
    """Client for local models served by OpenAI-compatible endpoints."""

    def __init__(self, model: str, base_url: Optional[str] = None, **kwargs):
        super().__init__(model, base_url, **kwargs)

    def get_llm(self) -> Any:
        """Return configured ChatOpenAI instance for local endpoint."""
        llm_kwargs = {
            "model": self.model,
            "base_url": self.base_url or "http://127.0.0.1:11434/v1",
            "api_key": self.kwargs.get("api_key", "ollama"),
        }

        for key in ("temperature", "max_tokens", "timeout", "max_retries", "callbacks"):
            if key in self.kwargs:
                llm_kwargs[key] = self.kwargs[key]

        return ChatOpenAI(**llm_kwargs)

    def validate_model(self) -> bool:
        """Validate model identifier for local endpoint."""
        return bool(self.model and self.model.strip())
