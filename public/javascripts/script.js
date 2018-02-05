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
  $('.image').click(function(e) {
    console.log('asdfgdhf')
    $obj = $(this).parent();
    if (!$obj.hasClass('opened')) {
      $obj.addClass('opened');

    }
  });
  $('.close-button').click(function () {
    console.log('adf');
    $('.opened').removeClass('opened');
  })

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
