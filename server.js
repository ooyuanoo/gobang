/**
 * Created by yuanqiujuan on 2017/7/18.
 */
'use strict';
var url = require('url'),
    path = require('path'),
    express = require('express'),
    http = require('http'),
    proxy = require('http-proxy-middleware'),
    app = express(),
    server = http.createServer(app),
    io = require("socket.io").listen(server),
    port = 8991;

//监听端口
server.listen(port);

app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.render(500, err.stack);
});

//读取静态资源
app.use('/static', express.static(__dirname + '/static'));
app.use(express.static(__dirname));

//websocket监听
var rooms = {};

io.on('connection', function (socket) {
    socket.on("join", function (roomid) {
        rooms[roomid] = {
            num: rooms[roomid] ? rooms[roomid].num + 1 : 1,
            totalDot: rooms[roomid] ? rooms[roomid].totalDot : [],
            blackDot: rooms[roomid] ? rooms[roomid].blackDot : [],
            whiteDot: rooms[roomid] ? rooms[roomid].whiteDot : []
        };

        if(rooms[roomid].num > 2){
            socket.emit("warning", "这个房间已满人，请输入别的房间")
        }else{
            socket.emit("success", {
                msg: "进入成功",
                id: rooms[roomid].num
            })
        }

        socket.broadcast.emit('news', {dotinfo: rooms[roomid]})
    });

    socket.on('isAllinRoom', function (roomid) {
        socket.emit('isAllinRoomResult', {result: rooms[roomid].num === 2});
        socket.broadcast.emit('isAllinRoomResult', {result: rooms[roomid].num === 2})
    });


    socket.on("message", function(message){
        if(message.isRevert){
            rooms[message.roomid].totalDot.splice(rooms[message.roomid].totalDot.length - 1, 1);
        }else if(message.isReset){
            rooms[message.roomid].totalDot.splice(0, rooms[message.roomid].totalDot.length);
        }else{
            rooms[message.roomid].totalDot.push(message.dot);
        }

        switch (message.color){
            case "black":
                if(message.isRevert){
                    rooms[message.roomid].blackDot.splice(rooms[message.roomid].blackDot.length - 1, 1);
                }else if(message.isReset){
                    rooms[message.roomid].blackDot.splice(0, rooms[message.roomid].blackDot.length)
                }else{
                    rooms[message.roomid].blackDot.push(message.dot);
                }
                break;
            case "white":
                if(message.isRevert){
                    rooms[message.roomid].whiteDot.splice(rooms[message.roomid].whiteDot.length - 1, 1);
                }else if(message.isReset){
                    rooms[message.roomid].whiteDot.splice(0, rooms[message.roomid].whiteDot.length)
                }else{
                    rooms[message.roomid].whiteDot.push(message.dot);
                }
                break;
        }

        socket.broadcast.emit('news', {dotinfo: message})
    });

    socket.on('disconnect', function () {
        socket.emit("warning", "对方已退出房间，请重新创建加入");

        setTimeout(function () {
            delete rooms[getCookie("Gobang_roomid")];
        }, 2000)
    });

  //获取cookie
    function getCookie(c_name) {
        var c_start, c_end;

        if (socket.request.headers.cookie){
            if (socket.request.headers.cookie.length > 0) {
                c_start = socket.request.headers.cookie.indexOf(c_name + "=");
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1;
                    c_end = socket.request.headers.cookie.indexOf(";", c_start);
                    if (c_end == -1) c_end = socket.request.headers.cookie.length;
                    return unescape(socket.request.headers.cookie.substring(c_start, c_end))
                }
            }
        }
        return ""
    }
});
