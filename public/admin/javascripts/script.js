$('.project-form form').on('submit', function(event) {
  event.preventDefault();
  var $projectName = $('#project-name');
  var name = $projectName.val();
  var $table = $('.project-table table tbody');
  var projectParent = $projectName.data('who');

  console.log(projectParent);

  // if (name!=='') {
  //
  //   $.post('/admin/create_project', {name: name}, function (data) {
  //     console.log('success', data);
  //     $table.append(' <tr id='+ data +'>\n' +
  //       '  <td class="w60">\n' +
  //       '    <a href="/admin/project/'+data+'"><p class="upper small">' + name + '</p></a>\n' +
  //       '  </td>\n' +
  //       '  <td class="w20">\n' +
  //       '    <div class="smaller"><a href="#">edit</a></div>\n' +
  //       '  </td>\n' +
  //       '  <td class="w20">\n' +
  //       '    <div class="smaller"><a href="/admin/delete/' +data+ '">delete</a></div>\n' +
  //       '  </td>\n' +
  //       '  <td class="w20">\n' +
  //       '    <div class="smaller"><a href="#">+</a></div>\n' +
  //       '  </td>\n' +
  //       '</tr> ');
  //
  //     $projectName.val('');
  //
  //   });
  //
  // }
});

function openProject(id) {
  console.log("hallo, " + id);
}