(function(){
    //flag used bellow;
    var changed = true;
    var resizeFalg = true;

	function headerChange(tag) {
        if (window.innerWidth <= 700) {
            if (changed) {
                $('#header_fixed').removeAttribute('style');
                $('#header_unfixed').removeAttribute('style');
                changed = false;
            }
            return;
        }
        else if (tag == 0) {
            if (css($('#header_unfixed'), 'opacity') == '1') {
                $('#header_unfixed').style.opacity = 0;
                $('#header_fixed').style.display = 'block';
                (changed == false)?changed = true:null;
            }
        }
        else {
            if (css($('#header_fixed'), 'display') == 'block') {
                $('#header_fixed').style.display = 'none';
                $('#header_unfixed').style.opacity = 1;
                (changed == false)?changed = true:null;
            }
        }
    }
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 700) {
            if (resizeFalg) {
                $('#header_fixed').removeAttribute('style');
                $('#header_unfixed').removeAttribute('style');
                resizeFalg = false;
            }
        }
        else {
            (!resizeFalg)?resizeFalg=true:null;
        }
    });
    window.addEventListener('load', function(){
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
