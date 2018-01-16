
/** 任务集合(tasks[i]表示第i个任务的长度) */
var tasks = [];
// 任务数量
var taskNum = 100;

/** 处理节点集合(nodes[i]表示第i个处理节点的处理速度) */
var nodes = [];
// 处理节点数量
var nodeNum = 10;

/** 任务长度取值范围 */
var taskLengthRange = [10,100];
/** 节点处理速度取值范围 */
var nodeSpeendRange = [10,100];

/** 迭代次数 */
var iteratorNum = 100;

/** 蚂蚁的数量 */
var antNum = 100;

/** 任务处理时间矩阵(记录单个任务在不同节点上的处理时间) */
var timeMatrix = [];

/** 信息素矩阵(记录每条路径上当前信息素含量，初始状态下均为0) */
var pheromoneMatrix = [];

/** 最大信息素的下标矩阵(存储当前信息素矩阵中每行最大信息素的下标) */
var maxPheromoneMatrix = [];

/** 一次迭代中，随机分配的蚂蚁临界编号(该临界点之前的蚂蚁采用最大信息素下标，而该临界点之后的蚂蚁采用随机分配) */
var criticalPointMatrix = [];

/** 任务处理时间结果集([迭代次数][蚂蚁编号]) */
var resultData = [];

/** 每次迭代信息素衰减的比例 */
var p = 0.5;

/** 每次经过，信息素增加的比例 */
var q = 2;

/**
 * 参数校验
 * @param _taskNum 任务数量
 * @param _nodeNum 节点数量
 * @param _iteratorNum 迭代次数
 * @param _antNum 蚂蚁数量
 */
function checkParam(_taskNum, _nodeNum, _iteratorNum, _antNum) {
    if (isNaN(_taskNum)) {
        alert("任务数量必须是数字！");
        return false;
    }
    if (isNaN(_nodeNum)) {
        alert("节点数量必须是数字！");
        return false;
    }
    if (isNaN(_iteratorNum)) {
        alert("迭代次数必须是数字！");
        return false;
    }
    if (isNaN(_antNum)) {
        alert("蚂蚁数量必须是数字！");
        return false;
    }

    taskNum = _taskNum;
    nodeNum = _nodeNum;
    iteratorNum = _iteratorNum;
    antNum = _antNum;

    return true;
}

/**
 * 渲染视图
 * @param resultData
 */
