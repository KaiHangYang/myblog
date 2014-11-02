(function(){
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
