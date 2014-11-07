(function(){

    var init = function(){
        var hlblocks = $$('.markdown-body pre,code');
        if (hlblocks.length != 0) {
            for (var i=0; i < hlblocks.length; i++) {
                hljs.highlightBlock(hlblocks[i]);
            }
        }
    }
    window.onload = init;
})();
