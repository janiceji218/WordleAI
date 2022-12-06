from scipy.stats import entropy
import numpy as np
import os
import math
import json
import random
import itertools as it


import Config
import util




def safe_log2(x):
    return math.log2(x) if x > 0 else 0


# Reading from files




def sig(x):
    return 1 / (1 + np.exp(-x))


# Generating color patterns between strings, etc.









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
    pattern_matrix = util.get_pattern_matrix(allowed_words, possible_words)

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