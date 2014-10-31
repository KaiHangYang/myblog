(function(){
    //我的博客打算全部使用最新的特性，所以兼容性什么的都去死吧！！！！
    $ = function(dom){
        return document.querySelector(dom);
    }

    var $$ = function(dom){
        return document.querySelectorAll(dom);
    }

    //serialize方法来自于 javascript高级程序设计 p356
    serialize = function (form) {
        var parts = new Array();
        var field = null;

        for (var i=0, len=form.elements.length; i < len; i++) {
            field = form.elements[i];

            switch(field.type){
                case 'select-one':
                case 'select-multiple':
                    for (var j=0, optlen=field.options.length; j < optlen; j++) {
                        var option = field.options[j];
                        if (option.selected) {
                            var optValue = "";
                            if (option.hasAttribute) {
                                optValue = (option.hasAttribute('value') ? option.value: option.text);
                            }
                            else {
                                optValue = (option.attributes['value'].specified?option.value:option.text);
                            }
                            parts.push(encodeURIComponent(field.name)+'='+encodeURIComponent(optValue));
                        }
                    }
                    break;
                case undefined:
                case 'file':
                case 'submit':
                case 'reset':
                case 'button':
                    break;
                case 'radio':
                case 'checkbox':
                    if (!field.checked) {
                        break;
                    }
                default:
                    parts.push(encodeURIComponent(field.name)+'='+encodeURIComponent(field.value));
            }
        }
        return parts.join('&');
    }

    /*
     *eg:
     *args={
        method:'POST',
        url:'/',
        data:form #暂时只用这么一个数据，以后在加吧
        contentType:'application/x-www-form-urlencoded'
        callback: function(data){
        
        };
      }
     */

    var ajax = function(args) {
        if (typeof args.data == 'object' && args.data.tagName && args.data.tagName.toLowerCase() == 'form') {
            args.method = args.data.method;
            args.url = args.data.action;
            args.contentType = 'application/x-www-form-urlencoded';
        }
        else {
            if (typeof args.method == 'undefined' || typeof args.data == 'undefined' || typeof args.url == 'undefined') {
                console.error('Missing arguments!');
                return;
            }
        }

               var xhr = new XMLHttpRequest();
        var data = null;
        if (args.contentType != 'application/x-www-form-urlencoded') {

            if (args.contentType == 'string') {
                data = args.data;
            }
            else if (args.contentType == 'json') {
                data = JSON.stringify(args.data);
            }
            xhr.open(args.method, args.url, true);
            xhr.setRequestHeader('Content-Type', 'text/plain');
        }
        else {
            data = serialize(args.data);
            xhr.open(args.method, args.url, true);
            xhr.setRequestHeader('Content-Type', args.contentType);
        }

        xhr.send(data);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                if (xhr.getResponseHeader('Content-type').indexOf('application/json') == -1) {
                    args.callback(xhr.responseText);
                }
                else {
                    args.callback(JSON.parse(xhr.responseText));
                }
            }
        }
    }
    function keydown(e) {
        if (e.keyCode == 27) {
            noteBox.hide();
        }
    }
    var noteBox = {
        'self': '',
        'show': function() {
            window.addEventListener('keydown', keydown);
            noteBox.self.style.display = 'flex';
            setTimeout(function(){
                noteBox.self.style.opacity = 1;
            }, 100)
        },
        'hide': function() {

            window.removeEventListener('keydown', keydown);
            noteBox.self.style.opacity = 0;
            setTimeout(function(){
                noteBox.self.style.display = 'none';
            }, 300);
        }
    }
    var loading = {
        'hide': function() {
            $('#loading_cover').style.opacity = 0;
            setTimeout(function(){
                $('#loading_cover').style.display = 'none';
            }, 300)
        },
        'show': function() {
            $('#loading_cover').style.display = 'flex';
            setTimeout(function(){
                $('#loading_cover').style.opacity = 1;
            }, 100);
        }
    }

window.onload = function() {
    noteBox.self = $('#note_box');
    $('#login_form').onsubmit = function(){
        
        loading.show();
        ajax({
            data: $('#login_form'),
            callback: function(data) {
                loading.hide();
                $('#note_zone').innerHTML = '<p>'+data.msg+'</p>';
                noteBox.show();
                if (data.login) {
                    setTimeout(function(){
                        location.href = '/';
                    }, 600);
                }
            }
        });
        return false;
    }

    $('#note_btn').onclick = function() {
        noteBox.hide();
    }
}

})();
