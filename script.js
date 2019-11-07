/*jshint browser: true, devel: true, jquery: true, esversion: 6*/
const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
];
let huScore = 0;
let compScore = 0;
let firstRun = true;
let board;
let firstPlayer;
let huPlayer;
let compPlayer;

$(document).ready(function () {
    $(".sign").on("click", function () {
        huPlayer = $(this).text();
        compPlayer = "O" === huPlayer ? "X" : "O";
        $("#choose-sign").addClass("hidden");

        if (firstRun) {
            $("#loading-screen").removeClass("hidden");
            progBar();
        } else {
            $("#game").removeClass("hidden");
            firstTurn();
        }
    });
});

function startGame () {
    board = Array.from(Array(9).keys());
    $(".cell").off("click");
    $(".cell").text("");
    $(".cell").css("background-color", "#FAFAFB");
    
    $("#result").hide("fade", function () {
        if (firstPlayer === huPlayer) {
            $("#turn").text("Human's Turn");
            $(".cell").on("click", clicked);
        } else {
            whichClicked(compPlayer, randomIndex());
        }
    });
}

function clicked () {
    let id = $(this).attr("id");
    
    if (typeof board[id] === "number") {
        whichClicked(huPlayer, id);
        
        if (!checkWin(board, huPlayer) && !checkSetDraw()) {
            whichClicked(compPlayer, getId());
        }
    }
}

function whichClicked (player, id) {
    if (player === huPlayer) {
        play();
    } else {
        $("#turn").text("Computer's Turn");
        setTimeout(play, 1200);
    }
    
    function play () {
        $("#" + id).text(player);
        board[id] = player;
        
        if (player === huPlayer) {
            $(".cell").off("click");
            checkSetWin(player);
        } else {            
            $("#turn").text("Human's Turn");
            $(".cell").on("click", clicked);
            
            if (!checkSetWin(player)) {
                checkSetDraw();
            }
        }
    }
}

function checkSetWin (player) {
    let win = checkWin(board, player);

    if (win) {
        gameOver(win);
        return true;
    }
    
    return false;
}

function checkWin (board, player) {
    let moves = board.reduce((a, e, i) => e === player ? a.concat(i) : a, []);
    let check = e => moves.indexOf(e) > -1;

    for (let i = 0; i < winningCombos.length; i++) {
        if (winningCombos[i].every(check)) {
            return {index: i, player: player};
        }
    }

    return false;
}

function checkSetDraw () {
    if (checkDraw()) {
        declareResult("It's a draw.");
        firstPlayer = huPlayer;
        $("#turn").text("");
        
        return true;
    }
    
    return false;
}

function checkDraw () {
    return emptyCells().length === 0 ? true : false;
}

function emptyCells () {
    return board.filter(e => typeof e === "number");
}

function gameOver (win) {
    for (let elem of winningCombos[win.index]) {
        $("#" + elem).css("background", "#D3D3D3");
    }

    if (win.player === huPlayer) {
        huScore += 1;
        $("#human-score").text(huScore);
        declareResult("You win!");
        firstPlayer = huPlayer;
    } else {
        compScore += 1;
        $("#computer-score").text(compScore);
        declareResult("You lose.");
        firstPlayer = compPlayer;
    }
    
    $("#turn").text("");
}

function declareResult (statement) {
    $("#result p").text(statement);
    $("#result").show("fade");
    
    setTimeout(function() { 
        startGame();
    }, 1000);
}

function minimax (board, player) {
    let empty = emptyCells();
    let moves = [];
    let bestMove;
    let bestScore;
    
    if (checkWin(board, huPlayer))
        return {score: -10};
    else if (checkWin(board, compPlayer))
        return {score: 10};
    else if (empty.length === 0)
        return {score: 0};
    
    for (let cell of empty) {
        let move = {};
        let result;
        
        move.index = cell;
        board[cell] = player;
        
        if (player === compPlayer) {
            result = minimax(board, huPlayer);
        } else {
            result = minimax(board, compPlayer);
        }
        
        move.score = result.score;
        
        board[cell] = move.index;
        moves.push(move);
    }
    
    if (player === compPlayer) {
        bestScore = -1000;
        
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        bestScore = 1000;

        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    
    return moves[bestMove];
}

function getId () {
    return minimax(board, compPlayer).index;
}

function randomIndex () {
    return Math.floor(Math.random() * 9);
}

function firstTurn () {
    let toss = Math.floor(Math.random() * 2) === 0;
    firstPlayer = toss ? huPlayer : compPlayer;
    startGame();
}

function progBar () {
    let width = 1;
    let id = setInterval(frame, 5);

    function frame () {
        if (width === 100) {
            clearInterval(id);
            $("#progress-bar").css("width", 1 + "%");
            $("#loading-screen").addClass("hidden");
            $("#game").removeClass("hidden");
            firstTurn();
        } else {
            width++;
            $("#progress-bar").css("width", width + "%");
        }
    }
}

$("#reset-button").on("click", function () {
    huScore = 0;
    compScore = 0;
    firstRun = false;
    $("#human-score").text(huScore);
    $("#computer-score").text(compScore);
    $("#game").addClass("hidden");
    $("#choose-sign").removeClass("hidden");
});