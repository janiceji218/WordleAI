import heapq as heap

"""
PSEUDOCODE

1. Create dictionary
    1. At positions 0-4 of a five lettered word, the number of “greens” each letter has
    2. [0: A = 900] means the letter A appears as the first letter of 900 words in the Wordle dictionary
    3. Do this for each of the five letter positions

createDictionary(WORDLE_DICTIONARY): 
    dictionary = []
    for i in range (0 to 5): # for each letter in the wordle word
        occurence = []
        for letter in range ('A' to 'Z'): # for each letter in the alphabet
            count = 0
            for each word in WORDLE_DICTIONARY:
                if word.charAt(i) == letter:
                    count += 1
            occurence.append(count)
        dictionary.append(occurence)


2. Choose best words based on green letter frequency
filtered = [...WORDLE_DICTIONARY] # initial state of filtered, can save state of filtered per client call
filtered = filterDictionary(filtered)
dictionary = createDictionary(filtered)

NUM_WORDS = 6 # number of words to return
top_words = min heap with max size NUM_WORDS
for each word in filtered:
    for each letter, index in word:
        value += dictionary[index][letter - 'A']
    if top_words.peek() != None and value > top_words.peek()[1]:
        if top_words.size() == NUM_WORDS:
            top_words.pop()
        top_words.push([word, value])

return [words] in top_words to client


3. Filter WORDLE_DICTIONARY based on guesses
  a. Filter dictionary to contain words with:
        - known green letters (at correct position)
        - contain known yellow letters
  SCENARIOS at position 0:
    a. Already know green letter at 0 
        => filter dictionary with words that have that letter at position 0
    b. Have a list of yellow letters at position 0
        => filter dictionary that removes words with the yellow letters at position 0

filterDictionary(filtered):
    for (letter, index) in yellow_letters:
      filtered = [word for word in filtered if (word.contains(letter) && word.charAt(index) != letter)]

    for (letter, index) in green_letters:
        filtered = [word for word in filtered if (word.contains(letter) && word.charAt(index) == letter)]
        dictionary = createDictionary(filtered);

"""


def create_freq_map(possible_words):
    """
    len(map) = 5 (for the length of a wordle)
    len(map[0]) = 26 (for each letter in the alphabet)
    map[0][0] = the frequency the letter 'A' appears as the first letter in all possible words
    """
    map = []
    for i in range(0, 5):
        occurence = []
        for letter in range(0, 26):
            count = 0
            for word in possible_words:
                if ord(word[i]) - ord("a") == letter:
                    count += 1
            occurence.append(count)
        map.append(occurence)
    return map


def get_greens(possible_words, k):
    map = create_freq_map(possible_words)
    top_words = []
    for word in possible_words:
        value = 0
        for i in range(0, 5):
            letter = ord(word[i]) - ord("a")
            value += map[i][letter]
        
        if len(top_words) < k or value > top_words[0].val:
            if len(top_words) == k:
                heap.heappop(top_words)
            heap.heappush(top_words, Node(word, value))
    return [w.word for w in top_words]


class Node(object):
    def __init__(self, word: str, val: int):
        self.word = word
        self.val = val

    # def __repr__(self):
    #     return f'Node value: {self.val}'

    def __lt__(self, other):
        return self.val < other.val
