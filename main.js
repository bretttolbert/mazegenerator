var canvas, ctx;
var cellSizePx = 16; //cell size in pixels
var wallThicknessPx = 4; //thickness of cell walls
var hCells = 32;
var vCells = 32;
var maze;
var currentCell = {x:0,y:0};
var visitedCells = [];
var phpSaveImage = false;

/**
 * @return random element from array
 */
function randomChoice(choices) {
    return choices[Math.floor(Math.random()*choices.length)];
}

function min(a, b) {
    if (a <= b) {
        return a;
    } else {
        return b;
    }
}

function max(a, b) {
    if (a >= b) {
        return a;
    } else {
        return b;
    }
}

function drawMaze() {
    cellSizePx = parseInt($('#cellSizePx').val(), 10);
    wallThicknessPx = parseInt($('#wallThicknessPx').val(), 10);
    canvas.width = wallThicknessPx + maze.hCells * (cellSizePx + wallThicknessPx);
    canvas.height = wallThicknessPx + maze.vCells * (cellSizePx + wallThicknessPx);
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    //draw cells
    for (var i=0; i<maze.hCells; ++i) {
        for (var j=0; j<maze.vCells; ++j) {
            ctx.fillStyle = 'white';
            if (maze.isVisited(i,j)) {
                ctx.fillRect(wallThicknessPx + i*(cellSizePx+wallThicknessPx),
                             wallThicknessPx + j*(cellSizePx+wallThicknessPx),
                             cellSizePx,cellSizePx);
            }
        }
    }
    //draw hDoors
    for (var i=0; i<maze.hDoors.length; ++i) {
        for (var j=0; j<maze.hDoors[i].length; ++j) {
            if (maze.hDoors[i][j]) {
                ctx.fillRect(i * (cellSizePx+wallThicknessPx), 
                wallThicknessPx + j * (cellSizePx+wallThicknessPx), 
                wallThicknessPx, cellSizePx);
            }
        }
    }
    //draw vDoors
    for (var i=0; i<maze.vDoors.length; ++i) {
        for (var j=0; j<maze.vDoors[i].length; ++j) {
            if (maze.vDoors[i][j]) {
                ctx.fillRect(wallThicknessPx + i * (cellSizePx+wallThicknessPx), 
                j * (cellSizePx+wallThicknessPx), 
                cellSizePx, wallThicknessPx);
            }
        }
    }
    //draw visitedCells
    ctx.fillStyle = '#ddd';
    for (var i=0; i<visitedCells.length; ++i) {
        var x = wallThicknessPx + visitedCells[i].x * (cellSizePx+wallThicknessPx);
        var y = wallThicknessPx + visitedCells[i].y * (cellSizePx+wallThicknessPx)
        ctx.fillRect(x,y,cellSizePx,cellSizePx);
        //ctx.beginPath();
        //ctx.arc(x+cellSizePx/2, y+cellSizePx/2, cellSizePx/4, 0, Math.PI*2, true); 
        //ctx.closePath();
        //ctx.fill();
    }
    //draw currentCell
    ctx.fillStyle = 'red';
    ctx.fillRect(wallThicknessPx + currentCell.x * (cellSizePx+wallThicknessPx),
             wallThicknessPx + currentCell.y * (cellSizePx+wallThicknessPx),
             cellSizePx,cellSizePx);
}

