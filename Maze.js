function Maze(hCells, vCells) {
    //populate visited with unvisited cells
    this.hCells = hCells;
    this.vCells = vCells;
    
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
        //  + ' and (' + cell2.x + ',' + cell2.y + ')');                         
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
}