const gameContainer = document.querySelector("#gameboard-container");
const modal = document.getElementById("endgame-modal");

let dificultLevel;
let bombNumber;
let boardSize;
let board = [];
let gameState = false;
let movements = 0;

const dificultSelector = document.querySelector("#div-dif-container");

for (let element of dificultSelector.childNodes) {
    if (element.nodeType === 1 && element.tagName === 'DIV') { 
        element.addEventListener('click', () => {
            
            for (let sibling of dificultSelector.childNodes) {
                if (sibling.nodeType === 1 && sibling.tagName === 'DIV') {
                    sibling.firstElementChild.classList.remove('skull');
                }
            }
            
            element.firstElementChild.classList.add('skull');

            const level = parseInt(element.getAttribute('data-value'));
            switch (level) {
                case 1:
                    dificultLevel = "very-easy";
                    boardSize = 5;
                    bombNumber = 5;
                    break;
                case 2:
                    dificultLevel = "easy";
                    boardSize = 10;
                    bombNumber = 10;
                    break;
                case 3:
                    dificultLevel = "medium";
                    boardSize = 15;
                    bombNumber = 15;
                    break;
                case 4:
                    dificultLevel = "hard";
                    boardSize = 20;
                    bombNumber = 20;
                    break;
                case 5:
                    dificultLevel = "ultra-hard";
                    boardSize = 25;
                    bombNumber = 25;
                    break;
            }
        });
    }
}


const btnOkSelect = document.querySelector("#Okdif");

btnOkSelect.addEventListener('click', () => startGame());

gameContainer.addEventListener('click', event => {
    if (event.target.tagName === 'SPAN' && gameState) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        if (event.target.classList.contains("checkgray")) {
            selectCheck(row, col, event);
        }
    }
});

function openModal(game) {
    modal.style.display = "block";
    const modal_content = document.querySelector(".modal-content");
    modal_content.firstElementChild.src = game === 1
        ? "./Resources/doom-small-has-ganado.png"
        : "./Resources/doom-small-has-perdido.png";
}

const btnOkModal = document.querySelector("#Okmodal");
btnOkModal.onclick = closeModal;

function closeModal() {
    modal.style.display = "none";
    gameContainer.style.display = "none";
    board = [];
    while (gameContainer.hasChildNodes()) {
        gameContainer.removeChild(gameContainer.firstChild);
    }
    dificultSelector.style.display = "block";
}

function startGame() {
    dificultSelector.style.display = "none";
    gameState = true;
    createBoard();
    generateBombs();
    viewBoard();
}

function createBoard() {
    for (let i = 0; i < boardSize; i++) {
        board.push([]);
        for (let j = 0; j < boardSize; j++) {
            board[i].push(0);
        }
    }
}

function generateBombs() {
    let bombs = 0;
    while (bombs < bombNumber) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        if (board[row][col] === 0) {
            board[row][col] = "b";
            bombs++;
        }
    }
    bombPerimeter();
}

function selectCheck(row, col, event) {
    switch (board[row][col]) {
        case "b":
            if (movements === 0) {
                event.target.classList.add("check00");
                event.target.classList.remove("checkgray");
                theFirstIsSave(row, col);
                findMines(row, col);
            } else {
                event.target.classList.add("checkDeamon");
                event.target.classList.remove("checkgray");
                openModal(0);
                gameState = false;
            }
            break;
        default:
            event.target.classList.add(`check0${board[row][col]}`);
            event.target.classList.remove("checkgray");
            findMines(row, col);
            break;
    }
    movements++;
}

function winCondition() {
    let cant = 0;
    board.forEach(checks => checks.forEach(check => {
        if (check === "X") cant++;
    }));
    if (cant === (boardSize * boardSize) - bombNumber) {
        gameState = false;
        openModal(1);
    }
}

function bombsProximity(row, col) {
    let total = 0;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
        const newRow = row + dx, newCol = col + dy;
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && board[newRow][newCol] === "b") {
            total++;
        }
    });
    return total;
}

function bombPerimeter() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 0) {
                board[i][j] = bombsProximity(i, j);
            }
        }
    }
}

function findMines(row, col) {
    if (row >= 0 && row < boardSize && col >= 0 && col < boardSize && board[row][col] === 0) {
        board[row][col] = "X";
        const check = document.querySelector(`#check${row}${col}`);
        check.classList.add("check00");
        check.classList.remove("checkgray");
        [[0, 1], [0, -1], [-1, 0], [1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dx, dy]) => findMines(row + dx, col + dy));
    }
}

function theFirstIsSave(row, col) {
    board[row][col] = 0;
    let i, j;
    do {
        i = Math.floor(Math.random() * boardSize);
        j = Math.floor(Math.random() * boardSize);
    } while (board[i][j] !== 0);
    board[i][j] = "b";
}

function viewBoard() {
    gameContainer.classList.add(dificultLevel);
    let tag = "";
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            tag += `<span class="check-${dificultLevel} checkgray" id="check${i}${j}" data-row="${i}" data-col="${j}"></span>`;
        }
    }
    gameContainer.innerHTML = tag;
    gameContainer.style.display = "grid";
    gameContainer.style.visibility = "visible";
}