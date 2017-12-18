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

function generateMaze() {
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

//attempts to move right. does nothing if current cell does not have a right door
function moveRight() {
    if (maze.hDoors[currentCell.x+1][currentCell.y]) {
        visitedCells.push({x:currentCell.x,y:currentCell.y});
        currentCell.x++;
    }
}

function moveLeft() {
    if (maze.hDoors[currentCell.x][currentCell.y]) {
        visitedCells.push({x:currentCell.x,y:currentCell.y});
        currentCell.x--;
    }
}

function moveUp() {
    if (maze.vDoors[currentCell.x][currentCell.y]) {
        visitedCells.push({x:currentCell.x,y:currentCell.y});
        currentCell.y--;
    }
}

function moveDown() {
    if (maze.vDoors[currentCell.x][currentCell.y+1]) {
        visitedCells.push({x:currentCell.x,y:currentCell.y});
        currentCell.y++;
    }
}

$(function(){
    $('#generate').click(generateMaze);
    $('#hCells').change(generateMaze);
    $('#vCells').change(generateMaze);
    $('#cellSizePx').change(drawMaze);
    $('#wallThicknessPx').change(drawMaze);
    generateMaze();
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