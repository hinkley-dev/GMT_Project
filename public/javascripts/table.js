/*
* This is the js file that creates the table. It simply makes a request to the server to pull all the data from the database and render it on a table.
* When a checkbox is changed then that column of the table is no longer shown. Unfortunately, I did not have time to use AJAX to make the table change
* more efficient so the table is rebuilt after each time it is changes */

var columnNames = [];
var tableContainer;
var tableData = [];

$(document).ready(function(){

    //requesting column names for table building
    var req = new XMLHttpRequest();
    req.open("GET", "http://localhost:3000/tableColumns", false);
    req.send();
    parseColumnNames(req.responseText);


    //requesting rest of data from db
    var dataReq = new XMLHttpRequest();
    dataReq.open("GET", "http://localhost:3000/tableData", false);
    dataReq.send();
    parseStudentData(dataReq.responseText);

    generateCheckMarks();
    tableContainer = document.getElementById("tableContainer");
    generateTable();
});





function generateTable() {
    var existingTable = document.getElementById("tableDiv");
    if(existingTable) tableContainer.removeChild(existingTable);
    var tableDiv = document.createElement("div");
    tableDiv.id ="tableDiv";


    var tbl = document.createElement("table");
    tbl.className = "paleBlueRows";
    var tblBody = document.createElement("tbody");

    var showCurrentColumn;
    var columnID;

    for(var i = 0; i < columnNames.length; ++i){
        columnID = columnNames[i] + "cb";
        showCurrentColumn = document.getElementById(columnID).checked;
        if(!showCurrentColumn) continue;

        var th = document.createElement("th");
        th.id = columnNames[i] +'th';
        var header = document.createTextNode(columnNames[i]);
        th.appendChild(header);
        tblBody.appendChild(th);
    }

    for(var i = 0; i < tableData.length; ++i){

        var row = document.createElement("tr");
        var keys = _.keys(tableData[i]);

        for(var j = 0; j < keys.length; ++j){
            columnID = columnNames[j] + "cb";
            showCurrentColumn = document.getElementById(columnID).checked;
            if(!showCurrentColumn) continue;

            var cell = document.createElement("td");
            var cellText = document.createTextNode(tableData[i][keys[j]]);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        tblBody.appendChild(row);
    }

    tbl.appendChild(tblBody);
    tableDiv.appendChild(tbl);
    tableContainer.appendChild(tableDiv);
    tbl.setAttribute("border", "2");


}

function generateCheckMarks(){
    var chkboxContainer = document.getElementById("chkboxContainer");

    var tempColNames = columnNames.slice(0);
    for(var i = 0; i < tempColNames.length; ++i){

        var chb = document.createElement('input');
        chb.type = 'checkbox';
        chb.name = tempColNames[i];
        chb.value = tempColNames[i];
        chb.id = tempColNames[i] + "cb";
        chb.checked = true;
        chb.onclick = function(){generateTable()};

        var label = document.createElement("label");
        label.htmlFor= chb.id;
        label.appendChild(document.createTextNode(tempColNames[i]));
        chkboxContainer.appendChild(chb);
        chkboxContainer.appendChild(label);

        if((i+1) % (columnNames.length/3) == 0){
            chkboxContainer.appendChild(document.createElement("br"));
            chkboxContainer.appendChild(document.createElement("br"));
        }
    }
}



function checkAllAttributes(){
    for(var i =0; i < columnNames.length; ++i){
        var checkId = columnNames[i] + "cb";
        document.getElementById(checkId).checked = true;
    }
    generateTable();
}



function parseColumnNames(response){
    response = $.parseJSON(response);
    for(var i = 0; i < response.length; ++i)
        columnNames.push(response[i].column_name);
}

function parseStudentData(data){
    data = $.parseJSON(data);
    for(var i = 0; i < data.length; ++i)
        tableData.push(data[i]);
}




