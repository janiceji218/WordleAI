import numpy as np
import os
from pathlib import Path


MISS = np.uint8(0)
MISPLACED = np.uint8(1)
EXACT = np.uint8(2)

DATA_DIR = os.path.join(
    Path(os.path.dirname(os.path.realpath(__file__))).absolute(),
    "data",
)
SHORT_WORD_LIST_FILE = os.path.join(DATA_DIR, "possible_words.txt")
LONG_WORD_LIST_FILE = os.path.join(DATA_DIR, "allowed_words.txt")
WORD_FREQ_FILE = os.path.join(DATA_DIR, "wordle_words_freqs_full.txt")
WORD_FREQ_MAP_FILE = os.path.join(DATA_DIR, "freq_map.json")
SECOND_GUESS_MAP_FILE = os.path.join(DATA_DIR, "second_guess_map.json")
PATTERN_MATRIX_FILE = os.path.join(DATA_DIR, "pattern_matrix.npy")
ENT_SCORE_PAIRS_FILE = os.path.join(DATA_DIR, "ent_score_pairs.json")


STATE_DIR = os.path.join(
    Path(os.path.dirname(os.path.realpath(__file__))).absolute(),
    "state",
)
PATTERN_GRID_DATA = os.path.join(STATE_DIR, "pattern_grid_data.pkl")
GUESSES_FILE = os.path.join(STATE_DIR, "guesses.pkl")
PATTERNS_FILE = os.path.join(STATE_DIR, "patterns.pkl")
POSSIBILITIES_FILE = os.path.join(STATE_DIR, "possibilities.pkl")