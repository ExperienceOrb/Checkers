var turn = true;
var winner = 0;

var possibleMoves = [];
var selected = null;
var mustPlayerJump = false;

board = [
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 0, 0, 2, 0],
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
            if (row%2!=column%2){
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
            $cell.click(function(){
                if (turn){
                    clearSelections();
                    $element = $(this)[0];
                    var row = Math.round($element.offsetParent.offsetTop/$element.clientHeight);
                    var column = Math.round($element.offsetLeft/$element.clientWidth);
                    if (board[row][column]%2==1){
                        selected = $element;
                        $($element.children[0]).addClass('selected');
                        possibleMoves = getPossibleMoves(board, row, column, true);
                        for (var i = 0; i<possibleMoves.length; i++){
                            $cell = $($('.grid').children()[possibleMoves[i][0]]).children()[possibleMoves[i][1]];
                            $img = $($cell.children[0]);
                            if (possibleMoves[i][2]=='n')
                                $img.css('background-color', 'rgba(0, 255, 0, .75)');
                            else if (possibleMoves[i][2]=='j')
                                $img.css('background-color', 'rgba(0, 0, 255, .75)');
                        }
                    } else {
                        movePiece(board, row, column);
                    }
                }
            });
            setCellPiece(row, column, board[row][column]);
        }
    }
});

function movePiece(board, row, column){
    $cell = $($('.grid').children()[row]).children()[column];
    $img = $($cell.children[0]);
    if ($img.css('background-color')=='rgba(0, 255, 0, 0)'){
        oldRow = Math.round(selected.offsetParent.offsetTop/selected.clientHeight);
        oldColumn = Math.round(selected.offsetLeft/selected.clientWidth);
        board[row][column] = board[oldRow][oldColumn];
        board[oldRow][oldColumn] = 0;
        setCellPiece(oldRow, oldColumn, board[oldRow][oldColumn]);
        setCellPiece(row, column, board[row][column]);
        changeTurn();
    } else if ($img.css('background-color')=='rgba(0, 0, 255, 0)'){
        //TODO: remove jumped piece
        oldRow = Math.round(selected.offsetParent.offsetTop/selected.clientHeight);
        oldColumn = Math.round(selected.offsetLeft/selected.clientWidth);
        board[row][column] = board[oldRow][oldColumn];
        board[oldRow][oldColumn] = 0;
        setCellPiece(oldRow, oldColumn, board[oldRow][oldColumn]);
        setCellPiece(row, column, board[row][column]);
        changeTurn();
    }
    $img.css('background-color', '');
}

function clearSelections(){
    if (selected)
        $(selected.children[0]).removeClass('selected');
    for (var i = 0; i<possibleMoves.length; i++){
        $cell = $($('.grid').children()[possibleMoves[i][0]]).children()[possibleMoves[i][1]];
        $img = $($cell.children[0]);
        $img.css('background-color', transparentRGBA($img.css('background-color')));
    }
    possibleMoves = [];
}

function transparentRGBA(value){
    old = value.substring(0, value.lastIndexOf(',')+1);
    return old+' 0)';
}

function mustPlayerJump(board, human){
    for (var i = 0; i<64; i++){
        var p = board[Math.floor(i/8)][i%8];
        if (p%2==human){
            var moves = getPossibleMoves(board, Math.floor(i/8), i%8, human);
            for (var j = 0; j<moves.length; j++){
                if (moves[j][2]=='j') return true;
            }
        }
    }
    return false;
}

//TODO: If a jump is available from another piece, this piece should have no available moves............
function getPossibleMoves(board, row, column, human){
    var dir = human * -2 + 1;
    var ret = [];
    if (row + dir <=7 && row + dir >= 0){
        if (column-1 >=0 && board[row+dir][column-1]==0){
            if (!mustPlayerJump){
                ret.push([row+dir, column-1, 'n']);
            }
        } else {
            if (board[row+dir][column-1]%2!=board[row][column]%2){
                if (row + dir*2 <= 7 && row + dir*2 >= 0 && column-2 >= 0){
                    if (board[row + dir*2][column-2]==0){
                        ret.push([row + dir*2, column-2, 'j']);
                    }
                }
            }
        }
        if (column+1 <= 7 && board[row+dir][column+1]==0){
            if (!mustPlayerJump){
                ret.push([row+dir, column+1, 'n']);
            }
        } else {
            if (board[row+dir][column+1]%2!=board[row][column]%2){
                if (row + dir*2 <= 7 && row + dir*2 >= 0 && column+2 >= 0){
                    if (board[row + dir*2][column+2]==0){
                        ret.push([row + dir*2, column+2, 'j']);
                    }
                }
            }
        }
    }
    if (board[row][column]>2){
        //TODO: Add king moving mechanics
    }
    return ret;
}

function setCellPiece(row, column, piece){
    $cell = $($('.grid').children()[row]).children()[column];
    $img = $($cell.children[0]);
    if (piece==0){
        $img.removeClass('black');
        $img.removeClass('white');
        $img.removeClass('blackking');
        $img.removeClass('whiteking');
        $img.removeClass('piece');
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

function changeTurn() {
    turn = !turn;
    document.getElementById("whoseturn").src="assets/computer.png";
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
