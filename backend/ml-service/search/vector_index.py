import faiss
import numpy as np

_index = None
_id_map = []
_dimension = 384


def get_index():
    global _index
    if _index is None:
        _index = faiss.IndexFlatIP(_dimension)
    return _index


def rebuild_index(records_with_embeddings):
    global _index, _id_map
    _index = faiss.IndexFlatIP(_dimension)
    _id_map = []

    if not records_with_embeddings:
        return

    vectors = np.array([r["embedding"] for r in records_with_embeddings], dtype="float32")
    _index.add(vectors)
    _id_map = [r["id"] for r in records_with_embeddings]


def search_index(query_vector, top_k=5):
    global _index, _id_map
    if _index is None or _index.ntotal == 0:
        return []

    query_array = np.array([query_vector], dtype="float32")
    distances, indices = _index.search(query_array, min(top_k, _index.ntotal))

    results = []
    for score, idx in zip(distances[0], indices[0]):
        if idx == -1:
            continue
        results.append({"id": _id_map[idx], "score": float(score)})
    return results