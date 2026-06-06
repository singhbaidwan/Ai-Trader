from server import _current_config, _run_pipeline
import queue

print("INITIAL CONFIG:", _current_config.get("llm_provider"))
