
var ACAConfig = {
    cols: 50,
    rows: 30,
    antNum: 50,
    iteratorNum: 100,
    p: 0.7,
    q: 500,
    alpha: 1,
    beta: 5,
    start: null,
    end: null,
    cellSize: 20,
    obstacles: [],
    isRunning: false
};

var pheromoneMatrix = [];
var heuristicMatrix = [];
var bestPath = [];
var bestPathLength = Infinity;

function getDistance(p1, p2) {
    var dx = Math.abs(p1.x - p2.x);
    var dy = Math.abs(p1.y - p2.y);
    return Math.sqrt(dx * dx + dy * dy);
}

function isObstacle(x, y) {
    for (var i = 0; i < ACAConfig.obstacles.length; i++) {
        if (ACAConfig.obstacles[i].x === x && ACAConfig.obstacles[i].y === y) {
            return true;
        }
    }
    return false;
}

function isValidPosition(x, y) {
    return x >= 0 && x < ACAConfig.cols && y >= 0 && y < ACAConfig.rows && !isObstacle(x, y);
}

function getNeighbors(x, y, visited) {
    var neighbors = [];
    var directions = [
        {dx: -1, dy: 0}, {dx: 1, dy: 0},
        {dx: 0, dy: -1}, {dx: 0, dy: 1},
        {dx: -1, dy: -1}, {dx: 1, dy: -1},
        {dx: -1, dy: 1}, {dx: 1, dy: 1}
    ];
    for (var i = 0; i < directions.length; i++) {
        var nx = x + directions[i].dx;
        var ny = y + directions[i].dy;
        if (isValidPosition(nx, ny) && !isVisited(visited, nx, ny)) {
            neighbors.push({x: nx, y: ny});
        }
    }
    return neighbors;
}

function isVisited(visited, x, y) {
    for (var i = 0; i < visited.length; i++) {
        if (visited[i].x === x && visited[i].y === y) {
            return true;
        }
    }
    return false;
}

function initPheromoneMatrix() {
    pheromoneMatrix = [];
    for (var i = 0; i < ACAConfig.rows; i++) {
        pheromoneMatrix[i] = [];
        for (var j = 0; j < ACAConfig.cols; j++) {
            pheromoneMatrix[i][j] = 1;
        }
    }
}

function initHeuristicMatrix() {
    heuristicMatrix = [];
    for (var i = 0; i < ACAConfig.rows; i++) {
        heuristicMatrix[i] = [];
        for (var j = 0; j < ACAConfig.cols; j++) {
            if (isObstacle(j, i)) {
                heuristicMatrix[i][j] = 0;
            } else {
                var dist = getDistance({x: j, y: i}, ACAConfig.end);
                heuristicMatrix[i][j] = 1 / (dist + 1);
            }
        }
    }
}

function calculatePathLength(path) {
    var length = 0;
    for (var i = 1; i < path.length; i++) {
        length += getDistance(path[i-1], path[i]);
    }
    return length;
}

function selectNextPosition(current, visited) {
    var neighbors = getNeighbors(current.x, current.y, visited);
    
    if (neighbors.length === 0) {
        return null;
    }
    
    var total = 0;
    var probabilities = [];
    
    for (var i = 0; i < neighbors.length; i++) {
        var n = neighbors[i];
        var pheromone = Math.pow(pheromoneMatrix[n.y][n.x], ACAConfig.alpha);
        var heuristic = Math.pow(heuristicMatrix[n.y][n.x], ACAConfig.beta);
        var prob = pheromone * heuristic;
        probabilities.push(prob);
        total += prob;
    }
    
    if (total === 0) {
        return neighbors[Math.floor(Math.random() * neighbors.length)];
    }
    
    var random = Math.random() * total;
    var cumulative = 0;
    for (var i = 0; i < probabilities.length; i++) {
        cumulative += probabilities[i];
        if (cumulative >= random) {
            return neighbors[i];
        }
    }
    
    return neighbors[neighbors.length - 1];
}

function antFindPath() {
    var path = [{x: ACAConfig.start.x, y: ACAConfig.start.y}];
    var visited = [{x: ACAConfig.start.x, y: ACAConfig.start.y}];
    var current = {x: ACAConfig.start.x, y: ACAConfig.start.y};
    
    var maxSteps = ACAConfig.cols * ACAConfig.rows * 2;
    var steps = 0;
    
    while (steps < maxSteps && !(current.x === ACAConfig.end.x && current.y === ACAConfig.end.y)) {
        var next = selectNextPosition(current, visited);
        if (next === null) {
            return null;
        }
        path.push({x: next.x, y: next.y});
        visited.push({x: next.x, y: next.y});
        current = {x: next.x, y: next.y};
        steps++;
    }
    
    if (current.x === ACAConfig.end.x && current.y === ACAConfig.end.y) {
        return path;
    }
    return null;
}

function updatePheromone(paths, pathLengths) {
    for (var i = 0; i < ACAConfig.rows; i++) {
        for (var j = 0; j < ACAConfig.cols; j++) {
            pheromoneMatrix[i][j] *= ACAConfig.p;
        }
    }
    
    for (var k = 0; k < paths.length; k++) {
        var path = paths[k];
        var length = pathLengths[k];
        var delta = ACAConfig.q / length;
        
        for (var i = 0; i < path.length; i++) {
            var pos = path[i];
            pheromoneMatrix[pos.y][pos.x] += delta;
        }
    }
}

function acaSearchOneIteration() {
    var validPaths = [];
    var validPathLengths = [];
    
    for (var i = 0; i < ACAConfig.antNum; i++) {
        var path = antFindPath();
        if (path !== null) {
            var length = calculatePathLength(path);
            validPaths.push(path);
            validPathLengths.push(length);
            
            if (length < bestPathLength) {
                bestPathLength = length;
                bestPath = path.slice();
            }
        }
    }
    
    if (validPaths.length > 0) {
        updatePheromone(validPaths, validPathLengths);
    }
    
    return {
        validPaths: validPaths,
        bestPath: bestPath,
        bestPathLength: bestPathLength
    };
}

function resetACA() {
    bestPath = [];
    bestPathLength = Infinity;
    ACAConfig.isRunning = false;
}

function initACA() {
    if (!ACAConfig.start || !ACAConfig.end) {
        return false;
    }
    initPheromoneMatrix();
    initHeuristicMatrix();
    bestPath = [];
    bestPathLength = Infinity;
    return true;
}
