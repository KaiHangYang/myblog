(function(){

    var init = function(){
        var hlblocks = $$('.markdown-body pre,code');
        if (hlblocks.length != 0) {
            for (var i=0; i < hlblocks.length; i++) {
                hljs.highlightBlock(hlblocks[i]);
            }
        }
        $('.setting_bar').onclick = function() {
            if (typeof this.hide == 'undefined' || this.hide){
                this.hide = false;
                removeClass($$('.bar'), ['bar_initial']);
            }
            else {
                this.hide = true;
                addClass($$('.bar'), 'bar_initial');
            }
        }
        $('.back_bar').onclick = function() {
            location.href = '/';
        }

        $('.edit_bar').onclick = function() {
            var timestamp = location.pathname.match(/\/[0-9]*\.[0-9]*/)[0].slice(1);
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
//                        location.href = '/'
                        console.log('failed');
                    }
                }
            })
        }
        $('.delete_bar').onclick = function() {
            var timestamp = location.pathname.match(/\/[0-9]*\.[0-9]*/)[0].slice(1);
            ajax({
                url: '/manage',
                method: 'post',
                contentType: 'json',
                data: {act: 'del', timestamp: timestamp},
                callback: function(data) {
                    if (data.success) {
                        location.href = '/';
                    }
                    else {
//                        location.href = '/';
                        console.log('failed');
                    }
                }
            });
        }
    }
    window.onload = init;
})();
