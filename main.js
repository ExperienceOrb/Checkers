var turn = true;
var winner = 0;

board = [
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0]
];

$(document).ready(function(){
    $table = $('#board');
    var rowheight = $table.width()/8;
    for (var row = 0; row < board.length; row++){
        var tabrow = document.createElement('div');
        $tr = $(tabrow);
        $tr.css({height:rowheight});
        $tr.addClass('eight');
        $tr.addClass('column');
        $tr.addClass('row');
        $table.append($tr);
        for (var column = 0; column < board[row].length; column++){
            var cell = document.createElement('div');
            $cell = $(cell);
            $tr.append($cell);
            if (row%2==column%2){
                $cell.addClass('black');
            } else {
                $cell.addClass('red');
            }
            $cell.addClass('column');
            var image = document.createElement('img');
            $img = $(image);
            $img.attr('src', 'assets/transparent.png');
            $img.css({width:'100%', height:'100%'});
            $cell.append($img);
            setCellPiece(row, column, board[row][column]);
        }
    }
});

function setCellPiece(row, column, piece){
    $cell = $($('.grid').children()[row]).children()[column];
    $img = $($cell.children[0]);
    if (piece==0){

    } else {
        if (piece==1){
            $img.addClass('black');
        } else if (piece==2){
            $img.addClass('white');
        } else if (piece==3){
            $img.addClass('blackking');
        } else if (piece==4){
            $img.addClass('whiteking');
        }
        $img.addClass('piece');
    }
}

function makePlayerMove(space) {
    if (turn && !spaceTaken(spaces_X+spaces_O, space)) {
        spaces_X |= space;
        updateGUI();
        turn = !turn;
        var res = testForWinner(spaces_X, spaces_O, 0);
        if (checkWinner()=="none"){
            document.getElementById("whoseturn").src="assets/computer.png";
            stateChange(-1);
        }
    }
}

function stateChange(newState) {
    setTimeout(function () {
        if (newState == -1) {
            makeAIMove();
        }
    }, 1000);
}

function makeAIMove() {
    var b1, b2;
    if (turn) {
        b1 = spaces_X;
        b2 = spaces_O;
    } else {
        b1 = spaces_O;
        b2 = spaces_X;
    }
    var best = -11, space = 0;
    for (var i = 0; i<possibleSpaces.length; i++) {
        var s = possibleSpaces[i];
        if (spaceTaken(getBoard(b1, b2), s)) continue;
        var board1 = b1 | s;
        var temp = minimax(board1, b2, 0, true, -11, 11);
        if (temp>best) {
            best = temp;
            space = s;
        }
    }
    if (turn) {
        spaces_X |= space;
    } else {
        spaces_O |= space;
    }
    checkWinner();
    updateGUI();
    turn = !turn;
    document.getElementById("whoseturn").src="assets/human.png";
}

//orignal = true: maximizer
//original = false: minimizer
//alpha is the best value from the maximizer
//best is the 'worst' value from the minimizer
function minimax(b1, b2, depth, original, alpha, beta) {
    var talpha = alpha + 0;
    var tbeta = beta + 0;
    var result = testForWinner(b1, b2, depth);
    if (result !=0 || getBoard(b1, b2)==FULL_BOARD) {
        return result;
    }
    original = !original;
    var mostLikelyScore = original ? -11 : 11;
    for (var i = 0; i<possibleSpaces.length; i++){
        var s = possibleSpaces[i];
        if (spaceTaken(getBoard(b1, b2), s)) continue;
        if (original){
            var nb1 = b1 | s;
            var s = minimax(nb1, b2, depth+1, original, talpha, tbeta);
            if (s >= mostLikelyScore) mostLikelyScore = s;
            talpha = mostLikelyScore;
            if (mostLikelyScore >= beta) return mostLikelyScore;
        } else {
            var nb2 = b2 | s;
            var s = minimax(b1, nb2, depth+1, original, talpha, tbeta);
            if (s <= mostLikelyScore) mostLikelyScore = s;
            tbeta = mostLikelyScore;
            if (mostLikelyScore <= alpha) return mostLikelyScore;
        }
    }
    return mostLikelyScore;
}

function spaceTaken(board, space) {
    return ((board&space)==space);
}

function reset() {
    //turn = true;
    spaces_O = 0;
    spaces_X = 0;
    document.getElementById("winner").className = "hidden";
    updateGUI();
    if (!turn) {
        makeAIMove();
    }
}

function getBoard(s1, s2) {
    return s1|s2;
}

function testForWinner(b1, b2, depth) {
    for (var i = 0; i<winningValues.length; i++) {
        var s = winningValues[i];
        if ((b1&s)==s) {
            return 10-depth;
        }
        else if ((b2&s)==s) {
            return depth-10;
        }
    }
    return 0;
}

function checkWinner() {
    var res = testForWinner(spaces_X, spaces_O, 0);
    if (res==10) {
        document.getElementById("windisplay").innerHTML = "HUMAN WINS!!";
        document.getElementById("winner").className = "shown";
        return "human";
    } else if (res==-10) {
        document.getElementById("windisplay").innerHTML = "COMPUTER WINS!!";
        document.getElementById("winner").className = "shown";
        return "computer";
    } else {
        if (getBoard(spaces_X, spaces_O)==FULL_BOARD) {
            document.getElementById("windisplay").innerHTML = "NOBODY WINS!!";
            document.getElementById("winner").className = "shown";
            return "tie";
        }
    }
    return "none";
}

function updateGUI() {
    for (var i = 0; i<9; i++) {
        var index = Math.pow(2, i);
        if ((spaces_X&index)==index) {
            document.getElementById(index).innerHTML = "X";
        }
        else if ((spaces_O&index)==index) {
            document.getElementById(index).innerHTML = "O";
        } else {
            document.getElementById(index).innerHTML = " ";
        }
    }
}
