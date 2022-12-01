import {useEffect, useState} from "react";
import './style.css';
const API_URL = process.env.REACT_APP_API;

function App() {
  var curr_row = 0;
  var curr_tile = 0;
  const [data, setData] = useState("No data :(");

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

  /**
   * Parse dictionary files
   */
  // var text = fs.readFileSync("./valid-wordle-words.txt").toString('utf-8');
  // const wordle_dictionary = text.split("\n");
  // text = fs.readFileSync("./valid-wordle-words.txt").toString('utf-8');
  // const full_dictionary = text.split("\n");

  // const word = 'HELLO';
  // console.log("The answer is: " + word);
  // const messageDisplay = document.querySelector('.message-container');
  // const keyboard = document.querySelector('.key-container');
  // const keys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<]'];
  // let grid_state = [
  //   ['', '', '', '', '',],
  //   ['', '', '', '', '',],
  //   ['', '', '', '', '',],
  //   ['', '', '', '', '',],
  //   ['', '', '', '', '',],
  //   ['', '', '', '', '',],
  // ]
  // const colors = {'green': 'rgb(101, 131, 84)', 'yellow': 'rgb(139, 128, 0)', 'black': 'rgb(51, 51, 51)'}

  // // Create on screen keyboard event listeners
  // keys.forEach(letter => {
  //   const key = document.getElementById(letter);
  //   key.textContent = letter;
  //   key.addEventListener('click', () => {
  //     if (letter == '<]') {
  //       handleBackspace();
  //     } else if (letter == 'ENTER') {
  //       handleEnter();
  //     } else if (letter.charAt(0) >= 'a' && letter.charAt(0) <= 'z') {
  //       let c = letter.toUpperCase().charAt(0);
  //       addLetter(c);
  //     } else if (letter.charAt(0) >= 'A' && letter.charAt(0) <= 'Z') {
  //       addLetter(letter.charAt(0));
  //     }
  //   });
  // })

  // // Create physical keyboard event listener
  // window.addEventListener('keydown', function (e) {
  //   // console.log('pressed ' + e.key);
  //   const key = e.key;
  //   if (key === 'Backspace') {
  //     handleBackspace();
  //   } else if (key === 'Enter') {
  //     handleEnter();
  //   } else if (key.length === 1 && key >= 'a' && key <= 'z') {
  //     let c = key.toUpperCase().charAt(0);
  //     addLetter(c);
  //   } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
  //     addLetter(key.charAt(0));
  //   }
  // })

  // const handleBackspace = () => {
  //   if (curr_tile > 0) {
  //     curr_tile -= 1;
  //     const tile = document.getElementById('row' + curr_row + '-tile' + curr_tile);
  //     tile.textContent = "";
  //     grid_state[curr_row][curr_tile] = "";
  //   }
  // }

  // const handleEnter = () => {
  //   if (curr_tile === 5 && curr_row < 6) {
  //     const guess = grid_state[curr_row].join('');
  //     console.log(guess);
  //     // check if guess is in the dictionary
  //     // if (!full_dictionary.includes(guess)){
  //     //   showMessage('not a word :(');
  //     // }

  //     if (guess === word) { // check if guess is the correct word
  //       showMessage('yay!');
  //       grid_state[curr_row].forEach((_, i) => {
  //         const tile = document.getElementById('row' + curr_row + '-tile' + i);
  //         tile.style.backgroundColor = '#658354';
  //         tile.style.borderColor = '#658354';
  //       })
  //     }
  //     else { 
  //       colorLetters();
  //       curr_row += 1;
  //       curr_tile = 0;
  //     }
  //   }
  // }

  // const showMessage = (message) => {
  //   let messageElement = document.createElement('message');
  //   messageElement.textContent = message;
  //   messageDisplay.append(messageElement);
  // }

  // const addLetter = (letter) => {
  //   const tile = document.getElementById('row' + curr_row + '-tile' + curr_tile);
  //   if (curr_tile < 5) {
  //     tile.textContent = letter;
  //     grid_state[curr_row][curr_tile] = letter;
  //     curr_tile += 1;
  //   }
  // }

  // const colorLetters = () => {
  //   let wordle_letters = Array(26).fill(0);
  //   for (var i = 0; i < word.length; i++) {
  //     wordle_letters[word.charCodeAt(i) - 'A'.charCodeAt(0)] += 1;
  //   }
  //   // mark green letters first
  //   grid_state[curr_row].forEach((c, i) => {
  //     if (c === word.charAt(i)) { // green
  //       const tile = document.getElementById('row' + curr_row + '-tile' + i);
  //       tile.style.backgroundColor = colors.green;
  //       tile.style.borderColor = colors.green;
  //       document.getElementById(c).style.backgroundColor = colors.green;
  //       wordle_letters[c.charCodeAt(0) - 'A'.charCodeAt(0)] -= 1;
  //     }
  //   })
  //   // mark yellow and black letters
  //   grid_state[curr_row].forEach((c, i) => {
  //     let color = colors.black;
  //     if (wordle_letters[c.charCodeAt(0) - 'A'.charCodeAt(0)] > 0) { // yellow
  //       color = colors.yellow;
  //       wordle_letters[c.charCodeAt(0) - 'A'.charCodeAt(0)] -= 1;
  //     }
  //     const tile = document.getElementById('row' + curr_row + '-tile' + i);
  //     if (tile.style.backgroundColor != colors.green) {
  //       tile.style.backgroundColor = color;
  //       tile.style.borderColor = color;
  //       const keyElement = document.getElementById(c);
  //       if (keyElement.style.backgroundColor !== colors.green && keyElement.style.backgroundColor !== colors.yellow){
  //         keyElement.style.backgroundColor = color;
  //       }
  //     };
  //   })  
  // }

  return (
    <>
      <div class="game-container"> 
        <div class="title-container">
            <h1>Wordle AI</h1>
        </div>
        <div class="message-container"></div>
        <div class="grid-container">
            <div class="tile-row" id="row0">
                <div class="tile" id="row0-tile0"></div>
                <div class="tile" id="row0-tile1"></div>
                <div class="tile" id="row0-tile2"></div>
                <div class="tile" id="row0-tile3"></div>
                <div class="tile" id="row0-tile4"></div>
            </div>
            <div class="tile-row" id="row1">
                <div class="tile" id="row1-tile0"></div>
                <div class="tile" id="row1-tile1"></div>
                <div class="tile" id="row1-tile2"></div>
                <div class="tile" id="row1-tile3"></div>
                <div class="tile" id="row1-tile4"></div>
            </div>
            <div class="tile-row" id="row2">
                <div class="tile" id="row2-tile0"></div>
                <div class="tile" id="row2-tile1"></div>
                <div class="tile" id="row2-tile2"></div>
                <div class="tile" id="row2-tile3"></div>
                <div class="tile" id="row2-tile4"></div>         
            </div>
            <div class="tile-row" id="row3">
                <div class="tile" id="row3-tile0"></div>
                <div class="tile" id="row3-tile1"></div>
                <div class="tile" id="row3-tile2"></div>
                <div class="tile" id="row3-tile3"></div>
                <div class="tile" id="row3-tile4"></div>   
            </div>
            <div class="tile-row" id="row4">
                <div class="tile" id="row4-tile0"></div>
                <div class="tile" id="row4-tile1"></div>
                <div class="tile" id="row4-tile2"></div>
                <div class="tile" id="row4-tile3"></div>
                <div class="tile" id="row4-tile4"></div>
            </div>
            <div class="tile-row" id="row5">
                <div class="tile" id="row5-tile0"></div>
                <div class="tile" id="row5-tile1"></div>
                <div class="tile" id="row5-tile2"></div>
                <div class="tile" id="row5-tile3"></div>
                <div class="tile" id="row5-tile4"></div>
            </div>
        </div>
        <div class="key-container">
          <button id="Q"></button>
          <button id="W"></button>
          <button id="E"></button>
          <button id="R"></button>
          <button id="T"></button>
          <button id="Y"></button>
          <button id="U"></button>
          <button id="I"></button>
          <button id="O"></button>
          <button id="P"></button>
          <button id="A"></button>
          <button id="S"></button>
          <button id="D"></button>
          <button id="F"></button>
          <button id="G"></button>
          <button id="H"></button>
          <button id="J"></button>
          <button id="K"></button>
          <button id="L"></button>
          <button id="ENTER"></button>
          <button id="Z"></button>
          <button id="X"></button>
          <button id="C"></button>
          <button id="V"></button>
          <button id="B"></button>
          <button id="N"></button>
          <button id="M"></button>
          <button id="<]"></button>
        </div>
      </div>
      <div class="ai-container"></div>
    </>
  )
}

export default App;