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
	this.currentCell = {x:0,y:0};
	this.visitedCells = [];
	
	//visited is a 2d array (dimensions hCells by vCells) for keeping track of
	//which cells have been visited
	this.visited = [];
	for (var i=0; i<this.hCells; ++i) {
		var row = [];
		for (var j=0; j<this.vCells; ++j) {
			row.push(false);
		}
		this.visited.push(row);
	}
	
	//hDoors and vDoors are 2d arrays representing
	//pathways between cells. By default, each cell is surrounded by 
	//four walls. Walls can be broken by creating a horizontal or vertical door.
	//true means door exists. false means door does not exist, i.e. wall.
	
	//hDoors (dimensions hCells+1 by vCells)
	//hDoors[0][0] is the left door of cell (0,0)
	//hDoors[1][0] is the right door of cell (0,0) and left door of cell (1,0)
	//hDoors[hCells][0] is the right door of cell (hCells-1,0)
	//hDoors[hCells][vCells-1] is the right door of cell (hCells-1,vCells-1)
	this.hDoors = [];
	for (var i=0; i<this.hCells+1; ++i) {
		var row = []
		for (var j=0; j<this.vCells; ++j) {
			row.push(false);
		}
		this.hDoors.push(row);
	}
	
	//vDoors (dimensions hCells by vCells+1)
	//vDoors[0][0] is the top door of cell (0,0)
	//vDoors[0][1] is the bottom door of cell (0,0) and the top door of cell (0,1)
	//vDoors[0][vCells] is the bottom door of cell (0,vCells-1)
	//vDoors[hCells-1][vCells] is the bottom door of cell (hCells-1,vCells-1)
	this.vDoors = [];
	for (var i=0; i<this.hCells; ++i) {
		var row = []
		for (var j=0; j<this.vCells+1; ++j) {
			row.push(false);
		}
		this.vDoors.push(row);
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
		if (cell1.y == cell2.y) {
			//add an hDoor
			var maxX = max(cell1.x, cell2.x);
			this.hDoors[maxX][cell1.y] = true;
		} else if (cell1.x == cell2.x) {
			//add a vDoor
			var maxY = max(cell1.y, cell2.y);
			this.vDoors[cell1.x][maxY] = true;
		} else {
			throw "CellsArentAdjacentCannotCreateDoor";
		}
	}
	
	/**
	 * Generates the maze
	 */
	this.generate = function() {
		//create maze entrance
		this.hDoors[0][0] = true;
		this.hDoors[hCells][vCells-1] = true;
		var currentCell = {x:0,y:0};
		this.visited[currentCell.x][currentCell.y] = true;
		var stack = [];
		while (!this.allCellsVisited()) {
			var unvisitedNeighbors = this.getUnvisitedNeighbors(currentCell.x, currentCell.y);
			if (unvisitedNeighbors.length > 0) {
				var nextCell = randomChoice(unvisitedNeighbors);
				//console.log('visiting (' + nextCell.x + ',' + nextCell.y + ')');
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
	
	//attempts to move right. does nothing if current cell does not have a right door
	this.moveRight = function() {
		if (this.hDoors[this.currentCell.x+1][this.currentCell.y]) {
			this.visitedCells.push({x:this.currentCell.x,y:this.currentCell.y});
			this.currentCell.x++;
		}
	}
	
	this.moveLeft = function() {
		if (this.hDoors[this.currentCell.x][this.currentCell.y]) {
			this.visitedCells.push({x:this.currentCell.x,y:this.currentCell.y});
			this.currentCell.x--;
		}
	}
	
	this.moveUp = function() {
		if (this.vDoors[this.currentCell.x][this.currentCell.y]) {
			this.visitedCells.push({x:this.currentCell.x,y:this.currentCell.y});
			this.currentCell.y--;
		}
	}
	
	this.moveDown = function() {
		if (this.vDoors[this.currentCell.x][this.currentCell.y+1]) {
			this.visitedCells.push({x:this.currentCell.x,y:this.currentCell.y});
			this.currentCell.y++;
		}
	}
}

function drawMaze() {
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
	for (var i=0; i<maze.visitedCells.length; ++i) {
		ctx.fillRect(wallThicknessPx + maze.visitedCells[i].x * (cellSizePx+wallThicknessPx),
				 wallThicknessPx + maze.visitedCells[i].y * (cellSizePx+wallThicknessPx),
				 cellSizePx,cellSizePx);
	}
	//draw currentCell
	ctx.fillStyle = 'red';
	ctx.fillRect(wallThicknessPx + maze.currentCell.x * (cellSizePx+wallThicknessPx),
			 wallThicknessPx + maze.currentCell.y * (cellSizePx+wallThicknessPx),
			 cellSizePx,cellSizePx);
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
	ctx.fillRect(0,0,canvas.width,canvas.height);
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
	$(document).keydown(function(e){
		if (e.keyCode == 37 || e.keyCode == 38 
		 || e.keyCode == 39 || e.keyCode == 40) {
			if (e.keyCode == 37) {
				//left
				console.log('left');
				maze.moveLeft();
			} else if (e.keyCode == 39) {
				//right
				console.log('right');
				maze.moveRight();
			} else if (e.keyCode == 38) {
				//up
				console.log('up');
				maze.moveUp();
			} else if (e.keyCode == 40) {
				//down
				console.log('down');
				maze.moveDown();
			}
			drawMaze();
			return false;
		}
	});
});