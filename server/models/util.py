import numpy as np
import os
import json
import itertools as it
import logging as log

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

def get_possible_words(guess, pattern, word_list):
    """ Returns only words in the list that is consistent with the pattern"""
    all_patterns = get_pattern_matrix([guess], word_list).flatten()
    return list(np.array(word_list)[all_patterns == pattern])

def get_guesses_patterns_possibilities():
    """" Returns previous guesses and patterns, or empty lists if first round"""
    guesses, patterns, possibilities = [], [], None
    if os.path.exists(Config.GUESSES_FILE):
        with open(Config.GUESSES_FILE, "rb") as f:
            guesses = pickle.load(f)
    if os.path.exists(Config.PATTERNS_FILE):
        with open(Config.PATTERNS_FILE, "rb") as f:
            patterns = pickle.load(f)
    if os.path.exists(Config.POSSIBILITIES_FILE):
        with open(Config.POSSIBILITIES_FILE, "rb") as f:
            possibilities = pickle.load(f)
    if possibilities is None: # first time
        short_word_list = get_word_list(short=True)
        possibilities = short_word_list # We are in cheat mode
    return guesses, patterns, possibilities

def update_guesses_patterns(guesses, patterns):
    with open(Config.GUESSES_FILE, "wb") as f:
        pickle.dump(guesses, f)
    with open(Config.PATTERNS_FILE, "wb") as f:
        pickle.dump(patterns, f)

def update_possibilities(data):
    with open(Config.POSSIBILITIES_FILE, "wb") as f:
        pickle.dump(data, f)


# ====================== PATTERN MATRIX STUFF ======================

def words_to_int_arrays(words):
    return np.array([[ord(c) for c in w] for w in words], dtype=np.uint8)

def get_pattern_grid_data():
    """" Assumes exist"""
    with open(Config.PATTERN_GRID_DATA, "rb") as f:
        return pickle.load(f)

def update_pattern_grid_data(data):
    with open(Config.PATTERN_GRID_DATA, "wb") as f:
        pickle.dump(data, f)

def generate_pattern_matrix(words1, words2):
    """
    A pattern for two words represents the wordle-similarity
    pattern (grey -> 0, yellow -> 1, green -> 2) but as an integer
    between 0 and 3^5. Reading this integer in ternary gives the
    associated pattern.
    This function computes the pairwise patterns between two lists
    of words, returning the result as a grid of hash values. Since
    this can be time-consuming, many operations that can be are vectorized
    (perhaps at the expense of easier readibility), and the the result
    is saved to file so that this only needs to be evaluated once, and
    all remaining pattern matching is a lookup.
    """

    # Number of letters/words
    nl = len(words1[0])
    nw1 = len(words1)  # Number of words
    nw2 = len(words2)  # Number of words

    # Convert word lists to integer arrays
    word_arr1, word_arr2 = map(words_to_int_arrays, (words1, words2))

    # equality_grid keeps track of all equalities between all pairs
    # of letters in words. Specifically, equality_grid[a, b, i, j]
    # is true when words[i][a] == words[b][j]
    equality_grid = np.zeros((nw1, nw2, nl, nl), dtype=bool)
    for i, j in it.product(range(nl), range(nl)):
        equality_grid[:, :, i, j] = np.equal.outer(word_arr1[:, i], word_arr2[:, j])

    # full_pattern_matrix[a, b] should represent the 5-color pattern
    # for guess a and answer b, with 0 -> grey, 1 -> yellow, 2 -> green
    full_pattern_matrix = np.zeros((nw1, nw2, nl), dtype=np.uint8)

    # Green pass
    for i in range(nl):
        matches = equality_grid[
            :, :, i, i
        ].flatten()  # matches[a, b] is true when words[a][i] = words[b][i]
        full_pattern_matrix[:, :, i].flat[matches] = Config.EXACT

        for k in range(nl):
            # If it's a match, mark all elements associated with
            # that letter, both from the guess and answer, as covered.
            # That way, it won't trigger the yellow pass.
            equality_grid[:, :, k, i].flat[matches] = False
            equality_grid[:, :, i, k].flat[matches] = False

    # Yellow pass
    for i, j in it.product(range(nl), range(nl)):
        matches = equality_grid[:, :, i, j].flatten()
        full_pattern_matrix[:, :, i].flat[matches] = Config.MISPLACED
        for k in range(nl):
            # Similar to above, we want to mark this letter
            # as taken care of, both for answer and guess
            equality_grid[:, :, k, j].flat[matches] = False
            equality_grid[:, :, i, k].flat[matches] = False

    # Rather than representing a color pattern as a lists of integers,
    # store it as a single integer, whose ternary representations corresponds
    # to that list of integers.
    pattern_matrix = np.dot(full_pattern_matrix, (3 ** np.arange(nl)).astype(np.uint8))
    return pattern_matrix


def generate_full_pattern_matrix():
    words = get_word_list()
    pattern_matrix = generate_pattern_matrix(words, words)
    # Save to file
    np.save(Config.PATTERN_MATRIX_FILE, pattern_matrix)
    return pattern_matrix


def get_pattern_matrix(words1, words2):
    if not os.path.exists(Config.PATTERN_GRID_DATA):
        if not os.path.exists(Config.PATTERN_MATRIX_FILE):
            log.info(
                "\n".join(
                    [
                        "Generating pattern matrix. This takes a minute, but",
                        "the result will be saved to file so that it only",
                        "needs to be computed once.",
                    ]
                )
            )
            generate_full_pattern_matrix()
        
        pattern_grid_data = dict()
        pattern_grid_data["grid"] = np.load(Config.PATTERN_MATRIX_FILE)
        pattern_grid_data["words_to_index"] = dict(zip(get_word_list(), it.count()))
    else:
        pattern_grid_data = get_pattern_grid_data()
    full_grid = pattern_grid_data["grid"]
    words_to_index = pattern_grid_data["words_to_index"]

    indices1 = [words_to_index[w] for w in words1]
    indices2 = [words_to_index[w] for w in words2]
    update_pattern_grid_data(pattern_grid_data)
    return full_grid[np.ix_(indices1, indices2)]

def get_pattern(guess, answer):
    if os.path.exists(Config.PATTERN_GRID_DATA):
        pattern_grid_data = get_pattern_grid_data()
        saved_words = pattern_grid_data['words_to_index']
        if guess in saved_words and answer in saved_words:
            return get_pattern_matrix([guess], [answer])[0, 0]
    return generate_pattern_matrix([guess], [answer])[0, 0]