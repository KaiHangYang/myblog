//我的博客打算全部使用最新的特性，所以兼容性什么的都去死吧！！！！
$ = function(dom){
    return document.querySelector(dom);
}

$$ = function(dom){
    return document.querySelectorAll(dom);
}
//这个方法法中的那个滤镜和float没太弄懂
css = function (el, cssName) {
    var len=arguments.length, sty, f, fv;
    'currentStyle' in el ? sty=el.currentStyle : 'getComputedStyle' in window ? sty=window.getComputedStyle(el,null) : null;
    if(cssName==="opacity" && document.all) {
        f = el.filters;
        f && f.length>0 && f.alpha ? fv=f.alpha.opacity/100 : fv=1;                 
        return fv;
    }
    cssName==="float" ? document.all ? cssName='styleFloat' : cssName='cssFloat' : cssName;
    sty = (len==2) ? sty[cssName] : sty;
    return sty;
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

ajax = function(args) {
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