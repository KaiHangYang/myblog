(function(){
	function headerChange(tag) {
        if (tag == 0) {
            if (css($('#header_unfixed'), 'opacity') == '1') {
                $('#header_unfixed').style.opacity = 0;
                $('#header_fixed').style.display = 'block';
            }
        }
        else {
            if (css($('#header_fixed'), 'display') == 'block') {
                $('#header_fixed').style.display = 'none';
                $('#header_unfixed').style.opacity = 1;
            }
        }
    }
    window.addEventListener('load', function(){
        if (location.pathname == '/' || location.pathname == '/admin') {
            setInterval(function(){
                eventTrigger('resize', window);
            }, 1000);
        }
        
		window.addEventListener('scroll', function(){
	        var top = document.documentElement.scrollTop;
	        if (top <= 90) {
	            headerChange(1);
	        }
	        else {
	            headerChange(0);
	        }
		});
    });
})();
