"""
This module provides an interface with the front end
"""

import models
import util
import sys
import os

# from Model import *
import Config


def suggested_guesses(k):
    """ Returns k suggested guesses and scoring metrics as a dictionary"""
    priors = util.get_true_wordle_prior()
    all_words = util.get_word_list(short=False)

    prev_guesses, patterns, possibilities = util.get_guesses_patterns_possibilities()
    choices = all_words # TODO: always true?
    if prev_guesses != []: # If not beginning of the game
        possibilities = util.get_possible_words(prev_guesses[-1], patterns[-1], possibilities)
        util.update_possibilities(possibilities)
    
    opt_green, opt_ent = models.MaxGreen(), models.MaxInfo()
    green_guesses, green_scores = opt_green.guess(choices, possibilities, priors, k) 
    yellow_guesses, yellow_entropy = opt_ent.guess(choices, possibilities, priors, k)
    print({
        "green": green_guesses,
        "green_entropy": opt_ent.score(green_guesses, possibilities),
        "green_score": green_scores,
        "yellow": yellow_guesses,
        "yellow_entropy": yellow_entropy,
        "yellow_score": opt_green.score(yellow_guesses, possibilities),
        "remaining_sample_size": len(possibilities)
    })


def update_game_state(guess, pattern):
    """" Receive user's guess and resulting pattern and update game state"""
    guesses, patterns, _ = util.get_guesses_patterns_possibilities()
    guesses.append(guess)
    patterns.append(pattern)
    util.update_guesses_patterns(guesses, patterns)


def update(answer, guesses):
    if guesses:
        update_game_state(guesses[-1], util.get_pattern(guesses[-1], answer))
        suggested_guesses(6)
    else: # first guess
        reset()
        suggested_guesses(6)


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
    answer = sys.argv[1].lower()
    guesses = sys.argv[2].lower()
    if guesses == 'none':  # parsed as none for the first guess to ensure there's still detectable content
        guesses = []
    else:
        guesses = guesses.split(",")
    update(answer, guesses)

# Example: answer is "where"
# k = 2
# suggested_guesses(k)
# reset()
# update_game_state("slate", 20) 
# update_game_state("south", 3)
# update_game_state("boost", 18)
# update_game_state("droid", 18)
# update_game_state("clock", 234)
# print(suggested_guesses(6))

# update_game_state("slate", 162)  # pattern is 00002
# suggested_guesses(k)
# update_game_state("price", 165)  # pattern is 01002
# suggested_guesses(k)
# update_game_state("gorge", 171)  # pattern is 00102
# suggested_guesses(k)
# update_game_state("rhyme", 169)  # pattern is 12002
# suggested_guesses(k)
# reset()
# suggested_guesses(6)
# update_game_state("trace", 1) # pattern is 00001
# suggested_guesses(6)
# update_game_state("linos", 39) # pattern is 01110
# suggested_guesses(6)
# update_game_state("pudge", 2) # pattern is 00002
# suggested_guesses(6)
# update("point", [])
# update("point", ["trace"])
# update("point", ["trace", "linos"])
# update("point", ["trace", "linos", "pudge"])
