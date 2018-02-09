function changeImage(direction) {
  $active = $('.img-active');
  if (direction=='next' && $active.next('.image').length) {
    $active.removeClass('img-active').next('.image').addClass('img-active');
    if ($active.nextAll('.image').eq(1).length) return true;
    else return false;
  }
  if (direction=='prev' && $active.prev('.image').length) {
    $active.removeClass('img-active').prev('.image').addClass('img-active');
    if ($active.prevAll('.image').eq(1).length) return true;
    else return false;
  }

}

$(document).ready(function(){

  ////////////////////////////////////////////// SHOW OR HIDE update title

  if (!$('.update').length) {
    $('.update-title').addClass('hidden');
  }


  ///////////////////////////////////// IMAGE GALLERY

  $gal = $('.image-gallery');

  function openGallery() {
    if (!$gal.hasClass('opened')) {
      $gal.addClass('opened');
    }
  }

  $(document).keydown(function(event) {
      if((event.keyCode == 27) && $gal.hasClass('opened')) {
        event.preventDefault();
        $('.opened').removeClass('opened');
      }
    }
  );


  $('.image').click(function(e) {
    openGallery();
  });
  $('.gal-indicator').click(function(e) {
    openGallery();
  });


  $('.close-button').click(function () {
    $('.opened').removeClass('opened');
  });

  $('.gal-control').click(function () {
    $this = $(this);
    if (($this).hasClass('back')) {
      $('.disable').removeClass('disable');
      if (!changeImage('prev')) {
        $this.addClass('disable');
      }
      else {
        $this.removeClass('disable');
      }
    }
    if (($this).hasClass('forward')) {
      $('.disable').removeClass('disable');
      if (!changeImage('next')) {
        $this.addClass('disable');
      }
      else {
        $this.removeClass('disable');
      }
    }
  })
});
