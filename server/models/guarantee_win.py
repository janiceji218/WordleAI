"""
if num_guess == 1 and num_poss > 1:
    return False
Returns if there will still exist a guaranteed way to finish in 6 guesses if you pick this word
"""

import util

def guaranteed_win(choice, possibilities, remain_guess):
    """
    Returns if there will still exist a guaranteed way to finish in remaining guesses if you pick choice
    choice: proposed choice to look at, choice has to be inside possibilities
    possibilities: possible word before you make a choice this round
    remain_guess: number of remaining guesses including current one
    """
    # print("remain guess", remain_guess)
    if remain_guess == 1 or len(possibilities) == 1:
        return [choice] == possibilities
    else:
        # It is a guaranteed win iff for each possible pattern, there is a way to win
        possible_patterns = set(util.get_pattern_matrix([choice], possibilities)[0])
        for pattern in possible_patterns:
            # print(pattern)
            found_a_way = False
            poss_words = util.get_possible_words(choice, pattern, possibilities)
            assert poss_words != []
            for next_choice in poss_words:
                if guaranteed_win(next_choice, poss_words, remain_guess-1):
                    found_a_way = True
                    # print("found a way for", pattern)
                    break # found a way to win for this pattern, go to next pattern
            if not found_a_way: # if no possible way for this pattern, return False
                return False
    return True    

choice = "about"
possible = util.get_word_list(short=True)[:20]
# ['aback', 'abase', 'abate', 'abbey', 'abbot', 'abhor', 'abide', 'abled', 'abode', 'abort', 'about', 'above', 'abuse', 'abyss', 'acorn', 'acrid', 'actor', 'acute', 'adage', 'adapt', 'adept', 'admin', 'admit', 'adobe', 'adopt', 'adore', 'adorn', 'adult', 'affix', 'afire', 'afoot', 'afoul', 'after', 'again', 'agape', 'agate', 'agent', 'agile', 'aging', 'aglow', 'agony', 'agree', 'ahead', 'aider', 'aisle', 'alarm', 'album', 'alert', 'algae', 'alibi', 'alien', 'align', 'alike', 'alive', 'allay', 'alley', 'allot', 'allow', 'alloy', 'aloft', 'alone', 'along', 'aloof', 'aloud', 'alpha', 'altar', 'alter', 'amass', 'amaze', 'amber', 'amble', 'amend', 'amiss', 'amity', 'among', 'ample', 'amply', 'amuse', 'angel', 'anger', 'angle', 'angry', 'angst', 'anime', 'ankle', 'annex', 'annoy', 'annul', 'anode', 'antic', 'anvil', 'aorta', 'apart', 'aphid', 'aping', 'apnea', 'apple', 'apply', 'apron', 'aptly']
# pattern_grid_data = util.get_pattern_grid_data()
# saved_words = pattern_grid_data['words_to_index']
# if choice in saved_words and "abide" in saved_words:
#     print("yeah")


# possible = ["slate", "where", "there", "while", "shell", "point", "yacht"]           
print(guaranteed_win("abbot", possible, 3))