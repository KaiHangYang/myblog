function a(){
    var timeout = -1;
    function insertTab(e, el) {
        var content, blankNum;
        if (e) {
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
    $('.edit_block').onfocus = function() {
        document.documentElement.scrollTop = 100;
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
    });
    $('#control_bar').onclick =  function(e){
        e.stopPropagation();
        var setting = $('#setting');
        var opacity;
        if (this.hide || typeof this.hide == 'undefined') {
            this.hide = false;
            opacity = 1;

        }
        else {
            this.hide = true;
            opacity = 0;
        }
        if (this.hide) {
            setTimeout(function(){
                setting.style.display = 'none';
            }, 200);
        }
        else {
            setting.style.display = 'block';
        }
        setting.style.opacity = opacity;
    };
    $('#setting').onclick = function(e) {
        e.stopPropagation();
        if (e.target.innerText == '保存') {
            ajax({
                method: 'post',
                url: '/addarticle',
                contentType: 'json',
                data:{article:$('.edit_block').value},
                callback: function(data){
                    console.log(data);
                }
            });
        }
        else {
            ajax({
                method:'post',
                url: '/addarticle',
                contentType: 'string',
                data: 'delete',
                callback: function(data) {
                    if (data.result) {
                        location.href = '/';
                    }
                }
            });
        }
    }
    window.addEventListener('click', function(){
        if (!$('#control_bar').hide&& typeof $('#control_bar').hide != 'undefined') {
            $('#control_bar').onclick(event);
        }
    });
}
window.onload = a;
