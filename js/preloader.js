// ************************ //
// Preloader
// ************************ //
$(window).load(function(){
    $('#preload').delay(800).fadeOut(700, function(){
          $('.header_tag').addClass('animated fadeInUp delayp2');
          $('.phone_preview .regular_text_left').addClass('animated fadeInRight delayp6');
          $('.phone_preview .regular_text_right').addClass('animated fadeInLeft delayp4');
      });
      $('#preload').delay(800).find('.text-logo').removeClass('delayp2').addClass('fadeOutUp');
      $('#preload').delay(800).find('.prl').removeClass('delayp4').addClass('fadeOut');
});