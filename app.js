
//dependencies
var express = require('express');
var path = require('path');
var cors = require('cors');
var _ = require('underscore');
var index = require('./routes/index');
var mysql = require('mysql');


var app = express();

//to resolve cross-orgin errors
app.use(cors());


//for use on browser side
app.use('/chartjs',express.static(__dirname + '/node_modules/chart.js/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/ng', express.static(__dirname + '/node_modules/angular/'));
app.use('/underscore', express.static(__dirname + '/node_modules/underscore/'));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//so express is used
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);


var table_name = "Student_mat";



//create mysql connection
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "romans831"
});

initConnection = function(){
    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected to mysql.");
        connection.query("use mysql", function (err, result) {
            if (err) throw err;
        });

    });
}();




//Simple api fro browser requests

app.get('/tableColumns', function(req,res){
    var columnNameQuery = "select column_name from information_schema.columns where table_name = '" + table_name +"'";
    connection.query(columnNameQuery, function (err,result){
        if(err) throw err;
        res.send(result);
    });
});


app.get('/tableData', function(req,res){
    var tableDataQuery = "select * from " + table_name;
    connection.query(tableDataQuery, function (err,result){
        if(err) throw err;
        res.send(result);
    });
});

app.get('/columnData', function(req,res){
   var gradeDataQuery = "select " + req.query.column + " from " + table_name;
    connection.query(gradeDataQuery, function (err,result){
        if(err) throw err;
        res.send(result);
    });
});

app.get('/avgGrades', function(req, res){
   var query = "select avg(G" + req.query.grade +") from " + table_name +" where " + req.query.columnName + "='" + req.query.constraint +"'";
    connection.query(query, function (err,result){
        if(err) throw err;
        res.send(_.pluck(result, 'avg(G' + req.query.grade + ')'));
    });
});






module.exports = app;
