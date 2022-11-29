import {useEffect, useState, useCallback} from "react";
import './style.css';

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
  return "HELLO";
}

const checkValidWord = (word) => {
  return true;
}

function App() {
  const [data, setData] = useState("No data :(");
  const [wordle, setWordle] = useState(chooseWord());
  console.log('The wordle is: ' + wordle);
  const [curr_row, setRow] = useState(0);
  const [curr_tile, setTile] = useState(0);
  const [grid_state, setGridState] = useState(init_grid);
  const [key_colors, setKeyColors] = useState(init_keys);
  const [grid_colors, setGridColors] = useState(init_grid);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    async function getData() {
      const url = `${API_URL}/getData`;
      const response = await fetch(url);
      const data = await response.json();
      setData(data.msg);
      console.log(data.msg)
    }
    getData();
  }, []); 

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
    if (curr_tile === 5 && curr_row < 6) {
      const guess = grid_state[curr_row].join('');
      console.log(guess);
      // check if guess is in the dictionary
      // if (!full_dictionary.includes(guess)){
      //   showMessage('not a word :(');
      // }

      if (guess === wordle) { // check if guess is the correct word
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
    for (var i = 0; i < wordle.length; i++) {
      wordle_letters[wordle.charCodeAt(i) - 'A'.charCodeAt(0)] += 1;
    }
    // mark green letters first
    grid_state[curr_row].forEach((c, i) => {
      if (c === wordle.charAt(i)) { // green
        row_colors[i] = colors.green;
        setKeyColors(key_colors => ({...key_colors, c: colors.green}));
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
        setKeyColors(key_colors => ({...key_colors, c: color}));
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
  }

  const reset = () => {
    setGridColors(init_grid);
    setGridState(init_grid);
    setKeyColors(init_keys);
    setRow(0);
    setTile(0);
    setMessage("");
    setWordle(chooseWord());
    setGameOver(false);
  }

  return (
    <>
      <div className="game-container"> 
        <div className="title-container">
            <h1>Wordle AI</h1>
        </div>
        <div className="message-container">
          <div className="message">{message}</div>
          <button className="play-again" hidden={!gameOver} onClick={reset}>Play Again</button>
        </div>
        <div className="grid-container">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div class="tile-row" key={i}>
              {[0, 1, 2, 3, 4].map((j) => (
                  <div class="tile" key={j} style={{backgroundColor: grid_colors[i][j]}}>{grid_state[i][j]}</div>
              ))}
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
      <div className="ai-container"></div>
    </>
  )
}

export default App;