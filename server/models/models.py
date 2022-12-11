"""
Cost Functions:
- minimize the expected number of guesses
- minimize the expected number of guesses conditional on never losing the game
- 
Display:
- Strategy (or word suggestions)
- Information gained / remaining possible words?
- Worst case number of guesses
- Probability of winning (either 1/number of possibilities or 0)
"""

"""
a fairly general class is the following: pick some nonnegative constants (w1, w2, w3, w4, w5, w6, w7), and for a certain strategy, define the cost as:

    w1*n1 + w2*n2 + w3*n3 + w4*n4 + w5*n5 + w6*n6 + w7*n7
where nk (for 1≤k≤6) is the number of hidden (solution) words for which the strategy takes n guesses, and n7 is the number of words for which the strategy loses the game. Then,
• Setting w7 infinite / very high is a way of encoding the condition that you not lose the game. (You can set it finite/small if you don't mind occasionally losing the game for some reason!)

• Setting w1 = 1, w2 = 2, …, w6 = 6 will simply minimize the average number of guesses,

• Having them grow exponentially, e.g. setting wk = c^(k-1), where c is some constant larger than 12972 (the number of acceptable guess words) will make sure that the minimal-cost strategy first minimizes the maximum number of guesses, then break ties by having the fewest words take that many guesses, and so on.
"""

# All wordle puzzles can be solved in <= 6 guesses: https://alexpeattie.com/blog/establishing-minimum-guesses-wordle/

# brute force optimal guess: enabled starting round 2?




import numpy as np
from abc import abstractclassmethod
import util
import entropy
import green
class Optimizer:

    def __init__(self, name):
        self.name = name

    @abstractclassmethod
    def guess(self, allowed_words, possible_words, priors, k):
        """
        allowed_words: words in wordle's dictionary 
        possible_words: words that can possibly be the answer given current information
        """
        pass

    def score(self, choices, possible_words):
        """
        Given words, return score according to the metric the optimizer uses
        """
        pass

# from line 473


class MaxInfo(Optimizer):

    def __init__(self):
        super().__init__("Maximizing Information")
        self.weights = None

    def guess(self, allowed_words, possible_words, priors, k):
        self.weights = util.get_weights(possible_words, priors)
        ents = entropy.get_entropies(allowed_words, possible_words, self.weights)
        if len(possible_words) == 1:
            return possible_words, [round(ent, 3) for ent in entropy.get_entropies(possible_words, possible_words, self.weights)]
        # k_left = k if len(possible_words) > k else len(possible_words)
        idx = np.argpartition(ents, -k)[-k:]
        res, score = [allowed_words[i] for i in idx], [ents[i] for i in idx]
        idx_sorted = np.argsort(np.array(score) * -1)
        # res.sort(key=score, reverse=True)
        # score.sort(reverse=True)
        return [res[i] for i in idx_sorted], [round(score[i], 3) for i in idx_sorted]
    
    def score(self, choices, possible_words):
        return [round(s, 3) for s in entropy.get_entropies(choices, possible_words, self.weights)]

# max_info = MaxInfo()
# gs = max_info.guess(["guess", "where"], ["guess", "whole", "where"], util.get_true_wordle_prior(), 1)
# print(gs)
# import os
# import Config
# os.remove(Config.PATTERN_GRID_DATA)


class MaxGreen(Optimizer):
    def __init__(self):
        super().__init__("Maximizing Green Letters")

    def guess(self, allowed_words, possible_words, priors, k):
        res, score = green.get_greens(possible_words, allowed_words, k)
        idx_sorted = np.argsort(np.array(score) * -1)
        return [res[i] for i in idx_sorted], [score[i] for i in idx_sorted]
    
    def score(self, choices, possible_words):
        _, scores = green.get_greens(possible_words, choices, len(choices))
        return scores
