var projectId;
var currentImageDesc;
var $currentImageNameInput;
var $activeNameInput;
var currentImgId;
var errorsExist = false;
var activeErrorList = [];

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

$(document).ready(function() {
  var $active = $('.project-list').find('.active');
  if ($active) {

    $active.parents('.li-container').parents('.li-container').each(function(i, obj) {
      $(obj).addClass('hasActiveChild');
    })


  }
});

/////////////////////////// SORTABLE LISTS

$(function() {
  $(".sortable").sortable({
    update: function(event, ui){
      var ul = ui.item.parent();
      var dataObj = { };
      var projectId;
      ul.children('.li-container').each(function(i, ui) {
        var li = $(this);
        projectId = li.attr('id');
        dataObj['position' + projectId] = i;
      });
      console.log(dataObj);
      $.ajax({
        url: '/admin/projectsort',
        type: 'post',
        data: dataObj
      }).done(function() {
        // location.reload();
      });
    }
  });
  // $(".sortable").on('sortupdate', function(event, ui){
  //   var ul = ui.item.parent();
  //   var dataObj = { };
  //   var projectId;
  //   ul.children('.li-container').each(function(i, ui) {
  //     var li = $(this);
  //     projectId = li.attr('id');
  //     dataObj['position' + projectId] = i;
  //   });
  //   console.log(dataObj);
  //   // $.ajax({
  //   //   url: '/admin/projectsort',
  //   //   type: 'post',
  //   //   data: dataObj
  //   // }).done(function() {
  //   //   // location.reload();
  //   // });
  // })

});
/////////////////////////// ERROR HANDLING

var errorList = {
  err_project_name_input: "Name darf nicht leer sein.",
  err_title: "Titel darf nicht leer sein.",
  err_urlNameInvalid: 'Der URL-Name darf nicht leer sein. Der URL-Name darf keine Sonderzeichen oder Umlaute enthalten.',
  err_urlNameNotUnique: 'Der URL-Name existiert bereits. Vielleicht auch im Mistkübel.'
};

function checkIfErrorExists(errorname) {
  if (activeErrorList.length>0) {
    return ($.inArray(errorname, activeErrorList) !== -1)
  }
}

function handleError(errorname) {
  if (!checkIfErrorExists(errorname)) {
    activeErrorList.push(errorname);
    errorsExist = true;
  }
}

function removeError(errorname) {
  if (checkIfErrorExists(errorname)) {
    var index = $.inArray(errorname, activeErrorList);
    activeErrorList.splice(index, 1);

    if (activeErrorList.length == 0) errorsExist = false;
  }
}

function prepareErrorList() {
  var msg = '';
  var string;

  $.each(activeErrorList, function(index, value){
    string = errorList[value];
    console.log('string: ', string);
    msg = msg + "<li>" + string + "</li>";
  });
  return msg;
}

function collectErrors() {
  $('.notempty').each(function(err, obj) {
    var errorname = "err_" + obj.id;
    errorname = errorname.replace(/-/g , "_");
    if (!obj.value) {
      handleError(errorname);
      errorsExist = true;
    }
    else removeError(errorname)
  });
}

//////////////////////////////// MESSAGE BOARD
var msgList = ['warning', 'info', 'alert'];

function closeMsg() {
  msgList.forEach(function(cat){
    $('msg-content').removeClass(cat);
  });
  $('.msg-wrapper').fadeOut(300);
}

function showMsg(cat, content) {
  var $msg = $('.msg-content');
  var catName;
  $msg.addClass(cat);
  switch(cat) {
    case 'warning':
      catName = 'Warnung';
      break;
    case 'info':
      catName = 'Information';
      break;
    case 'alert':
      catName = 'Achtung';
  }
  $('.msg-title').html(catName);
  $('.msg-message').html(content);
  $('.msg-wrapper').fadeIn(300);

}

//////////////////////////////// FOLDING MENU

$('.folder').on('click', function(event) {
  $obj = $(this).closest('.li-container');

  $obj.toggleClass('unfold');

  var unfold = $obj.hasClass('unfold');
  // var $active = $obj.find('.active');
  // if ($active) {
  //   if (!unfold) {
  //
  //     $active.parents('.li-container').each(function(i, obj) {
  //       $(obj).addClass('hasActiveChild');
  //     })
  //   }
  //
  // }

  var id = $obj.attr('id');
  var body = {
    id: id,
    unfold: unfold
  };

  $.post('/admin/togglefold', body, function(msg) {
    console.log(msg);
  });
});

