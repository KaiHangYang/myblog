function a(){
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
        $('.markdown-body').innerHTML = markdown.toHTML($('.edit_block').value);
        if ($('.markdown-body pre,code') != null) {
            hljs.highlightBlock($('.markdown-body pre,code'));
        } 
    }
    $('.edit_block').addEventListener('keydown', function(e){
        if (e.keyCode == 9) {
            e.preventDefault();
            insertTab(e.shiftKey, $('.edit_block'));
        }
        else if (e.keyCode == 8) {
            backspace(e, $('.edit_block'));
        } 
    })
}
window.onload = a;
