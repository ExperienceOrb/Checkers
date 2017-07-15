var turn = true;
var winner = 0;

var possibleMoves = [];
var selected = null;
var mustPlayerJump = false;

game_board = [
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
    for (var row = 0; row < game_board.length; row++){
        var tabrow = document.createElement('div');
        $tr = $(tabrow);
        $tr.css({height:rowheight});
        $tr.addClass('eight');
        $tr.addClass('column');
        $tr.addClass('row');
        $table.append($tr);
        for (var column = 0; column < game_board[row].length; column++){
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
                    if (game_board[row][column]%2==1){
                        selected = $element;
                        $($element.children[0]).addClass('selected');
                        possibleMoves = getPossibleMoves(game_board, row, column, true);
                        for (var i = 0; i<possibleMoves.length; i++){
                            $cell = $($('.grid').children()[possibleMoves[i][0]]).children()[possibleMoves[i][1]];
                            $img = $($cell.children[0]);
                            if (possibleMoves[i][2]=='n')
                                $img.css('background-color', 'rgba(0, 255, 0, .75)');
                            else if (possibleMoves[i][2]=='j')
                                $img.css('background-color', 'rgba(0, 0, 255, .75)');
                        }
                    } else {
                        movePieceHuman(game_board, row, column);
                    }
                }
            });
            setCellPiece(row, column, game_board[row][column]);
        }
    }
});

function movePieceHuman(board, row, column){
    $cell = $($('.grid').children()[row]).children()[column];
    $img = $($cell.children[0]);
    oldRow = Math.round(selected.offsetParent.offsetTop/selected.clientHeight);
    oldColumn = Math.round(selected.offsetLeft/selected.clientWidth);
    var pm = getPossibleMoves(board, oldRow, oldColumn, true, false);
    for (var i = 0; i<pm.length; i++){
        if (row == pm[i][0] && column == pm[i][1]){
            movePiece(board, oldRow, oldColumn, row, column);
            setCellPiece(oldRow, oldColumn, board[oldRow][oldColumn]);
            setCellPiece(row, column, board[row][column]);
            if (!mustPlayerJump || !mustDoubleJump(board, row, column, true)){
                changeTurn();
            }
            break;
        }
    }
    $img.css('background-color', '');
}

