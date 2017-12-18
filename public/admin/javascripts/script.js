$('.project-form form').on('submit', function(event) {
  event.preventDefault();
  var $projectName = $('#project-name');
  var name = $projectName.val();
  // var $table = $('.project-list table tbody');
  var projectParentId = $projectName.data('whoid');

  if (name!=='' && projectParentId == undefined) {

    $.post('/admin/create_project', {name: name}, function (data) {

      // TODO: ADD PROJECTS AS SOON ON THE FLY

      // $table.append(' <tr id='+ data +'>\n' +
      //   '  <td class="w60">\n' +
      //   '    <a href="/admin/project/'+data+'"><p class="upper small">' + name + '</p></a>\n' +
      //   '  </td>\n' +
      //   '  <td class="w20">\n' +
      //   '    <div class="smaller"><a href="#">edit</a></div>\n' +
      //   '  </td>\n' +
      //   '  <td class="w20">\n' +
      //   '    <div class="smaller"><a href="/admin/delete/' +data+ '">delete</a></div>\n' +
      //   '  </td>\n' +
      //   '  <td class="w20">\n' +
      //   '    <div class="smaller"><a href="#">+</a></div>\n' +
      //   '  </td>\n' +
      //   '</tr> ');

      $projectName.val('');

    });
  }
  else if (name!=='' && projectParentId !== undefined) {
    $.post('/admin/create_sub_project', {name: name, parentId: projectParentId}, function (data) {
      console.log('success: ', data);
    })
  }
});


//       SAVE ALL!

function saveAll(obj) {
  var id = $(obj).data('projectid');
  var $nameObj = $('#project-name-input');
  var name = $nameObj.val();
  var oldName = $nameObj.data('currentName');
  var description = $('#description').val();
  var layout = $('input[name=layout]:checked').val();

  var $loadingWrapper = $('.loading-wrapper');
  var $loadingScreen = $('.loading-screen');

  var body = {
    id            : id,
    description   : description,
    layout        : layout
  };

  if (name != oldName) {
    body.name = name;
    body.namechanged = true
  }

  $loadingWrapper.addClass('show');
  $loadingWrapper.fadeTo(300, 1, function(next){
    $.post('/admin/save_all', body, function(msg) {
      console.log('saved successfully');
      if (msg=='changed') {
        $('.li-wrapper.active > a > span').text(name);
      }
      $loadingScreen.addClass('success').delay(100).queue(function(next) {

        $loadingWrapper.fadeTo(1800,0, function() {

          $(this).removeClass('show');
        });
        $(this).delay(1900).queue(function(next){
          $(this).removeClass('success');
          next();
        });
        next();
      })
    })
  })
}

function reloadAll() {
  location.reload();
}