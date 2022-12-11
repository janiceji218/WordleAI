"""
Run through all words in the wordle dictionary, 
save in csv word and the number of attempts taken
"""

import util
import models


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

def play(answer, opt):
    """
    Given answer and optimizer, return number of guesses <= 6
    """
    priors = util.get_true_wordle_prior()
    all_words = util.get_word_list(short=False)
    choices = all_words
    guess = None
    num_guesses = 0
    while num_guesses < 6 and guess != answer:
        num_guesses += 1
        prev_guesses, patterns, possibilities = util.get_guesses_patterns_possibilities()
        guess = opt.guess(choices, possibilities, priors, 1)


def run_against_all_possible(opt):
    

    
     # TODO: always true?
    if prev_guesses != []: # If not beginning of the game
        possibilities = util.get_possible_words(prev_guesses[-1], patterns[-1], possibilities)
        util.update_possibilities(possibilities)
    

if __name__ == "__main__":
    otps = [models.MaxGreen()]