function movePiece(board, oldRow, oldColumn, row, column, aitest){
    if (Math.abs(oldRow-row)==1){//Normal move
        board[row][column] = board[oldRow][oldColumn];
        board[oldRow][oldColumn] = 0;
    } else {//Must be a jump
        board[row][column] = board[oldRow][oldColumn];
        board[oldRow][oldColumn] = 0;
        delRow = oldRow + (row-oldRow)/2;
        delCol = oldColumn + (column-oldColumn)/2;
        board[delRow][delCol] = 0;
        if (!aitest)
            setCellPiece(delRow, delCol, board[delRow][delCol]);
    }
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

function playerMustJump(board, human){
    for (var i = 1; i<64; i++){
        var p = board[Math.floor(i/8)][i%8];
        if (p>0 && p%2==human){
            var moves = getPossibleMoves(board, Math.floor(i/8), i%8, human, true);
            for (var j = 0; j<moves.length; j++){
                if (moves[j][2]=='j') {
                    return true;
                }
            }
        }
    }
    return false;
}

function mustDoubleJump(board, row, column, human){
    var moves = getPossibleMoves(board, row, column, human, true);
    for (var i = 0; i<moves.length; i++){
        if (moves[i][2]=='j'){
            return true;
        }
    }
    return false;
}

function getAllPossibleMoves(board, human){
    ret = []; //[oldRow, oldColumn, newRow, newColumn, moveType]
    for (var i = 1; i<64; i++){
        r = Math.floor(i/8);
        c = i%8;
        var p = board[r][c];
        if (p>0 && p%2==human){
            var moves = getPossibleMoves(board, r, c, human);
            for (var j = 0; j<moves.length; j++){
                ret.push([r, c, moves[j][0], moves[j][1], moves[j][2]]);
            }
        }
    }
    return ret;
}

function getPossibleMoves(board, row, column, human, testForJump){
    var dir = human * -2 + 1;
    var ret = [];
    if (row + dir <=7 && row + dir >= 0){
        if (!mustPlayerJump){
            if (column-1 >=0 && board[row+dir][column-1]==0){
                ret.push([row+dir, column-1, 'n']);
            }
            if (column+1 <= 7 && board[row+dir][column+1]==0){
                ret.push([row+dir, column+1, 'n']);
            }
        }
        if (playerMustJump || testForJump){
            if (board[row+dir][column-1]%2 != board[row][column]%2 && board[row+dir][column-1] > 0){
                if (row + dir*2 <= 7 && row + dir*2 >= 0 && column-2 >= 0){
                    if (board[row + dir*2][column-2]==0){
                        ret.push([row + dir*2, column-2, 'j']);
                    }
                }
            }
            if (board[row+dir][column+1]%2 != board[row][column]%2 && board[row+dir][column+1] > 0){
                if (row + dir*2 <= 7 && row + dir*2 >= 0 && column+2 <= 7){
                    if (board[row + dir*2][column+2]==0){
                        ret.push([row + dir*2, column+2, 'j']);
                    }
                }
            }
        }
    }
    if (board[row][column]>2){
        //TODO: Add king moving mechanics
        dir *= -1;
        if (row + dir <=7 && row + dir >= 0){
            if (!mustPlayerJump){
                if (column-1 >=0 && board[row+dir][column-1]==0){
                    ret.push([row+dir, column-1, 'n']);
                }
                if (column+1 <= 7 && board[row+dir][column+1]==0){
                    ret.push([row+dir, column+1, 'n']);
                }
            }
            if (playerMustJump || testForJump){
                if (board[row+dir][column-1]%2 != board[row][column]%2 && board[row+dir][column-1] > 0){
                    if (row + dir*2 <= 7 && row + dir*2 >= 0 && column-2 >= 0){
                        if (board[row + dir*2][column-2]==0){
                            ret.push([row + dir*2, column-2, 'j']);
                        }
                    }
                }
                if (board[row+dir][column+1]%2 != board[row][column]%2 && board[row+dir][column+1] > 0){
                    if (row + dir*2 <= 7 && row + dir*2 >= 0 && column+2 <= 7){
                        if (board[row + dir*2][column+2]==0){
                            ret.push([row + dir*2, column+2, 'j']);
                        }
                    }
                }
            }
        }
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

function doKingCheck(board){
    for (var i = 1; i<8; i+=2){
        if (board[0][i]==1){
            board[0][i] = 3;
            setCellPiece(0, i, 3);
        }
        if (board[7][i-1]==2){
            board[7][i-1] = 4;
            setCellPiece(7, i-1, 4);
        }
    }
}

function changeTurn() {
    turn = !turn;
    selected = null;
    possibleMoves = [];
    mustPlayerJump = playerMustJump(game_board, turn);
    doKingCheck(game_board);
    if (turn){
        document.getElementById("whoseturn").src="assets/human.png";
    } else {
        document.getElementById("whoseturn").src="assets/computer.png";
        setTimeout(function(){
            makeAIMove();
        }, 100);
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
    var moves = getAllPossibleMoves(game_board, false);
    var move = [];
    if (moves.length==1){
        //Obviously dont need to find the best outcome...
        move = moves[0];
        movePiece(game_board, move[0], move[1], move[2], move[3]);
        setCellPiece(move[2], move[3], game_board[move[2]][move[3]]);
        setCellPiece(move[0], move[1], game_board[move[0]][move[1]]);
    } else {
        //fucking minimax the shit out of this bitch
        var best = -1000;
        move = moves[0];
        for (var i = 0; i<moves.length; i++){
            var m = moves[i];
            var tboard = game_board.slice();
            for (var j = 0; j<game_board.length; j++){
                tboard[j] = game_board[j].slice();
            }
            movePiece(tboard, m[0], m[1], m[2], m[3], true);
            if (mustPlayerJump && mustDoubleJump(tboard, m[2], m[3], false)){
                m = getPossibleMoves(tboard, m[2], m[3], false, false);
                movePiece(tboard, m[0], m[1], m[2], m[3], true);
            }
            var score = minimax(tboard, 0, true, -1000, 1000);
            if (score > best){
                best = score;
                move = m;
            }
        }
        console.log(best);
        movePiece(game_board, move[0], move[1], move[2], move[3]);
        setCellPiece(move[2], move[3], game_board[move[2]][move[3]]);
        setCellPiece(move[0], move[1], game_board[move[0]][move[1]]);
    }
    if (!mustPlayerJump || !mustDoubleJump(game_board, move[2], move[3], false)){
        changeTurn();
    } else {
        aiDoubleJump(move[2], move[3]);
    }
}

function aiDoubleJump(row, column){
    var move = getPossibleMoves(game_board, row, column, false, false)[0];
    movePiece(game_board, row, column, move[0], move[1]);
    setCellPiece(move[0], move[1], game_board[move[0]][move[1]]);
    setCellPiece(row, column, game_board[row][column]);
    if (mustDoubleJump(game_board, move[0], move[1], false)){
        aiDoubleJump(move[0], move[1]);
    } else {
        changeTurn();
    }
}

//orignal = true: maximizer
//original = false: minimizer
//alpha is the best value from the maximizer
//best is the 'worst' value from the minimizer
function minimax(board, depth, ai, alpha, beta) {
    var result = scoreBoardAI(board, depth);
    if (Math.abs(result) > 80 || depth == 10) {
        return result;
    }
    var talpha = alpha + 0;
    var tbeta = beta + 0;
    ai = !ai;
    var mostLikelyScore = ai ? -1000 : 1000;
    var possibleSpaces = getAllPossibleMoves(board, !ai);
    for (var i = 0; i<possibleSpaces.length; i++){
        var m = possibleSpaces[i];
        var tboard = board.slice();
        for (var j = 0; j<board.length; j++){
            tboard[j] = board[j].slice();
        }
        movePiece(tboard, m[0], m[1], m[2], m[3], true);
        if (mustPlayerJump && mustDoubleJump(tboard, m[2], m[3], false)){
            m = getPossibleMoves(tboard, m[2], m[3], false, false);
            movePiece(tboard, m[0], m[1], m[2], m[3], true);
        }
        var s = minimax(tboard, depth+1, ai, talpha, tbeta);
        if (ai){
            if (s >= mostLikelyScore) mostLikelyScore = s;
            talpha = mostLikelyScore;
            if (mostLikelyScore >= beta) return mostLikelyScore;
        } else {
            if (s <= mostLikelyScore) mostLikelyScore = s;
            tbeta = mostLikelyScore;
            if (mostLikelyScore <= alpha) return mostLikelyScore;
        }
    }
    return mostLikelyScore;
}

function scoreBoardAI(board, depth){
    if (testForWinner(board, false)==1){
        return 1000-depth;
    }
    if (testForWinner(board, false)==-1){
        return depth-1000;
    }
    var sum = 0;
    for (var i = 0; i<64; i++){
        var p = board[Math.floor(i/8)][i%8];
        if (p==1){
            sum -= 1;
        } else if (p==2){
            sum += 1;
        } else if (p==3){
            sum -= 2;
        } else if (p==4){
            sum += 2;
        }
    }
    return sum;
}

function testForWinner(board, human){
    var countSelf = 0;
    var countOpponent = 0;
    var opponent = human?0:1;
    for (var i = 0; i<64; i++){
        var p = board[Math.floor(i/8)][i%8];
        if (p==0){
            //IGNORE
        }
        else if (p%2==opponent){
            countOpponent++;
        } else {
            countSelf++;
        }
    }
    if (countOpponent==0){
        return 1;
    }
    if (countSelf==0){
        return -1;
    }
    return 0;
}
