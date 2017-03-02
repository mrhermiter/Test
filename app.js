/**
 * Created by dmk on 27.02.17.
 */
const port = 3000;
const imgScreen="screen.png";

const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io").listen(server);
const screenshot = require('desktop-screenshot');
const fs = require("fs");

var users = [];
var connections = [];

server.listen(port);
console.log("Running...");

app.use(express.static(__dirname + "/public"));

const chat = io.of("/chat").on("connection", (socket) => {

    connections.push(socket);
    console.log("New connection socket: " + socket.id);
    console.log("Current connections: " + connections.length);

    socket.on("disconnect", (data) => {

        if (socket.userName)
            users.splice(users.indexOf(socket.userName), 1);
        connections.splice(connections.indexOf(socket), 1);
        updateUsers();
        console.log("Disconnected socket: " + socket.id);
        console.log("Current connections: " + connections.length);
    });

    socket.on("setUserName", (data, callback) => {

        socket.userName = data;
        users.push(data);
        callback(data);
        updateUsers();
        console.log(users);
    });

    socket.on("sendMessage", (data) => {

        chat.emit("newMessage", {msg: data, usr: socket.userName});
    });

    function updateUsers() {

        chat.emit("updateUsers", users);
    }
});

const screen = io.of("/screen").on("connection", (socket) => {
    console.log("New screen connection: " + socket.id);

    setInterval(function() {
        sendScreen();
    }, 100);
    //sendScreen();

    function sendScreen() {
        screenshot(imgScreen, (error, complete) => {
            if(error)
                console.log("Screenshot failed", error);
            else {
                fs.createReadStream(imgScreen).on("data",(chunk)=>{
                    screen.emit("newScreen",chunk);
                    console.log(chunk);
                }).on("end",()=>{
                    screen.emit("endNewScreen",true);
                    console.log("End Send");
                });


            }
        });
    }
});
