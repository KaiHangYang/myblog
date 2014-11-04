(function(){
    var waterfall = {
        init: function(){//这里使用wt-container作为waterfall的类名，wt-item作为waterfall子元素的类名
            var container = $('.wt-container');
            var items = $$('.wt-item');
            var containerWidth = parseInt(css(container, 'width')),
                itemWidth = parseInt(css(items[0], 'width'));
            
            var colNum = Math.floor(containerWidth/itemWidth);
            var margin = (containerWidth-itemWidth*colNum)/(colNum+1);
            var colLength = [], minNum, maxNum;
            for (var i=0; i < colNum; i++) {
                colLength.push(margin);
            }
            for (var i=0, maxNum=0; i < items.length; i++) {
                for (var j=0, minNum=0; j < colLength.length; j++) {
                    if (colLength[minNum] == margin) {
                        break;
                    }
                    minNum = (colLength[minNum] >= colLength[j] ? j:minNum);
                }

                items[i].style.top = colLength[minNum]+'px';
                colLength[minNum] += parseInt(css(items[i], 'height')) + margin;
                items[i].style.left = margin+(itemWidth+margin)*minNum+'px';
                for (var j=0, maxNum=0; j < colLength.length; j++) {
                    maxNum = (colLength[maxNum] <= colLength[j] ? j:maxNum);
                }
                container.style.height = colLength[maxNum]+'px';
            }

        },
        resize: function() {
            clearTimeout(waterfall.timeout);
            waterfall.timeout = setTimeout(function(){
                waterfall.init();
            }, 100);
        },
        timeout:-1
    }
    
    function headerChange(tag) {
        if (tag == 0) {
            if (css($('#header_unfixed'), 'display') == 'block') {
                $('#header_unfixed').style.display = 'none';
                $('#header_fixed').style.display = 'block';
            }
        }
        else {
            if (css($('#header_fixed'), 'display') == 'block') {
                $('#header_fixed').style.display = 'none';
                $('#header_unfixed').style.display = 'block';
            }
        }
    }

	window.addEventListener('load', function(){
        waterfall.init();
        window.addEventListener('resize', function() {
        	waterfall.resize();
    	});
    });

    window.onresize = function() {
        waterfall.resize();
    }
    window.onload = function() {
        waterfall.init();
    }
})();
