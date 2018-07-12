/*
* This is the document that builds and renders the dynamic graph.
* It does this by making requests to the simple server to receive values from the database.
* When the values are changes by an input, new values are retrieved from the server and then the graph is rebuilt(probably not the most efficient way)
*/



var myChart;

//made global so chart could access it
var gradeSelectionOptions = ['1st Grade Period', '2nd Grade Period', 'Final Grade'];

//made global for chart resets or chnges
var currentXAxisData = [];
var currentYAxisData = [];
var currentBasedOn = "";


$(document).ready(function(){
    buildAttributeSelection();
    buildGradeSelection();
    buildChart([],[],"");
});



function buildAttributeSelection(){
    var attributeSelectDiv = document.getElementById("attribute-select-id");

    var selectionOptions = getColumnNames();

    var selection = document.createElement("select");
    selection.id = "attributeSelector";
    selection.onchange = function(){evaluateSelectionChange()};

    var option = document.createElement("option");
    option.value = "";
    option.text = "Select one...";
    option.selected = true;
    option.disabled = true;
    selection.appendChild(option);

    for(var i = 0; i < selectionOptions.length; ++i){
        var opt = document.createElement("option");
        opt.value = selectionOptions[i];
        opt.text = selectionOptions[i];
        selection.appendChild(opt);
    }

    attributeSelectDiv.appendChild(selection);
}


function buildGradeSelection(){
    var gradeSelectDiv = document.getElementById("grade-select-id");

    var gradeSelection = document.createElement("select");
    gradeSelection.id ="gradeSelector";

    gradeSelection.onchange = function () {evaluateSelectionChange()};


    for(var j = 0; j < gradeSelectionOptions.length; ++j){
        var optn = document.createElement("option");
        optn.value = j+1;
        optn.text = gradeSelectionOptions[j];
        if(j==2) optn.selected = true; //so final grades is the default
        gradeSelection.appendChild(optn);
    }

    var optn = document.createElement("option");
    optn.value = "Show All";
    optn.text = "Show All";
    gradeSelection.appendChild(optn);

    gradeSelectDiv.appendChild(gradeSelection);
}


function is2dArray(array){
    if(array[0] === undefined){
        return false;
    }else{
        return (array[0].constructor === Array);
    }
}



function buildChart(xAxisData, yAxisData, basedOn){

    Chart.defaults.global.defaultFontColor = 'black';

    var chartType = $("input[type='radio'][name='chartType']:checked").val();

    currentXAxisData = xAxisData;
    currentYAxisData = yAxisData;
    currentBasedOn = basedOn;

    if(myChart)myChart.destroy();

    var borderColorCount  = chartType == 'line' ? 1: xAxisData.length;

    var ctx = document.getElementById("myChart");
    var dataset =[];
    var displayLabels;

    //setting data in case show all is selected
    if(!is2dArray(yAxisData)) {
        displayLabels = false;
        dataset.push({
            fill: false,
            data: yAxisData,
            backgroundColor: dynamicColors(xAxisData.length),
            borderColor: dynamicColors(borderColorCount),
            borderWidth: 3
        });
    }
    else{
        displayLabels = true;
        var color = dynamicColors(3);
        for(var i = 0; i < 3; ++i){
            dataset.push({
                label: gradeSelectionOptions[i],
                fill: false,
                data: yAxisData[i],
                backgroundColor: color[i],
                borderColor: color[i],
                borderWidth: 3
            });
        }
    }



    myChart = new Chart(ctx, {
        type: chartType,
        borderColor: dynamicColors(1),
        borderWidth: 15,
        data: {

            labels: xAxisData,
            datasets: dataset
        },

        options: {

            title: {
                display: true,
                text: 'Average Grades Based on ' + basedOn,
                fontSize: 26
            },

            legend:{
                display: displayLabels,
                labels: {
                    boxWidth:20,
                    fontSize:15
                },
                position: "bottom"
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Average Student Grades",
                        fontSize:22
                    },
                    ticks: {
                        beginAtZero:true,
                        fontSize:16
                    },
                    gridLines: {
                        display: true ,
                        color: '#ffff'
                    }
                }],
                xAxes:[{
                    scaleLabel: {
                        display: true,
                        labelString: basedOn,
                        fontSize: 22
                    },
                    ticks :{
                        fontSize: 16
                    }
                }]
            }
        }
    });

    myChart.render();

};


function evaluateSelectionChange(){
    var gradeType = document.getElementById("gradeSelector").value;
    var attribute = document.getElementById("attributeSelector").value;
    if(attribute =="") return;
    var valsOfX = getAttributeValues(attribute);
    var valsOfY = [];

    if(gradeType == "Show All")
    {
        for(var j = 0; j < 3; ++j){
            var temp = [];
            for(var i = 0; i < valsOfX.length; ++i){
                temp.push(requestAvgGrades(attribute, valsOfX[i], (j+1)));
            }
            valsOfY.push(temp);
        }
    }
    else{
        for(var i = 0; i < valsOfX.length; ++i){
            valsOfY.push(requestAvgGrades(attribute, valsOfX[i], gradeType));
        }
    }

    buildChart(valsOfX, valsOfY, attribute);
}


//all server calls
function getAttributeValues(attribute){
    var dataReq = new XMLHttpRequest();
    dataReq.open("GET", "http://localhost:3000/columnData?column=" + attribute, false);
    dataReq.send();
    var dataRes = dataReq.responseText;
    dataRes = $.parseJSON(dataRes);
    return _.uniq(_.pluck(dataRes, attribute)).sort(function(a,b){return a-b;});
}


function requestAvgGrades(basedOn, valConstraint, gradeType){

    var dataReq = new XMLHttpRequest();
    dataReq.open("GET", "http://localhost:3000/avgGrades?columnName=" + basedOn + "&constraint=" + valConstraint + "&grade="+ gradeType, false);
    dataReq.send();
    var dataRes = dataReq.responseText;
    dataRes =dataRes.replace(']','');
    dataRes =dataRes.replace('[','');
    return Number(dataRes);
}

function getColumnNames(){
    var dataReq = new XMLHttpRequest();
    dataReq.open("GET", "http://localhost:3000/tableColumns", false);
    dataReq.send();
    var dataRes = dataReq.responseText;
    dataRes = $.parseJSON(dataRes);
    return _.map(dataRes, function(obj){return obj.column_name}).sort();
}




//color helper functions
var dynamicColors = function(count) {
    var colors =[];
    for(var i = 0; i < count; ++i){
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        colors.push("rgb(" + r + "," + g + "," + b + ")");
    }

    return colors;
};

function randomizeColor(){
    buildChart(currentXAxisData,currentYAxisData,currentBasedOn);
}

