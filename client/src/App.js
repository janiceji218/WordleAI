import {useEffect, useState} from "react";
import './style.css';
import {dictionary} from './data/full-dictionary.js';
import {wordle_dictionary} from './data/wordle-dictionary.js';
import spinner from './assets/spinner.gif'

const API_URL = process.env.REACT_APP_API;
const keys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<]'];
const colors = {'green': 'rgb(101, 131, 84)', 'yellow': 'rgb(139, 128, 0)', 'black': 'rgb(51, 51, 51)', 'gray': 'rgb(129, 131, 132)'};
const init_keys = {};
keys.forEach((k) => {
  init_keys[k] = colors.gray;
})
const init_grid = [
  ['', '', '', '', '',],
  ['', '', '', '', '',],
  ['', '', '', '', '',],
  ['', '', '', '', '',],
  ['', '', '', '', '',],
  ['', '', '', '', '',],
];
const NUM_GUESSES = 6

const chooseWord = () => {
  let word = wordle_dictionary[Math.floor(Math.random() * wordle_dictionary.length)];
  console.log("The wordle is: " + word);
  return word.toUpperCase();
}

const init_wordle = chooseWord();

function App() {
  const [data, setData] = useState("No data :(");
  const [prevGuesses, setPrevGuesses] = useState([]);
  const [wordle, setWordle] = useState(init_wordle);
  const [green_hints, setGreenHints] = useState(Array(NUM_GUESSES).fill(null));
  const [green_scores, setGreenScores] = useState(Array(NUM_GUESSES).fill(null));
  const [yellow_hints, setYellowHints] = useState(Array(NUM_GUESSES).fill(null));
  const [yellow_entropies, setYellowEntropies] = useState(Array(NUM_GUESSES).fill(null));
  const [yellow_scores, setYellowScores] = useState(Array(NUM_GUESSES).fill(null));
  const [green_entropies, setGreenEntropies] = useState(Array(NUM_GUESSES).fill(null));
  const [yellow_is_possible, setYellowIsPossible] = useState(Array(NUM_GUESSES).fill(true))
  const [green_is_possible, setGreenIsPossible] = useState(Array(NUM_GUESSES).fill(true))
  const [remaining_sample_size, setRemainingSampleSize] = useState(null)
  const [curr_row, setRow] = useState(0);
  const [curr_tile, setTile] = useState(0);
  const [grid_state, setGridState] = useState(init_grid); // Letter at each tile
  const [key_colors, setKeyColors] = useState(init_keys);
  const [grid_colors, setGridColors] = useState(init_grid); // Color at each tile
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [isFetchingHints, setIsFetchingHints] = useState(true);
  const [isCheckingGuess, setIsCheckingGuess] = useState(false);

  useEffect(() => {
    async function getNextGuesses() {
      const prevGuessesParsed = prevGuesses.length ? prevGuesses.join(",") : "none" // Making this a string to avoid parsing brackets as string
      console.log("prevGuessesParsed: ", prevGuessesParsed)
      const url = `${API_URL}/getNextGuesses/${wordle}/${prevGuessesParsed}`; 
      const response = await fetch(url);
      const data = await response.json();
      var greens = [...data.green]
      var greenScores = [...data.greenScores]
      for (let i = data.green.length; i <= NUM_GUESSES; i++) {
        greens.push(null)
        greenScores.push(null)
      }
      setGreenHints(greens)
      setGreenScores(greenScores)
      var yellows = [...data.yellow]
      var yellowScores = [...data.yellowEntropies]
      for (let i = data.yellow.length; i <= NUM_GUESSES; i++) {
        yellows.push(null)
        yellowScores.push(null)
      }
      setYellowHints(yellows)
      setYellowEntropies(yellowScores)
      setGreenEntropies(data.greenEntropies)
      setYellowScores(data.yellowScores)
      setGreenIsPossible(data.greenIsPossible)
      setYellowIsPossible(data.yellowIsPossible)
      setRemainingSampleSize(data.remainingSampleSize)
    }
    getNextGuesses().then(() => {setIsFetchingHints(false)});
  }, [prevGuesses]); 

  // Create physical keyboard event listeners
  useEffect(() => {
    const handleKeyPress = (e) => {
      // console.log('pressed ' + e.key);
      const key = e.key;
      if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Enter') {
        handleEnter();
      } else if (key.length === 1 && key >= 'a' && key <= 'z') {
        let c = key.toUpperCase().charAt(0);
        addLetter(c);
      } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        addLetter(key.charAt(0));
      }
    }
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  });

  const handleScreenKeyboardPress = (letter) => {
    // Create on screen keyboard event listeners
    if (letter === '<]') {
      handleBackspace();
    } else if (letter === 'ENTER') {
      handleEnter();
    } else if (letter.charAt(0) >= 'a' && letter.charAt(0) <= 'z') {
      let c = letter.toUpperCase().charAt(0);
      addLetter(c);
    } else if (letter.charAt(0) >= 'A' && letter.charAt(0) <= 'Z') {
      addLetter(letter.charAt(0));
    }
  }

  const handleBackspace = () => {
    if (curr_tile > 0) {
      const new_grid = grid_state.map((row, i) => {
        if (i === curr_row) {
          const new_row = row.map((letter, j) => {
            if (j === curr_tile - 1) {
              return '';
            } else {
              return letter;
            }
          })
          return new_row;
        } else {
          return row;
        }
      })
      setGridState(new_grid);
      setTile(curr_tile - 1);
    }
  }

  const handleEnter = () => {
    setMessage("");
    if (curr_tile === 5 && curr_row < NUM_GUESSES) {
      const guess = grid_state[curr_row].join('');
      // check if guess is in the dictionary
      if (!dictionary.includes(guess.toLowerCase())){
        setMessage('Not a word :(');
      }

      else if (guess === wordle) { // check if guess is the correct word
        colorLetters();
        setGameOver(true);
        setMessage('yay :)');
      }
      else { 
        colorLetters();
        if (curr_row === 5) {
          setGameOver(true);
          setMessage('The correct word was: ' + wordle);
        } else {
          // TODO: UPDATE AI SUGGESTIONS HERE
        setRow(curr_row + 1);
        setTile(0);
        }
        setIsFetchingHints(true);
        var newPrevGuesses = prevGuesses.slice()
        newPrevGuesses.push(guess.toLowerCase())
        setPrevGuesses(newPrevGuesses)
      }
    }
  }

  const addLetter = (letter) => {
    if (curr_tile < 5) {
      const new_grid = grid_state.map((row, i) => {
        if (i === curr_row) {
          const new_row = row.map((l, j) => {
            if (j === curr_tile) {
              return letter;
            } else {
              return l;
            }
          })
          return new_row;
        } else {
          return row;
        }
      })
      setGridState(new_grid);
      setTile(curr_tile + 1);
    }
  }

  const colorLetters = () => {
    let wordle_letters = Array(26).fill(0);
    let row_colors = Array(5).fill(colors.black);
    let new_keys = {...key_colors};
    for (var i = 0; i < wordle.length; i++) {
      wordle_letters[wordle.charCodeAt(i) - 'A'.charCodeAt(0)] += 1;
    }
    // mark green letters first
    grid_state[curr_row].forEach((c, i) => {
      if (c === wordle.charAt(i)) { // green
        row_colors[i] = colors.green;
        new_keys[c] = colors.green;
        wordle_letters[c.charCodeAt(0) - 'A'.charCodeAt(0)] -= 1;
      }
    })

    // mark yellow and black letters
    grid_state[curr_row].forEach((c, i) => {
      let color = colors.black;
      if (wordle_letters[c.charCodeAt(0) - 'A'.charCodeAt(0)] > 0) { // yellow
        color = colors.yellow;
        wordle_letters[c.charCodeAt(0) - 'A'.charCodeAt(0)] -= 1;
      }
      if (row_colors[i] !== colors.green) {
        row_colors[i] = color;
        if (new_keys[c] !== colors.green) {
          new_keys[c] = color;
        }
        
      }
    })
    const new_grid = grid_colors.map((row, i) => {
      if(i === curr_row) {
        return row_colors;
      } else {
        return row;
      }
    })
    setGridColors(new_grid);
    setKeyColors(new_keys);
  }

  const reset = () => {
    setGridColors(init_grid);
    setGridState(init_grid);
    setKeyColors(init_keys);
    setRow(0);
    setTile(0);
    setMessage("");
    const new_word = chooseWord();
    setWordle(new_word);
    setGreenScores(Array(NUM_GUESSES).fill(null));
    setGreenHints(Array(NUM_GUESSES).fill(null)); 
    setYellowEntropies(Array(NUM_GUESSES).fill(null))
    setYellowHints(Array(NUM_GUESSES).fill(null)); 
    setGreenEntropies(Array(NUM_GUESSES).fill(null))
    setYellowScores(Array(NUM_GUESSES).fill(null));
    setGreenIsPossible(Array(NUM_GUESSES).fill(true));
    setYellowIsPossible(Array(NUM_GUESSES).fill(true))
    setRemainingSampleSize(null)
    setGameOver(false);
    setPrevGuesses([])
  }

  const onClickHint = (hint) => {
    const new_grid = grid_state.map((row, i) => {
      if (i === curr_row) {
        const new_row = row.map((l, j) => {
          return hint.charAt(j);
        })
        return new_row;
      } else {
        return row;
      }
    })
    setGridState(new_grid);
    setTile(5);
  }

  const handleCheck = async () => {
    setIsCheckingGuess(true);
    const guess = grid_state[curr_row].join('');
    // check if guess is in the dictionary
    if (dictionary.includes(guess.toLowerCase())){
      const url = `${API_URL}/guaranteeWin/${guess}/${NUM_GUESSES - curr_row}`; 
      const response = await fetch(url);
      const guaranteeWin = await response.json();
      if (guaranteeWin.guaranteeWin) {
        setMessage("Guaranteed will complete in 6 guesses")
      } else {
        setMessage("Not guaranteed will complete in 6 guesses")
      }
    }
  }

  return (
    <>
      <div className="main-container"> 
          <div className="title-container">
              <h1>Wordle AI</h1>
          </div>
          <div className="game-container">
              <div className="wordle-container">
                  <div className="message-container">
                      <h3 className="message">{message}</h3>
                      <button className="play-again" hidden={!gameOver} onClick={reset}>Play Again</button>
                  </div>
                  <div className="grid-container">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div class="tile-row" key={i}>
                        {[0, 1, 2, 3, 4].map((j) => (
                            <div class="tile" key={j} style={{backgroundColor: grid_colors[i][j]}}>{grid_state[i][j]}</div>
                        ))}
                        <button onClick={() => {handleCheck().then(() => {setIsCheckingGuess(false)})}} style={i === curr_row && !(curr_tile !== 5 || curr_row < 3) ? {display: "flex"} : {display: "none"}}>CHECK</button>
                        <img src={spinner} alt="loading" style={i === curr_row && isCheckingGuess ? {opacity: 1} : {opacity: 0}}></img>
                      </div>
                    ))
                    }
                  </div>
                  <div className="key-container">
                  {keys.map((letter) => (
                    <button key={letter} onClick={() => handleScreenKeyboardPress(letter)} style={{backgroundColor: key_colors[letter], borderColor: key_colors[letter]}}>{letter}</button>
                  ))}
                  </div>
              </div>
              <div className="ai-container">
                  <img src={spinner} alt="loading" style={isFetchingHints ? {opacity: 1} : {opacity: 0}}></img>
                  <div className="hint-label">
                    <h3>Remaining possible words: {remaining_sample_size}</h3>
                  </div>
                  <div className="hint-label">
                      <h3>Most Green Letters</h3>
                  </div>
                  <div className="hint-container" id="green-hints">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                          green_hints[i] == null ?
                          <div className={green_is_possible[i] ? "possible-word-container" : "word-container"}>
                            <div className="hint" key={i}>
                              {[0, 1, 2, 3, 4].map((j) => (
                                <div className="hint-tile" key={j} word="HELLO" style={{backgroundColor: colors.green}}>{" "}</div>
                              ))}
                            </div>
                            <div className="score">Entropy: {green_entropies[i]}</div>
                            <div className="score">Green score: {green_scores[i]}</div>
                          </div>
                          :
                          <div className={green_is_possible[i] ? "possible-word-container" : "word-container"}>
                            <div className="hint" key={i} onClick={() => onClickHint(green_hints[i])}>
                              {[0, 1, 2, 3, 4].map((j) => (
                                <div className="hint-tile" key={j} word="HELLO" style={{backgroundColor: colors.green}}>{green_hints[i].charAt(j)}</div>
                              ))}
                            </div>
                            <div className="score">Entropy: {green_entropies[i]}</div>
                            <div className="score">Green score: {green_scores[i]}</div>
                          </div>
                      ))}
                  </div>
                  <div className="hint-label">
                      <h3>Words Maximizing Entropy</h3>
                  </div>
                  <div className="hint-container" id="yellow-hints">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                          yellow_hints[i] == null?
                          <div className={yellow_is_possible[i] ? "possible-word-container" : "word-container"}>
                            <div className="hint" key={i}>
                              {[0, 1, 2, 3, 4].map((j) => (
                                  <div className="hint-tile" key={j} style={{backgroundColor: colors.yellow}}>{" "}</div>
                              ))}
                            </div>
                            <div className="score">Entropy: {yellow_entropies[i]}</div>
                            <div className="score">Green score: {yellow_scores[i]}</div>
                          </div>
                          :
                          <div className={yellow_is_possible[i] ? "possible-word-container" : "word-container"}>
                            <div className="hint" key={i} onClick={() => onClickHint(yellow_hints[i])}>
                              {[0, 1, 2, 3, 4].map((j) => (
                                  <div className="hint-tile" key={j} style={{backgroundColor: colors.yellow}}>{yellow_hints[i].charAt(j)}</div>
                              ))}
                            </div>
                            <div className="score">Entropy: {yellow_entropies[i]}</div>
                            <div className="score">Green score: {yellow_scores[i]}</div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </>
  )
}

export default App;