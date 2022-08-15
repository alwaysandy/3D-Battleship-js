function createBoardDiv() {
    const gameNode = document.querySelector('.game-container');
    for (let z = 0; z < BOARD_SIZE; z++) {
        const boardNode = document.createElement('div');
        boardNode.classList.add('board-container');
        if (z !== 0) {
            boardNode.classList.add('hidden');
        }
        gameNode.appendChild(boardNode);
        boardContainerNodes.push(boardNode);
        boardNodes.push([]);
        for (let y = 0; y < BOARD_SIZE; y++) {
            const line = document.createElement('div');
            line.classList.add('line');
            boardNodes[z].push([]);
            for (let x = 0; x < BOARD_SIZE; x++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.dataset.x = x;
                tile.dataset.y = y;
                tile.dataset.z = z;
                if (y === 0) {
                    tile.classList.add('top-edge');
                } else if (y === BOARD_SIZE - 1) {
                    tile.classList.add('bottom-edge')
                }

                if (x === 0) {
                    tile.classList.add('left-edge');
                } else if (x === BOARD_SIZE - 1) {
                    tile.classList.add('right-edge');
                }

                line.appendChild(tile);
                boardNodes[z][y][x] = tile;
            }
            boardNode.appendChild(line);
        }
        const zP = document.createElement('p');
        zP.classList.add('zInfo');
        zP.textContent = "z: " + z;
        boardNode.appendChild(zP);

        if (z === 0) {
            const shipSize = document.createElement('p');
            shipSize.classList.add('ship-size');
            shipSize.textContent = "ship size: n/a";
            boardNode.appendChild(shipSize);
        }
    }
}

function createBoardDataArray() {
    for (let z = 0; z < BOARD_SIZE; z++) {
        board.push([]);
        for (let y = 0; y < BOARD_SIZE; y++) {
            board[z].push([]);
            for (let x = 0; x < BOARD_SIZE; x++) {
                board[z][y][x] = 0;
            }
        }
    }
}

function getRandomLoc(shipSize) {
    let dir = Math.floor(Math.random() * 3);
    let x, y, z;
    if (dir === 0) {
        x = Math.floor(Math.random() * (BOARD_SIZE - shipSize));
        y = Math.floor(Math.random() * BOARD_SIZE);
        z = Math.floor(Math.random() * BOARD_SIZE);
    } else if (dir === 1) {
        x = Math.floor(Math.random() * BOARD_SIZE);
        y = Math.floor(Math.random() * (BOARD_SIZE - shipSize));
        z = Math.floor(Math.random() * BOARD_SIZE);
    } else if (dir === 2) {
        x = Math.floor(Math.random() * BOARD_SIZE);
        y = Math.floor(Math.random() * BOARD_SIZE);
        z = Math.floor(Math.random() * (BOARD_SIZE - shipSize));
    }

    return {
        x: x,
        y: y,
        z: z,
        dir: dir,
        size: shipSize,
    };
}

function checkCollision(x, y, z, dir, size) {
    if (dir === 0) {
        if (x + size > BOARD_SIZE) {
            return true;
        }
        for (let i = 0; i < size; i++) {
            if (board[z][y][x + i] !== 0 && board[z][y][x + i] !== selected + 1) {
                return true;
            }
        }
    } else if (dir === 1) {
        if (y + size > BOARD_SIZE) {
            return true;
        }
        for (let i = 0; i < size; i++) {
            if (board[z][y + i][x] !== 0 && board[z][y + i][x] !== selected + 1) {
                return true;
            }
        }
    } else if (dir === 2) {
        if (z + size > BOARD_SIZE) {
            return true;
        }
        for (let i = 0; i < size; i++) {
            if (board[z + i][y][x] !== 0 && board[z + i][y][x] !== selected + 1) {
                return true;
            }
        }
    }

    return false;
}

function placeShip(size, shipNum) {
    let loc;
    let collision = true;
    while (collision) {
        loc = getRandomLoc(size);
        collision = checkCollision(loc.x, loc.y, loc.z, loc.dir, loc.size);
    }

    ships.push(loc);
    for (let i = 0; i < size; i++) {
        if (loc.dir === 0) {
            boardNodes[loc.z][loc.y][loc.x + i].classList.add('ship', 'pointer');
            //boardNodes[loc.z][loc.y][loc.x + i].textContent = size;
            board[loc.z][loc.y][loc.x + i] = shipNum;
        } else if (loc.dir === 1){
            boardNodes[loc.z][loc.y + i][loc.x].classList.add('ship', 'pointer');
            //boardNodes[loc.z][loc.y + i][loc.x].textContent = size;
            board[loc.z][loc.y + i][loc.x] = shipNum;
        } else if (loc.dir === 2) {
            boardNodes[loc.z + i][loc.y][loc.x].classList.add('ship', 'pointer');
            //boardNodes[loc.z + i][loc.y][loc.x].textContent = size;
            board[loc.z + i][loc.y][loc.x] = shipNum;
        } 
    }
}

