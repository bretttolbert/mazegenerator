var canvas, ctx;
var cellSizePx = 16; //cell size in pixels
var wallThicknessPx = 4; //thickness of cell walls
var hCells = 32;
var vCells = 32;
var maze;

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

function Maze(hCells, vCells) {
	//populate visited with unvisited cells
	this.hCells = hCells;
	this.vCells = vCells;
	this.visited = [];
	//doors are pathways between cells (broken walls)
	//struct Door { Cell c1; Cell c2; };
	//struct Cell { int x; int y; };
	this.doors = []; 
	for (var i=0; i<this.hCells; ++i) {
		var row = [];
		for (var j=0; j<this.vCells; ++j) {
			row.push(false);
		}
		this.visited.push(row);
	}
	
	/**
	 * @return boolean indicating whether the cell at the specified
	 * grid coordinates has been visited
	 */
	this.isVisited = function(x,y) {
		if (x < 0 || y < 0 || x >= this.hCells || y >= this.vCells) {
			throw "GridCoordinateOutOfBounds";
		}
		return this.visited[x][y];
	}
	
	this.addDoor = function(cell1,cell2) {
		//console.log('adding door between (' + cell1.x + ',' + cell1.y + ')'
		//	+ ' and (' + cell2.x + ',' + cell2.y + ')');
		this.doors.push({c1:{x:cell1.x,y:cell1.y},
						 c2:{x:cell2.x,y:cell2.y}});
	}
	
	/**
	 * Generates the maze
	 */
	this.generate = function() {
		var currentCell = {x:0,y:0};
		this.visited[currentCell.x][currentCell.y] = true;
		var stack = [];
		while (!this.allCellsVisited()) {
			var unvisitedNeighbors = this.getUnvisitedNeighbors(currentCell.x, currentCell.y);
			if (unvisitedNeighbors.length > 0) {
				var nextCell = randomChoice(unvisitedNeighbors);
				console.log('visiting (' + nextCell.x + ',' + nextCell.y + ')');
				this.visited[nextCell.x][nextCell.y] = true;
				stack.push(nextCell);
				//break the wall between currentCell and nextCell
				this.addDoor(currentCell, nextCell);
				currentCell = nextCell;
			} else {
				if (stack.length > 0) {
					currentCell = stack.pop();
				} else {
					console.log('Error: stack prematurely empty');
					return;
				}
			}
		}
		//console.log('all cells visited');
	}
	
	/**
	 * @return array of neighbors of the cell at the specified grid
	 * coordinates. Each element is an object with x and y members.
	 */
	this.getUnvisitedNeighbors = function(x,y) {
		if (x < 0 || y < 0 || x >= this.hCells || y >= this.vCells) {
			throw "GridCoordinateOutOfBounds";
		}
		var neighbors = [];
		//neighbor above?
		if (y-1 >= 0 && !this.visited[x][y-1]) {
			neighbors.push({x:x,y:y-1});
		}
		//neighbor below?
		if (y+1 < this.vCells && !this.visited[x][y+1]) {
			neighbors.push({x:x,y:y+1});
		}
		//neighbor to the left?
		if (x-1 >= 0 && !this.visited[x-1][y]) {
			neighbors.push({x:x-1,y:y});
		}
		//neighbor to the right?
		if (x+1 < this.hCells && !this.visited[x+1][y]) {
			neighbors.push({x:x+1,y:y});
		}
		return neighbors;
	}
	
	/**
	 * @return true if all cells have been visited
	 */
	this.allCellsVisited = function() {
		for (var i=0; i<this.hCells; ++i) {
			for (var j=0; j<this.vCells; ++j) {
				if (!this.visited[i][j]) {
					return false;
				}
			}
		}
		return true;
	}
	
	this.randomCell = function() {
		return {x: Math.floor(Math.random()*hCells),
				y: Math.floor(Math.random()*vCells)};
	}
}

function drawMaze() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0,0,canvas.width,canvas.height);
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
	//draw doors
	for (var i=0; i<maze.doors.length; ++i) {
		var door = maze.doors[i];
		ctx.fillStyle = 'white';
		//the two cells joined by a door are either side by side (same y value)
		//or on top of one another (same x value)
		if (door.c1.y == door.c2.y) {
			//side by side
			//console.log('side by side');
			//find min x
			var minX = min(door.c1.x, door.c2.x);
			//draw door
			ctx.fillRect((minX+1) * (cellSizePx+wallThicknessPx), 
			wallThicknessPx + door.c1.y * (cellSizePx+wallThicknessPx), 
			wallThicknessPx, cellSizePx);
		} else if (door.c1.x == door.c2.x) {		
			//on top of one another
			//console.log('on top of one another');
			//find min y
			var minY = min(door.c1.y, door.c2.y);
			//draw door
			ctx.fillRect(wallThicknessPx + door.c1.x * (cellSizePx+wallThicknessPx), 
			 (minY+1) * (cellSizePx+wallThicknessPx), 
			 cellSizePx, wallThicknessPx);
		}
	}
}

function generateMaze() {
	hCells = parseInt($('#hCells').val(), 10);
	console.log('hCells='+hCells);
	vCells = parseInt($('#vCells').val(), 10);
	console.log('vCells='+vCells);
	cellSizePx = parseInt($('#cellSizePx').val(), 10);
	console.log('cellSizePx='+cellSizePx);
	wallThicknessPx = parseInt($('#wallThicknessPx').val(), 10);
	console.log('wallThicknessPx='+wallThicknessPx);
	maze = new Maze(hCells, vCells);
	canvas = $('#canvas')[0];
	canvas.width = wallThicknessPx + maze.hCells * (cellSizePx + wallThicknessPx);
	canvas.height = wallThicknessPx + maze.vCells * (cellSizePx + wallThicknessPx);
	ctx = canvas.getContext('2d');
	ctx.fillStyle = 'black';
	maze.generate();
	drawMaze();
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

$(function(){
	$('#hCells').change(generateMaze);
	$('#vCells').change(generateMaze);
	$('#cellSizePx').change(generateMaze);
	$('#wallThicknessPx').change(generateMaze);
	generateMaze();
});