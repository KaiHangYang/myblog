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
    
    function create_article(data) {
        var section = createDom('section', {class: 'essays wt-item', time_stamp: data.timestamp});
        var essay_shortcut = createDom('div', {class: 'essay_shortcut'});
        var essay_title = createDom('div', {class: 'essay_title'});
        var img = createDom('img', {class: 'essay_shot', src: '/pageshot?timestamp='+data.timestamp});
        essay_shortcut.innerHTML = data.brief_intro;
        essay_shortcut.appendChild(img);
        essay_title.innerHTML = data.title;
        
        section.appendChild(essay_shortcut);
        section.appendChild(essay_title);

        return section;
    }
    function init_article(cb) {
        ajax({
            url: '/',
            method: 'post',
            contentType: 'string',
            data: 'show',
            callback: function(data){

                var finished = false;
                $('article').innerHTML = '';
                for (var i=0; i < data.length; i++) {
                    $('article').appendChild(create_article(data[i]));
                    (i==data.length-1)?(finished=true):false;
                }
                var checkInterval = setInterval(function(){
                    if (finished) {
                        waterfall.init();
                        clearInterval(checkInterval);
                        cb();
                    }
                }, 100);
            }
        })
    }
    function article_show(e) {
        if (e.target.className.indexOf('essays') != -1) {
            location.href = '/article/'+e.target.getAttribute('time_stamp');
        }
        else if (e.target.className.indexOf('essay_shot') != -1) {
            location.href = '/article/'+e.target.parentNode.parentNode.getAttribute('time_stamp');
        }
        else if (e.target.className.indexOf('essay') != -1) {
            location.href = '/article/'+e.target.parentNode.getAttribute('time_stamp');
        }
    }
	window.addEventListener('load', function(){

        init_article(function(){return});
        window.addEventListener('resize', function() {
        	waterfall.resize();
    	});
        window.onresize = function() {
            waterfall.resize();
        }
        $('article').addEventListener('click', article_show);
    });
})();
