// --- NAVIGATION ---
function showGame(game, btn) {
    document.querySelectorAll('.game-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
    if (game === 'ttt') {
        document.getElementById('ttt-section').classList.add('active');
        document.body.className = "ttt-bg";
    } else {
        document.getElementById('puzzle-section').classList.add('active');
        document.body.className = "puzzle-bg";
    }
    btn.classList.add('active');
}

// --- TIC-TAC-TOE LOGIC ---
let tttBoard = Array(9).fill(null);
let tttPlayer = 'X';
let tttUndo = [], tttRedo = [];

function renderTTT() {
    const grid = document.getElementById('ttt-grid');
    grid.innerHTML = '';
    document.getElementById('winning-line-svg').style.display = 'none';

    tttBoard.forEach((cell, i) => {
        const div = document.createElement('div');
        div.className = 'ttt-cell';
        div.innerText = cell || '';
        div.style.color = cell === 'X' ? '#4f46e5' : '#f43f5e';
        div.onclick = () => {
            if (!tttBoard[i] && !checkWinner()) {
                tttUndo.push({ board: [...tttBoard], player: tttPlayer });
                tttBoard[i] = tttPlayer;
                tttPlayer = tttPlayer === 'X' ? 'O' : 'X';
                tttRedo = [];
                renderTTT();
                const win = checkWinner();
                if (win && win !== 'Draw') drawWinLine(win.combo);
            }
        };
        grid.appendChild(div);
    });
    updateStatus();
}

function checkWinner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let combo of lines) {
        const [a,b,c] = combo;
        if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) 
            return { player: tttBoard[a], combo };
    }
    return tttBoard.includes(null) ? null : 'Draw';
}

function drawWinLine(combo) {
    const cells = document.querySelectorAll('.ttt-cell');
    const wrapper = document.querySelector('.grid-wrapper').getBoundingClientRect();
    const startCell = cells[combo[0]].getBoundingClientRect();
    const endCell = cells[combo[2]].getBoundingClientRect();
    const svg = document.getElementById('winning-line-svg');
    const line = document.getElementById('winning-line');

    const x1 = (startCell.left + startCell.width / 2) - wrapper.left;
    const y1 = (startCell.top + startCell.height / 2) - wrapper.top;
    const x2 = (endCell.left + endCell.width / 2) - wrapper.left;
    const y2 = (endCell.top + endCell.height / 2) - wrapper.top;

    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    svg.style.display = 'block';
}

function updateStatus() {
    const res = checkWinner();
    const status = document.getElementById('ttt-status');
    if (res === 'Draw') status.innerText = "Draw!";
    else if (res) status.innerText = `${res.player} Wins! 🎉`;
    else status.innerText = `Turn: ${tttPlayer}`;
}

function undoTTT() {
    if (tttUndo.length) {
        tttRedo.push({ board: [...tttBoard], player: tttPlayer });
        const state = tttUndo.pop();
        tttBoard = state.board; tttPlayer = state.player;
        renderTTT();
    }
}

function redoTTT() {
    if (tttRedo.length) {
        tttUndo.push({ board: [...tttBoard], player: tttPlayer });
        const state = tttRedo.pop();
        tttBoard = state.board; tttPlayer = state.player;
        renderTTT();
    }
}

function resetTTT() {
    tttBoard = Array(9).fill(null); tttPlayer = 'X';
    tttUndo = []; tttRedo = []; renderTTT();
}

// --- PHOTO PUZZLE LOGIC ---
let pState = [0,1,2,3,4,5,6,7,8], pUndo = [], pRedo = [];
const PUZZLE_IMG = 'https://img.freepik.com/free-vector/cute-duck-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4034.jpg?w=330';

function renderPuzzle() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';
    pState.forEach((id, i) => {
        const div = document.createElement('div');
        div.className = `tile ${id === 8 ? 'empty' : ''}`;
        if (id !== 8) {
            const r = Math.floor(id / 3);
            const c = id % 3;
            div.style.backgroundImage = `url('${PUZZLE_IMG}')`;
            div.style.backgroundSize = '330px 330px';
            div.style.backgroundPosition = `-${c * 110}px -${r * 110}px`;
        }
        div.onclick = () => moveTile(i);
        grid.appendChild(div);
    });
}

function moveTile(i, isAuto = false) {
    const empty = pState.indexOf(8);
    const valid = [empty-1, empty+1, empty-3, empty+3];
    if (valid.includes(i) && !((empty % 3 === 0 && i === empty - 1) || (empty % 3 === 2 && i === empty + 1))) {
        if (!isAuto) { pUndo.push([...pState]); pRedo = []; }
        [pState[i], pState[empty]] = [pState[empty], pState[i]];
        renderPuzzle();
        checkPuzzleWin();
    }
}

function checkPuzzleWin() {
    const winState = [0,1,2,3,4,5,6,7,8];
    if (pState.every((v, i) => v === winState[i]) && pUndo.length > 0) {
        document.getElementById('puzzle-status').innerText = "Solved! Great job! 🎉";
    }
}

function shufflePuzzle() {
    pUndo = []; pRedo = [];
    document.getElementById('puzzle-status').innerText = "Can you solve it?";
    for(let i=0; i<100; i++) {
        const moves = [pState.indexOf(8)-1, pState.indexOf(8)+1, pState.indexOf(8)-3, pState.indexOf(8)+3];
        const randomMove = moves[Math.floor(Math.random() * 4)];
        if (randomMove >= 0 && randomMove < 9) moveTile(randomMove, true);
    }
}

function undoPuzzle() { if(pUndo.length) { pRedo.push([...pState]); pState = pUndo.pop(); renderPuzzle(); } }
function redoPuzzle() { if(pRedo.length) { pUndo.push([...pState]); pState = pRedo.pop(); renderPuzzle(); } }

renderTTT();
renderPuzzle();
