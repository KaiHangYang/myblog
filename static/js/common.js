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
addAttr = function(dom, attr) {
    //attr 是一个对象
    if (typeof attr != 'object') {
        throw new Error('AttrError：传入的不是一个属性对象');
    }

    for (i in attr) {
        dom.setAttribute(i, attr[i]);
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

//附加的函数 waterfall
waterfall = {
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
//一个状态条
statusBar = {
    barDom: '',
    inited: false,
    init: function(){

        if (statusBar.inited) {
            throw new Error('statusBar 重复初始化');
        }

        var innerSpan = createDom('span');
        var statusDiv = createDom('div', {'class': 'status_bar'});
        var textDiv = createDom('div');

        statusDiv.appendChild(innerSpan);
        statusDiv.appendChild(textDiv);

        statusDiv.style.display = 'none';
        statusDiv.style.opacity = 0;
        statusBar.barDom = statusDiv;
        document.documentElement.appendChild(statusDiv);
        statusBar.inited = true;
    },
    show: function(text) {
        if (!statusBar.inited) {
            throw new Error('状态栏还没有初始化！');
        }

        var t = (typeof text == 'undefined')?"":text;

        $('.status_bar>div').innerText = t;
        statusBar.barDom.style.display = 'block';
        statusBar.barDom.style.opacity = 1;
    },
    hide: function(time) {
        if (!statusBar.inited) {
            throw new Error('状态栏还没有初始化！');
        }
        var t = (typeof time == 'undefined')?0:time;

        setTimeout(function(){
            $('.status_bar>div').innerText = "";
            statusBar.barDom.style.opacity = 0;

            setTimeout(function(){
                statusBar.barDom.style.display = 'none';
            }, 1000);
        }, t);
    },
}
