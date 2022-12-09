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
    # print("Previous guesses: ", prev_guesses)
    if prev_guesses != []: # If not beginning of the game
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


def update(answer, guesses):
    if guesses:
        update_game_state(guesses[-1], util.get_pattern(guesses[-1], answer))
        suggested_guesses(10)
    else: # first guess
        reset()
        suggested_guesses(10)

def reset():
    """ When the game is done, erase files storing game state"""
    if os.path.exists(Config.PATTERN_GRID_DATA):
        os.remove(Config.PATTERN_GRID_DATA)
    if os.path.exists(Config.GUESSES_FILE):
        os.remove(Config.GUESSES_FILE)
    if os.path.exists(Config.PATTERNS_FILE):
        os.remove(Config.PATTERNS_FILE)
    if os.path.exists(Config.POSSIBILITIES_FILE):
        os.remove(Config.POSSIBILITIES_FILE)



"""
A pattern for two words represents the wordle-similarity
pattern (grey -> 0, yellow -> 1, green -> 2) but as an integer
between 0 and 3^5. Reading this integer in ternary gives the
associated pattern. Ie convert to base 3
"""
if __name__ == "__main__":
    answer = sys.argv[1]
    guesses = sys.argv[2]
    if guesses == 'none': # parsed as none for the first guess to ensure there's still detectable content
        guesses = []
    else:
        guesses = guesses.split(",")
    update(answer, guesses)

    # Example: answer is "where"
    # reset()
    # suggested_guesses(10)
    # update_game_state("raise", 163) # pattern is 20001
    # suggested_guesses(10)
    # update_game_state("would", 2) # pattern is 00002
    # suggested_guesses(10)
    # update_game_state("which", 89) # pattern is 10022
    # suggested_guesses(10)