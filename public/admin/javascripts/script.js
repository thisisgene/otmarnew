$('.project-form form').on('submit', function(event) {
  event.preventDefault();
  var $projectName = $('#project-name');
  var name = $projectName.val();
  var $table = $('.project-table table tbody');

  if (name!=='') {

    $.post('/admin/create_project', {name: name}, function (data) {
      console.log('success', data);
      $table.append(' <tr onclick="openProject(this.id)" id='+ data +'>\n' +
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

      $projectName.val('');

    });

  }
});

function openProject(id) {
  console.log("hallo, " + id);
}