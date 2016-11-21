/**
 * Created by yuan on 2016/2/23.
 */
'use strict';
var http = require('http');
var fs = require('fs');
var url = require('url');

// 创建服务器
http.createServer( function (request, response) {
    // 解析请求，包括文件名
    var pathname = url.parse(request.url).pathname;

    // 输出请求的文件名
    if(pathname == "/"){
        pathname = "/index.html"
    }
    // 从文件系统中读取请求的文件内容
    fs.readFile(pathname.substr(1), "binary", function (err, data) {
        if (err) {
            response.writeHead(404, {'Content-Type': 'text/html'});
        }else{
            if(pathname.indexOf('.css') != -1){
                //response.writeHead(200, {'Content-Type': 'text/css'});
                response.setHeader('Content-Type', 'text/css')
            }else if(pathname.indexOf('.woff') != -1) {
                response.setHeader('Content-Type', 'text/woff')
            }else {
                response.writeHead(200, {'Content-Type': 'text/html'});
            }

            // 响应文件内容
            //response.end(data.toString());
            response.write(data, "binary");
        }
        //  发送响应数据
        response.end();
    });
}).listen(8080);

// 控制台会输出以下信息
console.log('Server running at http://127.0.0.1:8080/');