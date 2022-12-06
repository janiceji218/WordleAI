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
    
    prev_guesses, patterns, possibilities = util.get_guesses_patterns_possibilities()
    choices = all_words # TODO: always true?
    
    if prev_guesses != []: # If not beginning of the game
        print(prev_guesses)
        possibilities = util.get_possible_words(prev_guesses[-1], patterns[-1], possibilities)
        util.update_possibilities(possibilities)
    print(len(possibilities), "possibilities now")
    print(possibilities)

    print(opt.guess(choices, possibilities, priors, k))


def update_game_state(guess, pattern):
    """" Receive user's guess and resulting pattern and update game state"""
    guesses, patterns, _ = util.get_guesses_patterns_possibilities()
    guesses.append(guess)
    patterns.append(pattern)
    util.update_guesses_patterns(guesses, patterns)


# def update(answer, guesses):
#     # TODO: update pattern grid
#     # TODO: figure out what pattern grid is
#     patterns = []
#     priors = get_frequency_based_priors()
#     all_words = get_word_list(short=False)
#     possibilities = list(filter(lambda w: priors[w] > 0, all_words))
#     # TODO: STILL FAULTY
#     for g in guesses:
#         pattern = get_pattern(g, answer)
#         patterns.append(pattern)
#     if guesses:
#         possibilities = get_possible_words(guesses[-1], patterns[-1], possibilities)
#         next_guesses = optimal_guess(all_words, possibilities, priors)
#         print("next_guesses: ", next_guesses)
#         return next_guesses 
#     else:
#         # TODO: HANDLE FIRST GUESS
#         return

def reset():
    """ When the game is done, erase files storing game state"""
    # TODO: incomplete
    os.remove(Config.PATTERN_GRID_DATA)
    os.remove(Config.GUESSES_FILE)
    os.remove(Config.PATTERNS_FILE)
    os.remove(Config.POSSIBILITIES_FILE)


# if __name__ == "__main__":
#     answer = sys.argv[1]
#     guesses = sys.argv[2].split(",")
#     print("guesses after splitting: ", guesses)
#     update(answer, guesses)



"""
A pattern for two words represents the wordle-similarity
pattern (grey -> 0, yellow -> 1, green -> 2) but as an integer
between 0 and 3^5. Reading this integer in ternary gives the
associated pattern. Ie convert to base 3
"""
# Example: answer is "where"

suggested_guesses(10)
update_game_state("raise", 83) # pattern is 10002
suggested_guesses(10)
update_game_state("would", 162) # pattern is 20000
suggested_guesses(10)
reset()