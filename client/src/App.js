import {useEffect, useState} from "react";
import './style.css';
import {dictionary} from './data/full-dictionary.js';
import {wordle_dictionary} from './data/wordle-dictionary.js';
// import { Tooltip } from 'react-tooltip'
// import Button from 'react-bootstrap/Button';

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
  const [green_hints, setGreenHints] = useState(Array(6).fill(null));
  const [yellow_hints, setYellowHints] = useState(Array(6).fill(" "));
  const [curr_row, setRow] = useState(0);
  const [curr_tile, setTile] = useState(0);
  const [grid_state, setGridState] = useState(init_grid); // Letter at each tile
  const [key_colors, setKeyColors] = useState(init_keys);
  const [grid_colors, setGridColors] = useState(init_grid); // Color at each tile
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    async function getNextGuesses() {
      const prevGuessesParsed = prevGuesses.length ? prevGuesses.join(",") : "none" // Making this a string to avoid parsing brackets as string
      console.log("prevGuessesParsed: ", prevGuessesParsed)
      const url = `${API_URL}/getNextGuesses/${wordle}/${prevGuessesParsed}`; 
      const response = await fetch(url);
      const data = await response.json();
      var greens = [...data.green]
      for (let i = data.green.length; i <= 6; i++) {
        greens.push(null)
      }
      setGreenHints(greens)
      var yellows = [...data.yellow]
      for (let i = data.yellow.length; i <= 6; i++) {
        yellows.push(null)
      }
      setYellowHints(yellows)
      console.log("next green guesses: ", data.green)
      console.log("next yellow guesses: ", data.yellow)
    }
    getNextGuesses();
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
    if (curr_tile === 5 && curr_row < 6) {
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
        updateData(guess);
        if (curr_row === 5) {
          setGameOver(true);
          setMessage('The correct word was: ' + wordle);
        } else {
          // TODO: UPDATE AI SUGGESTIONS HERE
        setRow(curr_row + 1);
        setTile(0);
        }
        var newPrevGuesses = prevGuesses.slice()
        newPrevGuesses.push(guess.toLowerCase())
        setPrevGuesses(newPrevGuesses)
      }
    }
  }

  // FETCH AND UPDATE AI SUGGESTIONS HERE
  const updateData = (guess) => {
    /**
     * INFO FORMAT:
     * if: curr_row = 2
     * info = 
     *  [
     *    [["A", "green"], ["B", "black"], ["O", "yellow"], ["U", "black"], ["T", "black"]],
     *    [["A", "green"], ["B", "black"], ["O", "yellow"], ["U", "black"], ["T", "black"]],
     *    [["A", "green"], ["B", "black"], ["O", "yellow"], ["U", "black"], ["T", "black"]]
     *  ]
     */
    let info = [];
     for (let i = 0; i <= curr_row; i++) {
      let row = grid_state[i].map((letter, j) => {
        return [letter, grid_colors[i][j]];
      })
      info.push(row);
     }
    /**
     * FETCH AND UPDATE AI SUGGESTIONS HERE
     *  GUESSED WORD: [guess] => string
     *  PREVIOUS GUESSES + COLORS: info => string[][][]
     *      e.g.
     *        first guess, first letter: info[0][0][0] = 'A'
     *        first guess, first color: info[0][0][1] = 'green'
     *        second guess, first letter: info[1][0][0];
     *        second guess, second color: info[1][1][1];
     * 
     *  Update the following states:
     *      setData()
     *      setGreenHints(): length currently set to 6. This can be adjusted later
     *      setYellowHints(): length currently set to 6. This can be adjusted later
     */
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
    setGreenHints(Array(6).fill(new_word)); // Update this later
    setYellowHints(Array(6).fill(new_word)); // Update this later
    setGameOver(false);
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
                        <button onClick={() => {}} style={i === curr_row ? {display: "flex"} : {display: "none"}}>CHECK</button>
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
                  <div className="hint-label">
                      <h3>Most Green Letters</h3>
                  </div>
                  <div className="hint-container" id="green-hints">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                          green_hints[i] == null ?
                          <div className="hint" key={i}>
                          {[0, 1, 2, 3, 4].map((j) => (
                            <div className="hint-tile" key={j} word="HELLO" style={{backgroundColor: colors.green}}>{" "}</div>
                          ))}
                          </div>
                          :
                          <div className="hint" key={i} onClick={() => onClickHint(green_hints[i])}>
                          {[0, 1, 2, 3, 4].map((j) => (
                            <div className="hint-tile" key={j} word="HELLO" style={{backgroundColor: colors.green}}>{green_hints[i].charAt(j)}</div>
                          ))}
                          </div>
                      ))}
                  </div>
                  <div className="hint-label">
                      <h3>Most Yellow Letters</h3>
                  </div>
                  <div className="hint-container" id="yellow-hints">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                          yellow_hints[i] == null?
                          <div className="hint" key={i}>
                          {[0, 1, 2, 3, 4].map((j) => (
                              <div className="hint-tile" key={j} style={{backgroundColor: colors.yellow}}>{" "}</div>
                          ))}
                          </div>
                          :
                          <div className="hint" key={i} onClick={() => onClickHint(yellow_hints[i])}>
                          {[0, 1, 2, 3, 4].map((j) => (
                              <div className="hint-tile" key={j} style={{backgroundColor: colors.yellow}}>{yellow_hints[i].charAt(j)}</div>
                          ))}
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