function draw(resultData) {
// 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));

    // 指定图表的配置项和数据
    var option = {
        title: {
            text: '基于蚁群算法的负载均衡调度策略'
        },
        tooltip : {
            trigger: 'axis',
            showDelay : 0,
            axisPointer:{
                show: true,
                type : 'cross',
                lineStyle: {
                    type : 'dashed',
                    width : 1
                }
            },
            zlevel: 1
        },
        legend: {
            data:['传统蚁群算法','优化的蚁群算法']
        },
        toolbox: {
            show : true,
            feature : {
                mark : {show: true},
                dataZoom : {show: true},
                dataView : {show: true, readOnly: false},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        xAxis : [
            {
                type : 'value',
                scale:true,
                name: '迭代次数'
            }
        ],
        yAxis : [
            {
                type : 'value',
                scale:true,
                name: '任务处理时间'
            }
        ],
        series : [
            {
                name:'传统蚁群算法',
                type:'scatter',
                large: true,
                symbolSize: 3,
                data: (function () {
                    var d = [];
                    for (var itIndex=0; itIndex<iteratorNum; itIndex++) {
                        for (var antIndex=0; antIndex<antNum; antIndex++) {
                            d.push([itIndex, resultData[itIndex][antIndex]]);
                        }
                    }
                    return d;
                })()
            },
            // {
            //     name:'优化的蚁群算法',
            //     type:'scatter',
            //     large: true,
            //     symbolSize: 3,
            //     data: (function () {
            //         var d = [];
            //         for (var itIndex=0; itIndex<iteratorNum; itIndex++) {
            //             for (var antIndex=0; antIndex<antNum; antIndex++) {
            //                 d.push([itIndex, resultData[itIndex][antIndex]]);
            //             }
            //         }
            //         return d;
            //     })()
            // }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}

/**
 * 初始化 任务集合、处理节点集合
 * @param _taskNum 任务数
 * @param _nodeNum 处理节点数
 * @param _iteratorNum 迭代次数
 * @param _antNum 蚂蚁的数量
 */
(function init(_taskNum, _nodeNum, _iteratorNum, _antNum) {
    // 参数校验
    if (!checkParam(_taskNum, _nodeNum, _iteratorNum, _antNum)) {
        return;
    }

    // 初始化任务集合
    tasks = initRandomArray(_taskNum, taskLengthRange);

    // 初始化节点集合
    nodes = initRandomArray(_nodeNum, nodeSpeendRange);

    // 执行蚁群算法
    aca();

    // 渲染视图
    draw(resultData);
    // console.log(resultData);

})(100, 10, 100, 1000);


/**
 * 初始化信息素矩阵(全为0)
 * @param taskNum 任务数量
 * @param nodeNum 节点数量
 */
function initPheromoneMatrix(taskNum, nodeNum) {
    for (var i=0; i<taskNum; i++) {
        var pheromoneMatrix_i = [];
        for (var j=0; j<nodeNum; j++) {
            pheromoneMatrix_i.push(1);
        }
        pheromoneMatrix.push(pheromoneMatrix_i);
    }
}

/**
 * 初始化一个二维数组
 * @param n 行数
 * @param m 列数
 * @param defaultNum 默认值
 */
function initMatrix(n, m, defaultNum) {
    var matrix = [];
    for (var i=0; i<n; i++) {
        var matrix_i = [];
        for (var j=0; j<m; j++) {
            matrix_i.push(defaultNum);
        }
        matrix.push(matrix_i);
    }
    return matrix;
}

/**
 * 将第taskCount个任务分配给某一个节点处理
 * @param antCount 蚂蚁编号
 * @param taskCount 任务编号
 * @param nodes 节点集合
 * @param pheromoneMatrix 信息素集合
 */
function assignOneTask(antCount, taskCount, nodes, pheromoneMatrix) {

    // 若当前蚂蚁编号在临界点之前，则采用最大信息素的分配方式
    if (antCount <= criticalPointMatrix[taskCount]) {
        return maxPheromoneMatrix[taskCount];
    }

    // 若当前蚂蚁编号在临界点之后，则采用随机分配方式
    return random(0, nodeNum-1);

    // var maxPheromone = pheromoneMatrix[taskCount][0];
    // var maxIndex = 0;
    // var isAllSame = true;
    //
    // // 寻找最大的信息素
    // for (var j=1; j<nodeNum; j++) {
    //     if (pheromoneMatrix[taskCount][j] > maxPheromone) {
    //         maxPheromone = pheromoneMatrix[taskCount][j];
    //         maxIndex = j;
    //     }
    //     if (pheromoneMatrix[taskCount][j] != pheromoneMatrix[taskCount][j-1]) {
    //         isAllSame = false;
    //     }
    // }
    //
    // // 若该行信息素全都相同，则随机选择一个处理节点
    // if (isAllSame==true) {
    //     maxIndex = random(0, nodeNum-1);
    // }
    //
    // return maxIndex;
}

/**
 * 计算一次迭代中，所有蚂蚁的任务处理时间
 * @param pathMatrix_allAnt 所有蚂蚁的路径
 */
function calTime_oneIt(pathMatrix_allAnt) {
    var time_allAnt = [];
    for (var antIndex=0; antIndex<pathMatrix_allAnt.length; antIndex++) {
        // 获取第antIndex只蚂蚁的行走路径
        var pathMatrix = pathMatrix_allAnt[antIndex];

        // 获取处理时间最长的节点 对应的处理时间
        var maxTime = -1;
        for (var nodeIndex=0; nodeIndex<nodeNum; nodeIndex++) {
            // 计算节点taskIndex的任务处理时间
            var time = 0;
            for (var taskIndex=0; taskIndex<taskNum; taskIndex++) {
                if (pathMatrix[taskIndex][nodeIndex] == 1) {
                    time += timeMatrix[taskIndex][nodeIndex];
                }
            }
            // 更新maxTime
            if (time > maxTime) {
                maxTime = time;
            }
        }

        time_allAnt.push(maxTime);
    }
    return time_allAnt;
}

/**
 * 更新信息素
 * @param pathMatrix_allAnt 本次迭代中所有蚂蚁的行走路径
 * @param pheromoneMatrix 信息素矩阵
 * @param timeArray_oneIt 本次迭代的任务处理时间的结果集
 */
function updatePheromoneMatrix(pathMatrix_allAnt, pheromoneMatrix, timeArray_oneIt) {
    // 所有信息素均衰减p%
    for (var i=0; i<taskNum; i++) {
        for (var j=0; j<nodeNum; j++) {
            pheromoneMatrix[i][j] *= p;
        }
    }

    // 找出任务处理时间最短的蚂蚁编号
    var minTime = Number.MAX_VALUE;
    var minIndex = -1;
    for (var antIndex=0; antIndex<antNum; antIndex++) {
        if (timeArray_oneIt[antIndex] < minTime) {
            minTime = timeArray_oneIt[antIndex];
            minIndex = antIndex;
        }
    }

    // 将本次迭代中最优路径的信息素增加q%
    for (var taskIndex=0; taskIndex<taskNum; taskIndex++) {
        for (var nodeIndex=0; nodeIndex<nodeNum; nodeIndex++) {
            if (pathMatrix_allAnt[minIndex][taskIndex][nodeIndex] == 1) {
                pheromoneMatrix[taskIndex][nodeIndex] *= q;
            }
        }
    }

    // 将本次迭代中所有蚂蚁走过路径的信息素增加q%
    // for (var antIndex=0; antIndex<antNum; antIndex++) {
    //     for (var taskIndex=0; taskIndex<taskNum; taskIndex++) {
    //         for (var nodeIndex=0; nodeIndex<nodeNum; nodeIndex++) {
    //             if (pathMatrix_allAnt[antIndex][taskIndex][nodeIndex] == 1) {
    //                 pheromoneMatrix[taskIndex][nodeIndex] *= q;
    //             }
    //         }
    //     }
    // }

    maxPheromoneMatrix = [];
    criticalPointMatrix = [];
    for (var taskIndex=0; taskIndex<taskNum; taskIndex++) {
        var maxPheromone = pheromoneMatrix[taskIndex][0];
        var maxIndex = 0;
        var sumPheromone = pheromoneMatrix[taskIndex][0];
        var isAllSame = true;

        for (var nodeIndex=1; nodeIndex<nodeNum; nodeIndex++) {
            if (pheromoneMatrix[taskIndex][nodeIndex] > maxPheromone) {
                maxPheromone = pheromoneMatrix[taskIndex][nodeIndex];
                maxIndex = nodeIndex;
            }

            if (pheromoneMatrix[taskIndex][nodeIndex] != pheromoneMatrix[taskIndex][nodeIndex-1]){
                isAllSame = false;
            }

            sumPheromone += pheromoneMatrix[taskIndex][nodeIndex];
        }

        // 若本行信息素全都相等，则随机选择一个作为最大信息素
        if (isAllSame==true) {
            maxIndex = random(0, nodeNum-1);
            maxPheromone = pheromoneMatrix[taskIndex][maxIndex];
        }

        // 将本行最大信息素的下标加入maxPheromoneMatrix
        maxPheromoneMatrix.push(maxIndex);

        // 将本次迭代的蚂蚁临界编号加入criticalPointMatrix(该临界点之前的蚂蚁的任务分配根据最大信息素原则，而该临界点之后的蚂蚁采用随机分配策略)
        criticalPointMatrix.push(Math.round(antNum * (maxPheromone/sumPheromone)));
    }
}

/**
 * 迭代搜索
 * @param iteratorNum 迭代次数
 * @param antNum 蚂蚁数量
 */
function acaSearch(iteratorNum, antNum) {
    for (var itCount=0; itCount<iteratorNum; itCount++) {
        // 本次迭代中，所有蚂蚁的路径
        var pathMatrix_allAnt = [];

        for (var antCount=0; antCount<antNum; antCount++) {
            // 第antCount只蚂蚁的分配策略(pathMatrix[i][j]表示第antCount只蚂蚁将i任务分配给j节点处理)
            var pathMatrix_oneAnt = initMatrix(taskNum, nodeNum, 0);
            for (var taskCount=0; taskCount<taskNum; taskCount++) {
                // 将第taskCount个任务分配给第nodeCount个节点处理
                var nodeCount = assignOneTask(antCount, taskCount, nodes, pheromoneMatrix);
                pathMatrix_oneAnt[taskCount][nodeCount] = 1;
            }
            // 将当前蚂蚁的路径加入pathMatrix_allAnt
            pathMatrix_allAnt.push(pathMatrix_oneAnt);
        }

        // 计算 本次迭代中 所有蚂蚁 的任务处理时间
        var timeArray_oneIt = calTime_oneIt(pathMatrix_allAnt);
        // 将本地迭代中 所有蚂蚁的 任务处理时间加入总结果集
        resultData.push(timeArray_oneIt);

        // 更新信息素
        updatePheromoneMatrix(pathMatrix_allAnt, pheromoneMatrix, timeArray_oneIt);
    }
}

/**
 * 蚁群算法
 */
function aca() {
    // 初始化任务执行时间矩阵
    initTimeMatrix(tasks, nodes, timeMatrix);

    // 初始化信息素矩阵
    initPheromoneMatrix(taskNum, nodeNum);

    // 迭代搜索
    acaSearch(iteratorNum, antNum);
}