function placeRandomShips() {
    placeShip(5, 1);
    placeShip(4, 2);
    placeShip(3, 3);
    placeShip(3, 4);
    placeShip(2, 5);
}

function moveShip(x, y, z) {
    let s = ships[selected];

    if (checkCollision(x, y, z, s.dir, s.size)) {
        return;
    }

    if (s.dir === 0) {
        for (let i = 0; i < s.size; i++) {
            board[s.z][s.y][s.x + i] = 0;
            board[z][y][x + i] = selected + 1;
            boardNodes[s.z][s.y][s.x + i].classList.remove('ship');
            boardNodes[z][y][x + i].classList.add('ship');
        }
    } else if (s.dir === 1){
        for (let i = 0; i < s.size; i++) {
            board[s.z][s.y + i][s.x] = 0;
            board[z][y + i][x] = selected + 1;
            boardNodes[s.z][s.y + i][s.x].classList.remove('ship');
            boardNodes[z][y + i][x].classList.add('ship');
        }
    } else if (s.dir === 2) {
        for (let i = 0; i < s.size; i++) {
            board[s.z + i][s.y][s.x] = 0;
            board[z + i][y][x] = selected + 1;
            boardNodes[s.z + i][s.y][s.x].classList.remove('ship');
            boardNodes[z + i][y][x].classList.add('ship');
        }
    }

    ships[selected].x = x;
    ships[selected].y = y;
    ships[selected].z = z;
    selectShip(x, y, z);
}

function rotateShip(next) {
    let s = ships[selected];
    let nextDir = s.dir + next;
    if (nextDir === -1) {
        nextDir = 2; 
    } else if (nextDir === 3) {
        nextDir = 0;
    }

    if (nextDir === 0) {
        if (checkCollision(s.x + 1, s.y, s.z, nextDir, s.size - 1)) {
            console.log("can't rotate");
            return;
        }
    } else if (nextDir === 1) {
        if (checkCollision(s.x, s.y + 1, s.z, nextDir, s.size - 1)) {
            console.log("can't rotate");
            return;
        }
    } else if (nextDir === 2) {
        if (checkCollision(s.x, s.y, s.z + 1, nextDir, s.size - 1)) {
            console.log("can't rotate");
            return;
        }
    }

    for (let i = 1; i < s.size; i++) {
        if (s.dir === 0) {
            board[s.z][s.y][s.x + i] = 0;
            boardNodes[s.z][s.y][s.x + i].classList.remove('ship');
        } else if (s.dir === 1) {
            board[s.z][s.y + i][s.x] = 0;
            boardNodes[s.z][s.y + i][s.x].classList.remove('ship');
        } else if (s.dir === 2) {
            board[s.z + i][s.y][s.x] = 0;
            boardNodes[s.z + i][s.y][s.x].classList.remove('ship');
        }
        
        if (nextDir === 0) {
            board[s.z][s.y][s.x + i] = selected + 1;
            boardNodes[s.z][s.y][s.x + i].classList.add('ship');
        } else if (nextDir === 1) {
            board[s.z][s.y + i][s.x] = selected + 1;
            boardNodes[s.z][s.y + i][s.x].classList.add('ship');
        } else if (nextDir === 2) {
            board[s.z + i][s.y][s.x] = selected + 1;
            boardNodes[s.z + i][s.y][s.x].classList.add('ship');
        }
    }

    ships[selected].dir = nextDir;
    selectShip(s.x, s.y, s.z);
}

function unselectShip() {
    if (selected > -1) {
        let s = ships[selected];
        if (s.dir === 0) {
            for (let i = 0; i < s.size; i++) {
                boardNodes[s.z][s.y][s.x + i].classList.remove('selected');
            }
        } else if (s.dir === 1) {
            for (let i = 0; i < s.size; i++) {
                boardNodes[s.z][s.y + i][s.x].classList.remove('selected');
            }
        } else if (s.dir === 2) {
            for (let i = 0; i < s.size; i++) {
                boardNodes[s.z + i][s.y][s.x].classList.remove('selected');
            }
        }
    }

    selected = -1;
    shipSizeText.textContent = "ship size: n/a";
}

