(function(){
    
    function create_article(data) {
        var section = createDom('section', {class: 'essays wt-item', time_stamp: data.timestamp});
        var essay_shortcut = createDom('div', {class: 'essay_shortcut'});
        var essay_title = createDom('div', {class: 'essay_title'});
        var manage_cover = createDom('div', {class: 'manage_cover'}),
            del = createDom('span', {class: 'del'}),
            edit = createDom('span', {class: 'edit'}),
            img = createDom('img', {class: 'essay_shot'});

        img.addEventListener('load', function(){
            eventTrigger('resize', window);
            img.removeEventListener('load');
        });
        addAttr(img, {src: '/pageshot?timestamp='+data.timestamp});

        essay_shortcut.innerText = data.brief_intro;
        essay_shortcut.appendChild(img);
        essay_title.innerText = data.title;
        del.innerHTML = '&#xe603;';
        edit.innerHTML = '&#xe602;';
        
        manage_cover.appendChild(del);
        manage_cover.appendChild(edit);
        section.appendChild(manage_cover);
        section.appendChild(essay_shortcut);
        section.appendChild(essay_title);

        return section;
    }
    function init_article(cb) {
        ajax({
            url: '/admin',
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
    function article_del(timestamp, nowScrollY) {
        ajax({
            url: '/manage',
            method: 'post',
            contentType: 'json',
            data: {act: 'del', timestamp: timestamp},
            callback: function(data) {
                if (data.success) {
                    init_article(function(){
                        $('#manage_bar').click();
                        window.scrollTo(0, nowScrollY);
                    });
                }
                else {
                    location.href = '/admin';
                }
            }
        })
    }
    function article_edit(timestamp) {
        ajax({
            url: '/manage',
            method: 'post',
            contentType: 'json',
            data: {act: 'edit', timestamp: timestamp},
            callback: function(data) {
                if (data.success) {
                    location.href = '/edit'+data.content.timestamp;
                }
                else {
                    location.href = '/admin'
                }
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
        $('article').addEventListener('click', function(e) {
            if (e.target.className == 'del') {
                var nowScrollY = window.scrollY;
                e.stopPropagation();
                article_del(e.target.parentNode.parentNode.getAttribute('time_stamp'), nowScrollY);
            }
            else if (e.target.className == 'edit') {
                e.stopPropagation();
                article_edit(e.target.parentNode.parentNode.getAttribute('time_stamp'));
            }
        });
        $('#manage_bar').addEventListener('click', function(e){
            e.stopPropagation();
            var doms = $$('.manage_cover');
            for (var i=0; i < doms.length; i++) {
                doms[i].style.display = 'block';
            }
            $('article').removeEventListener('click', article_show);
            addClass($$('section'), 'article_shake cursor_normal');
            function windowClick(e) {
                window.removeEventListener('click', windowClick);
                var doms = $$('.manage_cover');
                for (var i=0; i < doms.length; i++) {
                    doms[i].style.display = 'none';
                }
                $('article').addEventListener('click', article_show);
                removeClass($$('section'), ['article_shake', 'cursor_normal']);
            }

            window.addEventListener('click', windowClick);
        });
        $('#add_bar').addEventListener('click', function() {
            location.href = '/addarticle';
        });
    });
    
})();
