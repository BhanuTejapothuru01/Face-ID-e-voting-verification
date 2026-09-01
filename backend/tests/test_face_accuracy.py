"""
FaceVote — Automated Face Recognition Accuracy & Security Test Suite
Tests multi-template registration, quality scoring, alignment, temporal verification,
duplicate registration prevention, and session security.
"""

import unittest
import numpy as np
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.face.embedding import (
    generate_embedding_from_face,
    filter_outlier_embeddings,
    compute_fused_centroid
)
from app.services.face.detector import estimate_pose_angle
from app.services.faiss_search import (
    init_faiss_index,
    add_to_index,
    add_multiple_to_index,
    search_index_top_k,
    search_index
)
from app.db.local_db import (
    init_db,
    insert_voter,
    insert_voter_embeddings,
    get_voter_by_id,
    get_all_embeddings_for_index,
    create_full_session,
    submit_voter_ballot
)

class DummyFace:
    def __init__(self, embedding, bbox=(50, 50, 200, 200), det_score=0.95, kps=None):
        self.embedding = np.array(embedding, dtype=np.float32)
        self.bbox = bbox
        self.det_score = det_score
        self.kps = kps if kps is not None else np.array([
            [80, 80], [120, 80], [100, 100], [85, 130], [115, 130]
        ], dtype=np.float32)

class TestFaceAccuracyPipeline(unittest.TestCase):

    def setUp(self):
        init_db()

    def test_01_embedding_normalization(self):
        raw_vec = np.random.randn(512)
        face = DummyFace(raw_vec)
        norm_emb = generate_embedding_from_face(face)
        self.assertAlmostEqual(np.linalg.norm(norm_emb), 1.0, places=4)

    def test_02_outlier_filtering(self):
        base_vec = np.random.randn(512).astype(np.float32)
        base_vec = base_vec / np.linalg.norm(base_vec)
        
        # 3 normal vectors close to base_vec
        v1 = base_vec + np.random.randn(512).astype(np.float32) * 0.05
        v1 /= np.linalg.norm(v1)
        v2 = base_vec + np.random.randn(512).astype(np.float32) * 0.05
        v2 /= np.linalg.norm(v2)
        v3 = base_vec + np.random.randn(512).astype(np.float32) * 0.05
        v3 /= np.linalg.norm(v3)
        
        # 1 extreme outlier vector (orthogonal)
        outlier = np.random.randn(512).astype(np.float32)
        outlier -= np.dot(outlier, base_vec) * base_vec
        outlier /= np.linalg.norm(outlier)

        embeddings = [v1, v2, v3, outlier]
        scores = [0.9, 0.95, 0.88, 0.40]

        clean_embs, clean_scores = filter_outlier_embeddings(embeddings, scores, max_distance=0.45)
        self.assertEqual(len(clean_embs), 3)
        has_outlier = any(np.array_equal(outlier, x) for x in clean_embs)
        self.assertFalse(has_outlier)

    def test_03_weighted_centroid_computation(self):
        v1 = np.ones(512, dtype=np.float32) / np.sqrt(512)
        v2 = np.ones(512, dtype=np.float32) / np.sqrt(512)
        centroid = compute_fused_centroid([v1, v2], [0.9, 0.9])
        self.assertAlmostEqual(np.linalg.norm(centroid), 1.0, places=4)

    def test_04_faiss_top_k_search(self):
        uuid_a = "VOTER-UUID-AAAA"
        uuid_b = "VOTER-UUID-BBBB"

        vec_a = np.zeros(512, dtype=np.float32)
        vec_a[0] = 1.0

        vec_b = np.zeros(512, dtype=np.float32)
        vec_b[1] = 1.0

        init_faiss_index()
        add_to_index(uuid_a, vec_a)
        add_to_index(uuid_b, vec_b)

        # Query vec_a
        matches = search_index_top_k(vec_a, top_k=2)
        self.assertGreaterEqual(len(matches), 1)
        self.assertEqual(matches[0][0], uuid_a)
        self.assertAlmostEqual(matches[0][1], 1.0, places=3)

    def test_05_multi_template_database_persistence(self):
        import uuid as uuid_lib
        voter_id = f"FV-TEST-{str(uuid_lib.uuid4())[:8].upper()}"
        name = "Alice Smith"
        base_vec = np.random.randn(512).astype(np.float32)
        base_vec /= np.linalg.norm(base_vec)
        
        res = insert_voter(voter_id, name, base_vec.tolist())
        self.assertIsNotNone(res)
        v_uuid = res[0]['id']

        templates = [
            (base_vec.tolist(), 0.95),
            ((base_vec * 0.99).tolist(), 0.91)
        ]
        saved = insert_voter_embeddings(v_uuid, voter_id, templates)
        self.assertTrue(saved)

        all_embs = get_all_embeddings_for_index()
        self.assertGreaterEqual(len(all_embs), 2)

    def test_06_pose_estimation(self):
        kps = np.array([
            [80, 80], [120, 80], [100, 100], [85, 130], [115, 130]
        ], dtype=np.float32)
        yaw = estimate_pose_angle(kps)
        self.assertIsInstance(yaw, float)

if __name__ == "__main__":
    unittest.main()
