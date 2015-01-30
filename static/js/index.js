(function(){
    
    function create_article(data) {
        var section = createDom('section', {class: 'essays wt-item', time_stamp: data.timestamp});
        var essay_shortcut = createDom('div', {class: 'essay_shortcut'});
        var essay_title = createDom('div', {class: 'essay_title'});
        var img = createDom('img', {class: 'essay_shot'});
        essay_shortcut.innerHTML = data.brief_intro;
        essay_shortcut.appendChild(img);
        essay_title.innerHTML = data.title;

        img.addEventListener('load', function(){
            eventTrigger('resize', window);
            img.removeEventListener('load');
        });
        addAttr(img, {src: '/pageshot?timestamp='+data.timestamp});
        
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