//////////////////////////////// FORM SUBMITTING

$('.project-form form').on('submit', function(event) {
  event.preventDefault();

  var $projectName = $('#project-name');
  var name = $projectName.val();
  var projectParentId = $projectName.data('whoid');
  if (name!=='' && projectParentId == undefined) {

    $.post('/admin/create_project', {name: name}, function (data) {
      var $list = $('.project-list > .project-ul');

      $list.append('<li class="li-container" id='+data+'>\n' +
        '  <div class="li-wrapper">\n' +
        '    <div class="menu-link">\n' +
        '      <div class="nothing"></div><a href="/admin/project/' + data + '"><span class="upper small">'+ name +'</span></a>\n' +
        '    </div><a href="/admin/delete/' + data + '" class="delete"><img/></a>\n' +
        '  </div>\n' +
        '</li>')



    })
  }
  else if (name!=='' && projectParentId !== undefined) {
    var $parent = $('#' + projectParentId);
    var $list = $('#' + projectParentId + ' > .sub-list');
    if (!$list.length) {
      $parent.append('<ul class="unstyled sub-list sortable connect-sortable"></ul>');
      $list = $list = $('#' + projectParentId + ' > .sub-list');

    }
    $.post('/admin/create_sub_project', {name: name, parentId: projectParentId}, function (data) {
      $list.append('<li class="li-container" id='+data+'>\n' +
        '  <div class="li-wrapper">\n' +
        '    <div class="menu-link">\n' +
        '      <div class="nothing"></div><a href="/admin/project/' + data + '"><span class="upper small">'+ name +'</span></a>\n' +
        '    </div><a href="/admin/delete/' + data + '" class="delete"><img/></a>\n' +
        '  </div>\n' +
        '</li>');
      $('#' + projectParentId + ' > .li-wrapper > .menu-link > .nothing').addClass('folder').removeClass('nothing').click(function() {
        $obj = $(this).closest('.li-container');

        $obj.toggleClass('unfold');

        var unfold = $obj.hasClass('unfold');
        var id = $obj.attr('id');
        var body = {
          id: id,
          unfold: unfold
        };

        $.post('/admin/togglefold', body, function(msg) {
          console.log(msg);
        });
      });
      $('#' + projectParentId).addClass('unfold');
    })
  }
  $projectName.val('');

});

//////////////////////////////       SAVE ALL!