function selectShip(x, y, z) {
    let ship = ships[(board[z][y][x]) - 1];
    if (ship.dir === 0) {
        for (let i = 0; i < ship.size; i++) {
            boardNodes[ship.z][ship.y][ship.x + i].classList.add('selected');
        }
    } else if (ship.dir === 1) {
        for (let i = 0; i < ship.size; i++) {
            boardNodes[ship.z][ship.y + i][ship.x].classList.add('selected');
        }
    } else if (ship.dir === 2) {
        for (let i = 0; i < ship.size; i++) {
            boardNodes[ship.z + i][ship.y][ship.x].classList.add('selected');
        }
    }
    selected = board[z][y][x] - 1;
    shipSizeText.textContent = "ship size: " + ship.size;
}

function handleClick(t) {
    let x = parseInt(t.target.dataset.x);
    let y = parseInt(t.target.dataset.y);
    let z = parseInt(t.target.dataset.z);

    if (board[z][y][x] !== 0) {
        if (board[z][y][x] === selected + 1) {
            if (t.which === 1) {
                rotateShip(-1);
            } else if (t.which === 3) {
                rotateShip(1);
            }
        } else {
            unselectShip();
            selectShip(x, y, z);
        }
    } else if (selected !== -1) {
        moveShip(x, y, z);
    }
}

function ready() {
    const waitingText = document.querySelector('.waiting');
    waitingText.classList.remove('hidden');
    unselectShip();
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(t => {
        t.removeEventListener('click', handleClick, false);
        t.classList.remove('pointer');
    });
    socket.emit('ready', ships);
}

function displayNextSlice() {
    if (slice === 4) {
        return;
    }

    boardContainerNodes[slice].classList.add('hidden');
    slice++;
    boardContainerNodes[slice].classList.remove('hidden');
    boardContainerNodes[slice].appendChild(shipSizeText);
}

function displayPrevSlice() {
    if (slice === 0) {
        return;
    }
    boardContainerNodes[slice].classList.add('hidden');
    slice--;
    boardContainerNodes[slice].classList.remove('hidden');
    boardContainerNodes[slice].appendChild(shipSizeText);
}

function displayExplodedView() {
    const sliceViewButton = document.querySelector('#slice-view');
    const explodedViewButton = document.querySelector('#exploded-view');
    const nextSliceButton = document.querySelector('#next-slice');
    const prevSliceButton = document.querySelector('#prev-slice');
    
    for (let n of boardContainerNodes) {
        n.classList.remove('hidden');
    }
    sliceViewButton.classList.remove('hidden');
    explodedViewButton.classList.add('hidden');
    nextSliceButton.classList.add('hidden');
    prevSliceButton.classList.add('hidden');
}

function displaySliceView() {
    const explodedViewButton = document.querySelector('#exploded-view');
    const sliceViewButton = document.querySelector('#slice-view');
    const nextSliceButton = document.querySelector('#next-slice');
    const prevSliceButton = document.querySelector('#prev-slice');
    
    for (let i = 0; i < boardContainerNodes.length; i++) {
        if (i !== slice) {
            boardContainerNodes[i].classList.add('hidden');
        }
    }
    explodedViewButton.classList.remove('hidden');
    sliceViewButton.classList.add('hidden');
    nextSliceButton.classList.remove('hidden')
    prevSliceButton.classList.remove('hidden')
}

function addEventListeners() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(t => {
        t.addEventListener('contextmenu', e => {
            e.preventDefault();
            return false;
        }, false);
    });
    
    tiles.forEach(t => t.addEventListener('mouseup', handleClick));

    const nextSlice = document.querySelector('#next-slice');
    nextSlice.addEventListener('click', displayNextSlice);

    const prevSlice = document.querySelector('#prev-slice');
    prevSlice.addEventListener('click', displayPrevSlice);

    const explodedViewButton = document.querySelector('#exploded-view');
    explodedViewButton.addEventListener('click', displayExplodedView);

    const sliceViewButton = document.querySelector('#slice-view');
    sliceViewButton.addEventListener('click', displaySliceView);

    const startButton = document.querySelector('#start');
    startButton.addEventListener('click', () => {
        startButton.classList.add('hidden');
        ready();
    });
}

const BOARD_SIZE = 5;
const board = [];
const ships = [];
const boardNodes = [];
const boardContainerNodes = [];
let selected = -1;
let slice = 0;
let socket = io();

createBoardDiv();
createBoardDataArray();
placeRandomShips();
addEventListeners();

const shipSizeText = document.querySelector('.ship-size');

socket.on('redirectToGame', (id) => {
    id = JSON.parse(id);
    sessionStorage.setItem('id', id);
    window.location.replace('/game');
});
