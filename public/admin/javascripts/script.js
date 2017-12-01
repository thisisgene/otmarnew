function create_project(obj) {
  var name = $('#project-name').val();
  console.log(name);
  var $table = $('.project-table table tbody');

  if (name!=='') {

    $.get('/admin/create_project/' + name, function (data) {
      console.log('success');
      $table.append(' <tr>\n' +
        '  <td class="w60">\n' +
        '    <p class="upper small">' + name + '</p>\n' +
        '  </td>\n' +
        '  <td class="w20">\n' +
        '    <div class="smaller"><a href="#">edit</a></div>\n' +
        '  </td>\n' +
        '  <td class="w20">\n' +
        '    <div class="smaller"><a href="#">delete</a></div>\n' +
        '  </td>\n' +
        '  <td class="w20">\n' +
        '    <div class="smaller"><a href="#">+</a></div>\n' +
        '  </td>\n' +
        '</tr> ');

    });

  }

}