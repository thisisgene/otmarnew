/////////////////////////////////////// TRASH

$('#empty-trash').click(function(e) {

  $.get('/admin/remove_project', function(msg) {
    if (msg=='success') {
      $(".trash-project-list").remove();
    }
  });

});

function toggleTrash(){
  $('.trash-wrapper').toggleClass('show-trash');
}
