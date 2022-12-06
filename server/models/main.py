"""
This module provides an interface with the front end
"""

import models
import util
import sys

from Model import *
import Config


def suggested_guesses(k):
    """ Returns k suggested guesses and scoring metrics as a dictionary"""
    opt = models.MaxInfo()
    priors = util.get_true_wordle_prior()
    all_words = util.get_word_list(short=False)
    short_word_list = util.get_word_list(short=True)
    choices = all_words
    possibilities = short_word_list
    print(opt.guess(choices, possibilities, priors, k))

def get_pattern(guess, answer):
    if PATTERN_GRID_DATA:
        saved_words = PATTERN_GRID_DATA['words_to_index']
        if guess in saved_words and answer in saved_words:
            return get_pattern_matrix([guess], [answer])[0, 0]
    return generate_pattern_matrix([guess], [answer])[0, 0]

def update(answer, guesses):
    # TODO: update pattern grid
    # TODO: figure out what pattern grid is
    patterns = []
    priors = get_frequency_based_priors()
    all_words = get_word_list(short=False)
    possibilities = list(filter(lambda w: priors[w] > 0, all_words))
    # TODO: STILL FAULTY
    for g in guesses:
        pattern = get_pattern(g, answer)
        patterns.append(pattern)
    if guesses:
        possibilities = get_possible_words(guesses[-1], patterns[-1], possibilities)
        next_guesses = optimal_guess(all_words, possibilities, priors)
        print("next_guesses: ", next_guesses)
        return next_guesses 
    else:
        # TODO: HANDLE FIRST GUESS
        return

def reset():
    """ When the game is done, erase files storing game state"""
    # TODO: incomplete
    os.remove(Config.PATTERN_GRID_DATA)


# if __name__ == "__main__":
#     answer = sys.argv[1]
#     guesses = sys.argv[2].split(",")
#     print("guesses after splitting: ", guesses)
#     update(answer, guesses)

    
    