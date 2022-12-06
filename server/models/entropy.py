from scipy.stats import entropy
import numpy as np
import os
import math
import json
import random
import itertools as it
import logging as log

import Config
import util




def safe_log2(x):
    return math.log2(x) if x > 0 else 0


# Reading from files




def sig(x):
    return 1 / (1 + np.exp(-x))


# Generating color patterns between strings, etc.


def words_to_int_arrays(words):
    return np.array([[ord(c) for c in w] for w in words], dtype=np.uint8)


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
    words = util.get_word_list()
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
        pattern_grid_data["words_to_index"] = dict(zip(util.get_word_list(), it.count()))
    else:
        pattern_grid_data = util.get_pattern_grid_data()
    full_grid = pattern_grid_data["grid"]
    words_to_index = pattern_grid_data["words_to_index"]

    indices1 = [words_to_index[w] for w in words1]
    indices2 = [words_to_index[w] for w in words2]
    util.update_pattern_grid_data(pattern_grid_data)
    return full_grid[np.ix_(indices1, indices2)]



def get_pattern_distributions(allowed_words, possible_words, weights):
    """
    For each possible guess in allowed_words, this finds the probability
    distribution across all of the 3^5 wordle patterns you could see, assuming
    the possible answers are in possible_words with associated probabilities
    in weights.
    It considers the pattern hash grid between the two lists of words, and uses
    that to bucket together words from possible_words which would produce
    the same pattern, adding together their corresponding probabilities.
    """
    pattern_matrix = get_pattern_matrix(allowed_words, possible_words)

    n = len(allowed_words)
    distributions = np.zeros((n, 3**5))
    n_range = np.arange(n)
    for j, prob in enumerate(weights):
        distributions[n_range, pattern_matrix[:, j]] += prob
    return distributions


def entropy_of_distributions(distributions, atol=1e-12):
    axis = len(distributions.shape) - 1
    return entropy(distributions, base=2, axis=axis)


def get_entropies(allowed_words, possible_words, weights):
    """
    Returns entropies of each word in allowed_words, assuming the possible 
    answers are in possible_words with associated probabilities in weights.
    Eg in cheat mode, each word has probability 1.
    """
    if weights.sum() == 0:
        return np.zeros(len(allowed_words))
    distributions = get_pattern_distributions(allowed_words, possible_words, weights)
    return entropy_of_distributions(distributions)

# def entropy_to_expected_score(ent):
#     """
#     Based on a regression associating entropies with typical scores
#     from that point forward in simulated games, this function returns
#     what the expected number of guesses required will be in a game where
#     there's a given amount of entropy in the remaining possibilities.
#     """
#     # Assuming you can definitely get it in the next guess,
#     # this is the expected score
#     min_score = 2**(-ent) + 2 * (1 - 2**(-ent))

#     # To account for the likely uncertainty after the next guess,
#     # and knowing that entropy of 11.5 bits seems to have average
#     # score of 3.5, we add a line to account
#     # we add a line which connects (0, 0) to (3.5, 11.5)
#     return min_score + 1.5 * ent / 11.5

# ent = get_entropies(["torse", "aalii"], ["hello", "aalii", "groom", "whole", "torse", "sweep"], np.array([1,1,1,1,1]))
# print(ent)