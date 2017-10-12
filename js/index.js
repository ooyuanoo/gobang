/**
 * Created by yuanqiujuan on 2017/9/30.
 */
var Five = function(){
    this.canvas = document.getElementById("my-canvas");
    this.chessCanvas = document.getElementById("chess-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.chessCtx = this.chessCanvas.getContext("2d");
    this.gap = 30; //一个表格的宽度
    this.coordinate = [];  //所有的坐标
    this.totalDot = [];  //所有走过的点
    this.blackDot = [];  //黑棋的点
    this.whiteDot = [];  //白旗的点
    this.curIndex = 1;   //当前走的点是白点还是黑点， 1-黑棋，
    this.socket = '';
    this.roomid = '';
    this.selfIndex = '';
    this.isAllinRoom = false;
    this.init();
    this.listen();
};
Five.prototype = {
    w: window.screen.availWidth,
    h: window.screen.availHeight,
    init: function () {
        this.ctx.lineWidth = .1;
        this.chessCanvas.width = this.canvas.width = this.w;
        this.chessCanvas.height = this.canvas.height = this.h;

        for(var i = 0; i < Math.ceil(this.h / this.gap); i++){
            this.ctx.rect(0, (i + 1) * this.gap, this.w, 0);
            for(var j = 0; j < Math.ceil(this.w / this.gap); j++){
                if(i === 0){
                    this.ctx.rect((j + 1) * this.gap, 0, 0, this.h);
                }
                this.coordinate.push([(j + 1) * this.gap, (i + 1) * this.gap])
            }
            this.ctx.stroke();
        }
    },
    listen: function () {
        var that = this,
            curPos,
            pos,
            count = 1,
            isRepeat = false;

        this.chessCanvas.addEventListener('click', function(e){
            if(!that.isAllinRoom){
                that.alertNotice("对方还未进入房间，等对方进房间后再落子");
                return false;
            }

            if(count === 1){
                that.selfIndex = that.curIndex === 1 ? 1 : 2;
                count++;
            }

            pos = that.getEventPosition(e);
            isRepeat = false;

            //如果对方还没下，自己不能下
            if(that.socket){
                if(that.curIndex % 2 !== that.selfIndex % 2){
                    return false;
                }
            }

            //判断需要画的点
            for(var i = 0; i < that.coordinate.length; i++){
                if((that.coordinate[i][0] - that.gap / 2) <= pos.x &&
                    pos.x <= (that.coordinate[i][0] + that.gap / 2) &&
                    (that.coordinate[i][1] - that.gap / 2) <= pos.y &&
                    pos.y <= (that.coordinate[i][1] + that.gap / 2)){
                    curPos = that.coordinate[i]; //记录当前点
                    //判断当前点是否画过
                    for(var j = 0; j < that.totalDot.length; j++){
                        if(curPos[0] === that.totalDot[j][0] && curPos[1] === that.totalDot[j][1]){
                            isRepeat = true;
                        }
                    }

                    if(isRepeat){
                        return false;
                    }

                    if(that.socket){
                        that.socket.emit('message', {
                            roomid: that.roomid,
                            selfIndex: that.selfIndex,
                            dot: curPos,
                            color: that.curIndex % 2 === 0 ? "white" : "black"
                        });
                    }

                    that.drawDot(curPos, that.curIndex % 2 === 0 ? "white" : "black");
                    that.isBlackOrWhite().push(curPos);
                    that.totalDot.push(curPos);
                    //判断五子棋是否在一个线上
                    that.isChessInLine(curPos);
                    // that.resetButtonStatus();
                    that.curIndex++;
                    document.getElementById("head").className = document.getElementById("head").className.replace(" hide", "");
                    document.getElementById("chess-user").innerText = that.curIndex % 2 === 0 ? "白棋" : "黑棋";
                    break;
                }
            }
        }, false);
    },
    isChessInLine: function (curPos) {
        var dot = this.curIndex % 2 === 0 ? this.whiteDot : this.blackDot,
            curDot = dot[dot.length - 1],
            successDot = [],
            count = 0,
            isSuccess = false;

        for(var i = 0, len = dot.length; i < len; i++){
            //判断是否在一个\斜线上
            count = 0;
            successDot = [];
            for(var j = 0; j < 5; j++){
                for(var k = 0; k < len; k++){
                    if(dot[i][0] + j * this.gap === dot[k][0] &&
                        dot[i][1] + j * this.gap === dot[k][1]){
                        count += 1;
                        successDot.push(dot[k]);
                        if(count > 4){
                            isSuccess = true;
                            break;
                        }
                    }
                }
            }

            //判断是否在一个/斜线上
            if(!isSuccess){
                count = 0;
                successDot = [];
                for(var j = 0; j < 5; j++){
                    for(var k = 0; k < len; k++){
                        if(dot[i][0] + j * this.gap === dot[k][0] &&
                            dot[i][1] - j * this.gap === dot[k][1]){
                            count += 1;
                            successDot.push(dot[k]);
                            if(count > 4){
                                isSuccess = true;
                            }
                        }
                    }
                }
            }

            //判断是否在一个—横线上
            if(!isSuccess){
                count = 0;
                successDot = [];
                for(var j = 0; j < 5; j++){
                    for(var k = 0; k < len; k++){
                        if(dot[i][0] + j * this.gap === dot[k][0] &&
                            dot[i][1] === dot[k][1]){
                            count += 1;
                            successDot.push(dot[k]);
                            if(count > 4){
                                isSuccess = true;
                            }
                        }
                    }
                }
            }

            //判断是否在一个—竖线上
            if(!isSuccess){
                count = 0;
                successDot = [];
                for(var j = 0; j < 5; j++){
                    for(var k = 0; k < len; k++){
                        if(dot[i][0] === dot[k][0] &&
                            dot[i][1] + j * this.gap === dot[k][1]){
                            count += 1;
                            successDot.push(dot[k]);
                            if(count > 4){
                                isSuccess = true;
                            }
                        }
                    }
                }
            }

            if(isSuccess){
                console.log(successDot);
                break;
            }
        }

        if(isSuccess){
            this.alertWinner(successDot)
        }
    },
    alertWinner: function(arr){
        var width = this.gap / 2;

        for(var i = 0, len = arr.length; i < len; i++){
            this.chessCtx.clearRect(arr[0] - width , arr[1] - width, width * 2, width * 2);
            this.drawDot(arr[i], "#ff562f")
        }

        this.alertNotice(this.curIndex % 2 === 0 ? "白棋胜利！！" : "黑棋胜利！！");
        document.getElementsByClassName("notice-mask")[0].className = document.getElementsByClassName("notice-mask")[0].className.replace(" hide", " show");
    },
    alertNotice: function (text) {
        document.getElementById("notice-text").innerHTML = text;
        document.getElementsByClassName("notice-mask")[0].className = document.getElementsByClassName("notice-mask")[0].className.replace(" hide", " show");
    },
    isBlackOrWhite: function () {
        var isWhite = this.curIndex % 2 === 0,
            cDot = isWhite ? this.whiteDot : this.blackDot;

        return cDot;
    },
    resetButtonStatus: function () {
        if(this.coordinate.length > 0){
            document.getElementsByClassName("reset")[0].disabled = false;
            document.getElementsByClassName("revert")[0].disabled = false;
        }else{
            document.getElementsByClassName("reset")[0].disabled = true;
            document.getElementsByClassName("revert")[0].disabled = true;
        }
    },
    getEventPosition: function (e) {
        var x, y;
        if (e.layerX || e.layerX === 0) {
            x = e.layerX;
            y = e.layerY;
        }else if (e.offsetX || e.offsetX === 0) { // Opera
            x = e.offsetX;
            y = e.offsetY;
        }

        return {
            x: x,
            y: y
        };
    },
    drawDot: function (curPos, color) {
        this.chessCtx.beginPath();
        this.chessCtx.fillStyle = color;
        this.chessCtx.shadowBlur = 5;
        this.chessCtx.shadowColor = "black";
        this.chessCtx.arc(curPos[0], curPos[1], this.gap / 2 - 5, 0, 2 * Math.PI);
        this.chessCtx.closePath();
        this.chessCtx.fill();
    },
    revertPick: function () {
        var lastDot = this.totalDot[this.totalDot.length - 1],
            width = this.gap / 2;

        this.chessCtx.clearRect(lastDot[0] - width , lastDot[1] - width, width * 2, width * 2);
        this.totalDot.splice(this.totalDot.length - 1, 1);
        this.curIndex--;
        this.isBlackOrWhite().splice(this.isBlackOrWhite().length - 1, 1);

        // this.socket.emit('message', {
        //     roomid: this.roomid,
        //     selfIndex: this.selfIndex,
        //     isRevert: true,
        //     color: this.curIndex % 2 === 0 ? "white" : "black"
        // });
    },
    resetPick: function () {
        this.chessCtx.clearRect(0, 0, this.w, this.h);
        this.totalDot.splice(0, this.totalDot.length);
        this.blackDot.splice(0, this.blackDot.length);
        this.whiteDot.splice(0, this.whiteDot.length);

        // this.socket.emit('message', {
        //     roomid: this.roomid,
        //     selfIndex: this.selfIndex,
        //     isReset: true,
        //     color: this.curIndex % 2 === 0 ? "white" : "black"
        // });
    },
    closeModal: function (className) {
        document.getElementsByClassName(className)[0].className = document.getElementsByClassName(className)[0].className.replace(" show", " hide");
    },
    setRoom: function () {
        var dom = document.getElementById("input-num"),
            value = dom.value;

        if(dom.disabled){
            return false;
        }

        dom.disabled = true;
        this.roomid = value;
        this.initSocket(value);
    },
    initSocket: function (value) {
        this.socket = io("ws://"+ location.host);
        this.connect(value);
    },
    connect: function (roomid) {
        var that = this;

        this.socket.on('connect', function () {
            that.socket.emit('join', roomid);

            that.socket.emit('isAllinRoom', roomid);

            that.socket.on('isAllinRoomResult', function (data) {
                if(data.result){
                    that.isAllinRoom = true;
                }
            });

            that.socket.on('news', function (data) {
                if(data.dotinfo.dot){
                    that.drawDot(data.dotinfo.dot, data.dotinfo.color);
                    that.isBlackOrWhite().push(data.dotinfo.dot);
                    that.totalDot.push(data.dotinfo.dot);
                    //判断五子棋是否在一个线上
                    that.isChessInLine(data.dotinfo.dot);
                    // that.resetButtonStatus();
                    that.curIndex++;
                    document.getElementById("head").className = document.getElementById("head").className.replace(" hide", "");
                    document.getElementById("chess-user").innerText = that.curIndex % 2 === 0 ? "白棋" : "黑棋";
                }
            });

            that.socket.on("warning", function (data) {
                var mes = document.getElementById("warning-message");
                mes.innerHTML = data;
                mes.className = mes.className.replace(" hide", "");
                document.getElementById("input-num").disabled = false;
            });

            that.socket.on("success", function (data) {
                var mes = document.getElementById("success-message"),
                    notice = document.getElementsByClassName("notice-2")[0];

                mes.innerHTML = data.msg;
                mes.className = mes.className.replace(" hide", "");
                that.selfIndex = data.id;
                that.setCookie("Gobang_roomid", that.roomid);

                setTimeout(function () {
                    mes.className += " hide";
                    notice.className = notice.className.replace(" show", " hide");
                    document.getElementById("input-num").disabled = false;
                }, 1500)
            });

            that.socket.on('disconnect', function(data){
                var mes = document.getElementById("notice-text"),
                    parent = document.getElementById("notice-1");
                mes.innerHTML = "对方已退出房间，请重新加入房间开始";
                parent.className = parent.className.replace(" hide", "");

                setTimeout(function () {
                    location.reload();
                }, 2000)
            });
        });
    },
    setCookie: function(c_name,value,expiredays) {
        var exdate = new Date();

        exdate.setDate(exdate.getDate() + expiredays);
        document.cookie = c_name + "=" + escape(value) +
            ((expiredays == null) ? "" : ";expires="+exdate.toGMTString());
    },
    hideMessage: function () {
        var suc = document.getElementById("success-message"),
            warn = document.getElementById("warning-message");

        if(!suc.className.match("hide")){
            suc.className += " hide";
        }

        if(!warn.className.match("hide")){
            warn.className += " hide";
        }
    }
};

var five = new Five();