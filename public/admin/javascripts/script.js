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

/////////////////////////// ERROR HANDLING

var errorList = {
  err_urlNameInvalid: 'Der URL-Name darf nicht leer sein. Der URL-Name darf keine Sonderzeichen oder Umlaute enthalten.',
  err_urlNameNotUnique: 'Der URL-Name existiert bereits.'
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
    msg = msg + "<p>" + string + "</p>";
  });
  return msg;
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

//////////////////////////////// FORM SUBMITTING

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
  if (errorsExist) {
    var list = prepareErrorList();
    showMsg('warning', list);
  }
  else {
    var id = $(obj).data('projectid');
    var $nameObj = $('#project-name-input');
    var name = $nameObj.val();
    var oldName = $nameObj.data('currentName');
    var description = $('#description').val();
    var layout = $('input[name=layout]:checked').val();
    var menuname = $('#menuname').val();
    var visible = $('#visible-check').is(':checked');

    var $loadingWrapper = $('.loading-wrapper');
    var $loadingScreen = $('.loading-screen');

    var body = {
      id            : id,
      description   : description,
      layout        : layout,
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
  var $imgdesc = $imgli.find('.form-img--desc:first');
  var imgdesc = $imgdesc.val();
  var $imgNameP = $imgli.find('.img-name-p');

  var body = {
    project_id  : pId,
    image_id    : iId,
    name        : imgname,
    desc        : imgdesc

  };

  if (imgname !== '') {
    $.post('/admin/edit_image', body, function(data){
      if (data == 'success') {
        $imgname.data('imgname', imgname);
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