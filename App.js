var curr_row = 0;
var curr_tile = 0;
const word = 'HELLO';
const messageDisplay = document.querySelector('.message-container');
let grid_state = [
  ['', '', '', '', '',],
  ['', '', '', '', '',],
  ['', '', '', '', '',],
  ['', '', '', '', '',],
  ['', '', '', '', '',],
  ['', '', '', '', '',],
]
window.addEventListener('keydown', function (e) {
  let key = e.key;
  console.log('pressed ' + key);
  if (key == 'Backspace') {
    handleBackspace();
  } else if (key == 'Enter') {
    handleEnter();
  } else if (key.length == 1 && key.charAt(0) >= 'a' && key.charAt(0) <= 'z') {
    let c = key.toUpperCase().charAt(0);
    addLetter(c);
  } else if (key.length == 1 && key.charAt(0) >= 'A' && key.charAt(0) <= 'Z') {
    addLetter(key.charAt(0));
  }
})

const handleBackspace = () => {
  if (curr_tile > 0) {
    curr_tile -= 1;
    const tile = document.getElementById('row' + curr_row + '-tile' + curr_tile);
    tile.textContent = "";
    grid_state[curr_row][curr_tile] = "";
  }
}

const handleEnter = () => {
  if (curr_tile == 5 && curr_row < 6) {
    const guess = grid_state[curr_row].join('');
    console.log(guess);
    // TODO: check if guess is in the dictionary
    // check if guess is the correct word
    if (guess == word) {
      showMessage('yay!');
      grid_state[curr_row].forEach((_, i) => {
        const tile = document.getElementById('row' + curr_row + '-tile' + i);
        tile.style.backgroundColor = '#658354';
      })
    }
    // mark letters
    else {
      grid_state[curr_row].forEach((c, i) => {
        let color = '#333333';
        if (c == word.charAt(i)) {
          color = '#658354';
        } else if (word.includes(c)) {
          color = '#8B8000';
        }
        const tile = document.getElementById('row' + curr_row + '-tile' + i);
        tile.style.backgroundColor = color;
        tile.style.borderColor = color;
      })
      curr_row += 1;
      curr_tile = 0;
    }
  }
}

const showMessage = (message) => {
  let messageElement = document.createElement('message');
  messageElement.textContent = message;
  messageDisplay.append(messageElement);
}

const addLetter = (letter) => {
  const tile = document.getElementById('row' + curr_row + '-tile' + curr_tile);
  if (curr_tile < 5) {
    tile.textContent = letter;
    grid_state[curr_row][curr_tile] = letter;
    curr_tile += 1;
  }
}
