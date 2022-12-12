"""
Run through all words in the wordle dictionary, 
save in csv word and the number of attempts taken
"""

import util
import models
import os
import Config
import csv

def reset():
    if os.path.exists(Config.PATTERN_GRID_DATA):
        os.remove(Config.PATTERN_GRID_DATA)

def generate_pattern(guess, answer):
    """ Return a number between 0 and 242"""
    pattern = 0
    letter_list = list(answer)
    unchecked = list(range(5))
    # Check for green
    for i in range(5):
        if guess[i] == answer[i]:
            pattern += (3**i) * 2
            letter_list.remove(guess[i])
            unchecked.remove(i)
    # Then for yellow
    for i in unchecked:
        if guess[i] in letter_list:
            pattern += 3**i
            letter_list.remove(guess[i])
    return pattern

def play(answer, opt, priors, all_words, possible_words):
    """
    Given answer and optimizer, return number of guesses <= 6
    """
    reset()
    choices = all_words
    possibilities = possible_words
    guess = opt.guess(choices, possibilities, priors, 1)[0][0]
    num_guesses = 1
    while guess != answer:
        # print(guess)
        # generate pattern
        pattern = generate_pattern(guess, answer)
        # print(pattern)
        # update list of possibilities
        possibilities = util.get_possible_words(guess, pattern, possibilities)
        # print("possibilities", possibilities)
        num_guesses += 1
        # get new guess
        guess = opt.guess(choices, possibilities, priors, 1)[0][0]
    # print("Num", num_guesses)
    reset()
    return num_guesses


def run_against_all_possible(opt):
    priors = util.get_true_wordle_prior()
    all_words = util.get_word_list(short=False)
    possible_words = util.get_word_list(short=True)
    res = []
    for i, answer in enumerate(possible_words):
        print(i, "====", answer, "====")
        res.append({"answer": answer, "guesses": play(answer, opt, priors, all_words, possible_words)})
    return res    

if __name__ == "__main__":
    opts = [models.MaxGreen()]
    for opt in opts:
        res = run_against_all_possible(opt)
        with open(f"result/{opt.name}.csv", "w") as f:
            fieldnames = ["answer", "guesses"]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(res)
    