function generateMaze(prompt_for_confirm) {

    if (prompt_for_confirm) {
        let text = "Regenerate maze? Are you sure?\nPress OK or Cancel.";
        if (!confirm(text)) {
            return;
        }
    }

    currentCell = {x:0,y:0};
    visitedCells = [];
    hCells = parseInt($('#hCells').val(), 10);
    vCells = parseInt($('#vCells').val(), 10);
    maze = new Maze(hCells, vCells);
    canvas = $('#canvas')[0];
    canvas.width = wallThicknessPx + maze.hCells * (cellSizePx + wallThicknessPx);
    canvas.height = wallThicknessPx + maze.vCells * (cellSizePx + wallThicknessPx);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    maze.generate();
    drawMaze();
    if (phpSaveImage) {
        var canvasData = canvas.toDataURL("image/png");
        $.post('saveImage.php', {canvasData:canvasData}, function(response) {
            if (response.wasSuccessful) {
                $('#saveLink').html('<a href="' + response.filename + '">Download PNG</a>');
            } else {
                console.log(response.errorMessage);
            }
        })
        .error(function(jqXHR, textStatus, errorThrown) { 
            console.log("Error: " + textStatus); 
        })
    }
}

function regenerateMaze() {
    generateMaze(true);
}

function regenerateMazeNoConfirm() {
    generateMaze(false);
}

function setHCells(val) {
    hCells = val;
    $('#hCells').val(val);
}

function setVCells(val) {
    vCells = val;
    $('#vCells').val(val);
}

function levelUp() {
    var audioPowerup = new Audio('sounds/powerup.mp3');
    audioPowerup.play();
    setVCells(vCells + 1);
    setHCells(hCells + 1);
    regenerateMazeNoConfirm();
}

//check if user has won the game by reaching the exit
function checkFoundExit() {
    if (currentCell.x < 0 || currentCell.y < 0 || currentCell.x >= hCells || currentCell.y >= vCells) {
        if (vCells >= 32) {
            alert("You won the game!");
            window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        } else {
            levelUp();
        }
    }
}

//attempts to move right. does nothing if current cell does not have a right door
function moveRight() {
    if (maze.hDoors[currentCell.x+1][currentCell.y]) {
        visitedCells.push({x:currentCell.x,y:currentCell.y});
        currentCell.x++;
        checkFoundExit();
    }
}

function moveLeft() {
    if (maze.hDoors[currentCell.x][currentCell.y]) {
        visitedCells.push({x:currentCell.x,y:currentCell.y});
        currentCell.x--;
        checkFoundExit();
    }
}

function moveUp() {
    if (maze.vDoors[currentCell.x][currentCell.y]) {
        visitedCells.push({x:currentCell.x,y:currentCell.y});
        currentCell.y--;
        checkFoundExit();
    }
}

function moveDown() {
    if (maze.vDoors[currentCell.x][currentCell.y+1]) {
        visitedCells.push({x:currentCell.x,y:currentCell.y});
        currentCell.y++;
        checkFoundExit();
    }
}

function handleClickBtnUp() {
    moveUp();
    drawMaze();
}

function handleClickBtnDown() {
    moveDown();
    drawMaze();
}

function handleClickBtnLeft() {
    moveLeft();
    drawMaze();
}

function handleClickBtnRight() {
    moveRight();
    drawMaze();
}



$(function(){
    $('#generateBtn').click(regenerateMaze);
    $('#upBtn').click(handleClickBtnUp);
    $('#downBtn').click(handleClickBtnDown);
    $('#leftBtn').click(handleClickBtnLeft);
    $('#rightBtn').click(handleClickBtnRight);
    //$('#hCells').change(regenerateMaze);
    //$('#vCells').change(regenerateMaze);
    $('#cellSizePx').change(drawMaze);
    $('#wallThicknessPx').change(drawMaze);
    regenerateMazeNoConfirm();
    $(document).keydown(function(e){
        if (e.keyCode == 37 || e.keyCode == 38 
         || e.keyCode == 39 || e.keyCode == 40) {
            if (e.keyCode == 37) {
                //left
                console.log('left');
                moveLeft();
            } else if (e.keyCode == 39) {
                //right
                console.log('right');
                moveRight();
            } else if (e.keyCode == 38) {
                //up
                console.log('up');
                moveUp();
            } else if (e.keyCode == 40) {
                //down
                console.log('down');
                moveDown();
            }
            drawMaze();
            return false;
        }
    });
});