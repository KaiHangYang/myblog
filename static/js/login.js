(function(){
    //我的博客打算全部使用最新的特性，所以兼容性什么的都去死吧！！！！
    $ = function(dom){
        return document.querySelector(dom);
    }

    var $$ = function(dom){
        return document.querySelectorAll(dom);
    }

    //serialize方法来自于 javascript高级程序设计 p356
    var serialize = function (form) {
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

            xhr.setRequestHeader('Content-Type', 'text/plain');
        }
        else {
            data = serialize(args.data);
            xhr.setRequestHeader('Content-Type', args.contentType);
        }

        xhr.open(args.method, args.url, true);
        xhr.send(data);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                if (xhr.getResponseHeader('Content-type') != 'application/json') {
                    callback(xhr.responseText);
                }
                else {
                    callback(JSON.parse(xhr.responseText));
                }
            }
        }
    }

window.onload = function() {
    $('#login_form').onsubmit = function(){
        ajax({
            data: $('#login_form'),
            callback: function(data) {
                document.write(data);
            }
        });
        return false;
    }
}
})();
