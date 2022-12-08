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
