/**
 * Created by yuan on 2016/11/21.
 */
'use strict';
var vue = new Vue({
    el: "#game-wrapper",
    data: {
        num: [],
        nums: []
    },
    computed: {
        nums: function(){
            var width = document.documentElement.clientWidth,
                height = document.documentElement.clientHeight,
                data = [],
                count = 0;

            console.log(width, height);
            for(var i = 0; i < width;){
                console.log(i)
                for(var j = 0; j < height;){
                    data.push(j);

                    j += 32;
                    count ++;
                }
                i += 32;
            }

            return data
        }
    }
});