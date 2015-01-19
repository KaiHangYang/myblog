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
    ('currentStyle' in el) ? sty=el.currentStyle : 'getComputedStyle' in window ? sty=window.getComputedStyle(el,null) : null;
    if(cssName==="opacity" && document.all) {
        f = el.filters;
        f && f.length>0 && f.alpha ? fv=f.alpha.opacity/100 : fv=1;                 
        return fv;
    }
    cssName==="float" ? document.all ? cssName='styleFloat' : cssName='cssFloat' : cssName;
    sty = (len==2) ? sty[cssName] : sty;
    return sty;
}
hasClass = function(domname, cl) {
    var doms = $$(domname);
    var dom, className;
    for (var i=0; i < doms.length; i++) {
        dom = doms[i];
        className = dom.className.split(' ');
        
        if (className.indexOf(cl) != -1) {
            return true;
        }
    }
    return false;
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
            xhr.open(args.method, args.url, true);
            xhr.setRequestHeader('X-XSRFToken', getCookie('_xsrf'));
            xhr.setRequestHeader('Content-Type', 'text/plain');
        }
        else if (args.contentType == 'json') {
            data = JSON.stringify(args.data);
            xhr.open(args.method, args.url, true);
            xhr.setRequestHeader('X-XSRFToken', getCookie('_xsrf'));
            xhr.setRequestHeader('Content-Type', 'application/json');
        }
    }
    else {
        data = serialize(args.data);
        xhr.open(args.method, args.url, true);
        xhr.setRequestHeader('Content-Type', args.contentType);
    }

    if (typeof args.responseType != 'undefined') {
        xhr.responseType = args.responseType;
    }
    xhr.send(data);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
            
            if (typeof args.responseType != 'undefined') {
                args.callback(xhr.response);
                return;
            }
            if (xhr.getResponseHeader('Content-type').indexOf('application/json') == -1) {
                args.callback(xhr.responseText);
            }
            else {
                args.callback(JSON.parse(xhr.responseText));
            }
        }
    }
}
getCookie = function(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}
createDom = function(domname, attr) {
    var dom = document.createElement(domname);
    if (typeof attr == 'undefined') {
        return dom;
    }
    else {
        for ( var i in attr ) {
            dom.setAttribute(i, attr[i]);
        }

        return dom;
    }
}
addClass = function(doms, classname) {
    if (!(doms instanceof NodeList)) {
        doms = new Array(doms);
    }

    for (var i=0; i < doms.length; i++) {
        doms[i].className += ' '+classname;
    }
}
removeClass = function(doms, classname) {
    if (!(doms instanceof NodeList)) {
        doms = new Array(doms);
    }
    if (!(classname instanceof Array)) {
        classname = new Array(classname);
    }
    var tmpclass;
    for (var i=0; i < doms.length; i++) {
        tmpclass = doms[i].className.split(' ');

        doms[i].className = tmpclass.filter(function(item, index, array){
            for (var i=0; i < classname.length; i++) {
                if (item == classname[i]) {
                    return false;
                }
            }
            return true;
        }).join(' ');
    }
}
getShotPic = function(title, timestamp, cb) {
    ajax({
        url: '/pageshot',
        method: 'post',
        contentType: 'json',
        responseType: 'blob',
        data: {
            title: title,
            timestamp: timestamp
        },
        callback: function(data) {
            var img = new Image();
            img.onload = function() {
                window.URL.revokeObjectURL(img.src);
                cb(img);
            }
            img.src = window.URL.createObjectURL(data);
        }
    });
}
//这个功能暂时还没扩展 暂时只用HTMLEvents吧兼容性没考虑 时间够再说
eventTrigger = function(e, dom) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(e, true, true);
    dom.dispatchEvent(event);
    delete event;
}
