function insertTab(shift, el) {
    var content, blankNum;
    if (shift) {
        content = '        ';
        blankNum = 8;

    }
    else {
        content = '    ';
        blankNum = 4;
    }
    var start = el.selectionStart;
    var text1 = el.value.substr(0, start);
    var text2 = el.value.substr(el.selectionEnd);
    el.value = text1 + content  + text2;
    el.setSelectionRange(start+blankNum, start+blankNum);
    $('.edit_block').oninput();
}
function backspace(e, el) {
    var str = el.value.substr(el.selectionStart-4, 4);
    if (str == '    ') {
        e.preventDefault();
        var start = el.selectionStart-4;
        var text1 = el.value.substr(0, start);
        var text2 = el.value.substr(start+4);
        el.value = text1 + text2;
        el.setSelectionRange(start, start);
        $('.edit_block').oninput();
    }
}
    
var makesure = {
    show: function(msg, okFunc, cancelFunc) {
        $('.makesure>div>span').innerHTML = msg;
        $('.makesure input[value=确定]').onclick = okFunc;
        $('.makesure input[value=取消]').onclick = cancelFunc;
        $('.makesure').style.display = 'block';
        setTimeout(function(){
            $('.makesure').style.opacity = 1;
        }, 100);
    },
    hide: function() {
        $('.makesure>div>span').innerHTML = '';
        $('.makesure input[value=确定]').onclick = null;
        $('.makesure input[value=取消]').onclick = null;
        $('.makesure').style.opacity = 0;
        setTimeout(function(){
            $('.makesure').style.display = 'none';
        }, 300)
    }
}
function init(){
    statusBar.init();

    (function(){
        if (location.pathname == '/addarticle') {
            return;
        }
        else {
            ajax({
                url: '/edit1',
                method: 'post',
                contentType: 'string',
                data:'',
                callback: function(data) {
                    if (data.success) {
                        $('#article_title').value = data.content.title;
                        $('#brief_intro').value = data.content.brief_intro;
                        $('.edit_block').value = data.content.article;
                        setTimeout(function(){$('.edit_block').oninput()}, 100);
                    }
                    else {
                        location.href = '/admin';
                    }
                }
            });
        }
    })();
    var timeout = -1;
    $('.edit_block').onfocus = function() {
        //响应式
        if (window.innerWidth >= 700) {
            document.documentElement.scrollTop = 200;
        }
    }
    $('.edit_block').oninput = function() {
        clearTimeout(timeout);
        timeout = setTimeout(function(){
            $('.markdown-body').innerHTML = markdown.toHTML($('.edit_block').value);
            if ($('.markdown-body pre:not([class=hljs]),code:not([class=hljs])') != null) {
                var hlDom = $$('.markdown-body pre:not([class=hljs]),code:not([class=hljs])');
                for (var i=0; i < hlDom.length; i++) {
                    hljs.highlightBlock(hlDom[i]);
                }
            }   
        }, 100);
         
    }
    $('.edit_block').addEventListener('keydown', function(e){
        if (e.keyCode == 9) {
            e.preventDefault();
            insertTab(e.shiftKey, $('.edit_block'));
        }
        else if (e.keyCode == 8) {
            backspace(e, $('.edit_block'));
        }
        else if (e.keyCode == 83 && e.ctrlKey) {
            e.preventDefault();
        }
    });
    $('#article_title').onblur = function() {
        if (this.value != '') {
            var edit = $('.edit_block');
            var head = this.value + '\n===';
            var edit_head = edit.value.split('\n', 2);
            var len = 1;
            if (edit_head.length == 2 && edit_head[1].indexOf('===') != -1) {
                edit_head.forEach(function(value){
                    len += value.length;
                })
            }
            else {
                head += '\n';
                len = 0;
            }
            edit.setRangeText(head, 0 , len);
            edit.oninput();

        }
    }
    $('.setting_bar').addEventListener('click', function(){
        if (typeof this.hide == 'undefined' || this.hide == true) {
            this.hide = false;
            removeClass($$('.bar'), ['bar_initial']);
        }
        else {
            this.hide = true;
            addClass($$('.bar'), ['bar_initial']);
        }
    });
    $('.back_bar').onclick = function() {

        if (!$('.edit_block').value || !$('#article_title').value || !$('#brief_intro').value) {
            makesure.show('填写不完整！', makesure.hide, makesure.hide);
            return;
        }
        console.log(!$('.edit_block').value || !$('#article_title').value || !$('#brief_intro').value);

        makesure.show('保存并返回首页？', function(){
            makesure.hide();
            ajax({
                url: '/addarticle',
                method: 'post',
                contentType: 'json',
                data: {article:$('.edit_block').value, title:$('#article_title').value, brief_intro:$('#brief_intro').value},
                callback: function(data){
                    console.log(data);
                    if (data.result) {
                        location.href = '/admin';
                    }
                    else {
                        makesure.show('保存失败了。。。', makesure.hide, makesure.hide);
                    }
                }
            });
        }, makesure.hide);
    }
    $('.delete_bar').onclick = function() {
        makesure.show('要删除这篇博文吗?', function(){
            makesure.hide();
            ajax({
                url: '/addarticle',
                method: 'post',
                contentType: 'string',
                data: 'delete',
                callback: function(data) {
                    if (data.result) {
                        location.href = '/admin';
                    }
                    else {
                        makesure.show('删除失败了。。。', makesure.hide, makesure.hide);
                    }
                }
            });
        }, makesure.hide);
    }
    $('.save_bar').onclick = function() {
        if (!$('.edit_block').value || !$('#article_title').value || !$('#brief_intro').value) {
            statusBar.show('内容不全！');
            statusBar.hide(1000);
            return;
        }

        statusBar.show('正在保存中～');
        ajax({
            url: '/addarticle',
            method: 'post',
            contentType: 'json',
            data: {article:$('.edit_block').value, title:$('#article_title').value, brief_intro:$('#brief_intro').value},
            callback: function(data) {
                if (data.result) {
                    $('.loading').style.display = 'none';
                    statusBar.show('保存成功~');
                    statusBar.hide(1000);
                }
                else {
                    $('.loading').style.display = 'none';
                    statusBar.show('保存失败了～');
                    statusBar.hide(1000);
                }
            }
        });
    }
    window.addEventListener('keydown', function(e) {
        if (e.keyCode == 83 && e.ctrlKey) {
            e.preventDefault();

            $('.save_bar').onclick();
            
        } 
    });
    setInterval(function() {
        if (!!$('.edit_block').value && !!$('#article_title').value && !!$('#brief_intro').value) {
            $('.save_bar').onclick();
        }
    }, 40000);
}
window.onload = init;