function saveAll(obj) {
  collectErrors();
  if (errorsExist) {
    var list = prepareErrorList();
    showMsg('warning', list);
  }
  else {
    var id = $(obj).data('projectid');
    var $nameObj = $('#project-name-input');
    var name = $nameObj.val();
    var oldName = $nameObj.data('currentname');
    var title = $('#title').val();
    var description = $('#description').val();
    var layout = $('input[name=layout]:checked').val();
    var orderedList = $('#listtype').is(':checked');
    var menuname = $('#menuname').val();
    var visible = $('#visible-check').is(':checked');

    var $loadingWrapper = $('.loading-wrapper');
    var $loadingScreen = $('.loading-screen');
    console.log(oldName);
    var body = {
      id            : id,
      title         : title,
      oldname       : oldName,
      description   : description,
      layout        : layout,
      orderedList   : orderedList,
      menuname      : menuname,
      visible       : visible
    };

    if (name != oldName) {
      body.name = name;
      body.namechanged = true
    }

    $loadingWrapper.addClass('show');
    $loadingWrapper.fadeTo(300, 1, function(next){
      $.post('/admin/save_all', body, function(msg) {
        if (msg=='changed') {
          console.log(msg);
          $('.li-wrapper.active > .menu-link > a > span').text(name);
          $nameObj.data('currentname', name);
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
}

function reloadAll() {
  location.reload();
}

///////// Update Imgaes

function successAnimation(obj) {
  obj.addClass('updated').delay(1000).queue(function(next){
    $(this).removeClass('updated');
    next();
  })
}

function updateImage(obj, objId, cat) {
  var length = cat.length + 1;
  var id = objId.substring(length);
  projectId = $('.current-id').data('id');
  var status;
  var $parentLi = $(obj).closest('.img-li');
  if (cat == 'visibility') {status = $(obj)[0].checked;}
  var body = {
    imgid  : id,
    proid  : projectId,
    vistatus : status
  };
  $.post('/admin/update_image/' + cat, body, function(data) {
    if (data=='success') {
      if (cat=='delete') {
        $parentLi.hide();
      }
      else {
        successAnimation($parentLi);
      }
    }
  });
}

function imageView(obj, pId) {

  var $this = $(obj).parent();
  var thisId = $this.attr('id');
  if (currentImgId !== thisId) {
    currentImgId = thisId;
    var id = '#imgList_' + pId;
    var $container = $(id);
    // var $form = $this.find('.img-form').first();
    // $currentImageNameInput = $form.find('.form-img--name:first');
    var $active = $('.img-li.active');
    var $activeForm = $active.find('.img-form').first();
    $activeNameInput = $activeForm.find('.form-img--name:first');
    $activeDescInput = $activeForm.find('.form-img--desc:first');
    $container.addClass('big-view');
    $activeNameInput.val($activeNameInput.data('imgname'));
    $activeDescInput.val($activeDescInput.data('imgdesc'));
    $active.removeClass('active');

    $this.addClass('active');
  }

}

function saveImgEdit(pId, iId) {
  var $imgli = $(".img-li.active");
  var $imgname = $imgli.find('.form-img--name:first');
  var imgname = $imgname.val();
  var $imgref = $imgli.find('.form-img--ref:first');
  var imgref = $imgref.val();
  var $imgdesc = $imgli.find('.form-img--desc:first');
  var imgdesc = $imgdesc.val();
  var $imgNameP = $imgli.find('.img-name-p');

  var body = {
    project_id  : pId,
    image_id    : iId,
    name        : imgname,
    reference   : imgref,
    desc        : imgdesc

  };

  if (imgname !== '') {
    $.post('/admin/edit_image', body, function(data){
      if (data == 'success') {
        $imgname.data('imgname', imgname);
        $imgname.data('imgref', imgref);
        $imgdesc.data('imgdesc', imgdesc);
        $imgNameP.text(imgname);
        successAnimation($imgli);
      }
    })
  }
  else {
    alert('Name darf nicht leer sein.');
  }



}

function cancelImgEdit() {
  var $imgli = $(".img-li.active");
  var $imgname = $imgli.find('.form-img--name:first');
  var $imgdesc = $imgli.find('.form-img--desc:first');
  $imgname.val($imgname.data('imgname'));
  $imgdesc.val($imgdesc.data('imgdesc'));
}

function closeBigView() {
  var $imgli = $(".img-li.active");
  cancelImgEdit();
  $imgli.removeClass("active");
  $('.big-view').removeClass("big-view");
  currentImgId = '';
}

function isValid(str) { return /^\w+$/.test(str); }

function checkIfValid(obj) {
  var $obj = $(obj);
  var name = $obj.val();
  $obj.removeClass('notunique');

  if (!isValid(name)) {
    $obj.addClass('invalid');
  }
  else {
    $('.invalid').removeClass('invalid');

  }

  delay(function(){
    checkNameIsUnique(obj);
  }, 300);

}

function checkNameIsUnique(obj) {
  var $obj = $(obj);
  var name = $obj.val();
  var id = $obj.data('projectid');
  var body = {
    name: name,
    id  : id
  };
  if (name!='') {
    if (isValid(name)) {
      $('.invalid').removeClass('invalid');
      removeError('err_urlNameInvalid');

      $.post('/admin/check_name', body, function(msg) {
        if (msg!='error') {
          if (msg=='not_unique') {
            $obj.addClass('notunique');
            handleError('err_urlNameNotUnique');
          }
          else {
            removeError('err_urlNameNotUnique');
            $obj.removeClass('notunique');
          }
        }

      });
    }
    else {
      console.log('name not valid');
    //  error msg!
      $obj.addClass('invalid');
      $obj.removeClass('notunique');
      handleError('err_urlNameInvalid');
    }

  }
  else console.log('cannot be empty!')

}

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