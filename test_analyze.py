from server import _run_pipeline
import queue

q = queue.Queue()
_run_pipeline("AAPL", "2023-10-01", q)

while True:
    try:
        item = q.get_nowait()
        if item is None:
            break
        print(item)
    except queue.Empty:
        break
