/////////////////////////////////////// TRASH

$('#empty-trash').click(function(e) {
  $('.trash-project').each(function(index, project) {
    var id = $(project).attr('id');
    var body = {id: id};
    console.log(id);
    $.post('/admin/remove_project', body, function(msg) {
      if (msg=='success') $(project).remove();
    })
  });
});

function toggleTrash(){
  console.log('adfsgs');
  $('.trash-wrapper').toggleClass('show-trash');
}
