import numpy as np
import os
import json

import Config
import pickle

def get_word_list(short=False):
    result = []
    file = Config.SHORT_WORD_LIST_FILE if short else Config.LONG_WORD_LIST_FILE
    with open(file) as fp:
        result.extend([word.strip() for word in fp.readlines()])
    return result


def get_word_frequencies(regenerate=False):
    if os.path.exists(Config.WORD_FREQ_MAP_FILE) or regenerate:
        with open(Config.WORD_FREQ_MAP_FILE) as fp:
            result = json.load(fp)
        return result
    # Otherwise, regenerate
    freq_map = dict()
    with open(Config.WORD_FREQ_FILE) as fp:
        for line in fp.readlines():
            pieces = line.split(" ")
            word = pieces[0]
            freqs = [float(piece.strip()) for piece in pieces[1:]]
            freq_map[word] = np.mean(freqs[-5:])
    with open(Config.WORD_FREQ_MAP_FILE, "w") as fp:
        json.dump(freq_map, fp)
    return freq_map


def get_true_wordle_prior():
    """ Cheat mode """
    words = get_word_list()
    short_words = get_word_list(short=True)
    return dict(
        (w, int(w in short_words))
        for w in words
    )

def get_weights(words, priors):
    frequencies = np.array([priors[word] for word in words])
    total = frequencies.sum()
    if total == 0:
        return np.zeros(frequencies.shape)
    return frequencies / total

def get_pattern_grid_data():
    """" Assumes exist"""
    with open(Config.PATTERN_GRID_DATA, "rb") as f:
        return pickle.load(f)

def update_pattern_grid_data(data):
    with open(Config.PATTERN_GRID_DATA, "wb") as f:
        pickle.dump(data, f)