// ************************ //
// Inview Settings
// ************************ //
$(function () {

$('.header_tag, .phone_preview .regular_text_left, .phone_preview .regular_text_right').css('opacity',0);

    var viewport = $(window).width();
    if (viewport > 768) {

$('.regular_text_left, .regular_text_right, .list-items div, .center_phone, .feature-list, .features .title, .features a, .underline-p, .close-up .title, .landscape-phone, .gallery .title, .app_overview .title, #gallery-images, .newsletter .title, .work .title, .newsletter form, .footer .logo *').css('opacity','0');

// ************************ //
// App Features List Fade In
// ************************ //
  $('.list-items div:eq(0)').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInUp delayp2');   }});
  $('.list-items div:eq(1)').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInUp delayp4');   }});
  $('.list-items div:eq(2)').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInUp delayp6');   }});
  $('.list-items div:eq(3)').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInUp delayp6');   }});
  $('.list-items div:eq(4)').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInUp delayp8');   }});
  $('.list-items div:eq(5)').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInUp delay1s');   }});

// ************************ //
// Phone Slider FadeIn
// ************************ //
  $('.center_phone').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInUp delayp4');   }});

// ************************ //
// Feature List FadeIns
// ************************ //
    $('.feature-list').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInRight delayp2');   }});
    $('.features .title').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInRight');   }});
    $('.features a, .underline-p').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInRight delayp4');   }});

// ************************ //
// Close Up Section Fade Ins
// ************************ //
 $('.close-up .title').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInLeft delayp2');   }});
     $('.landscape-phone').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInUp delayp6');   }});

// ************************ //
// Gallery Section Fade Ins
// ************************ //
      $('.gallery .title, .app_overview .title').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInRight delayp2');   }});
     $('#gallery-images').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInUp delayp6');   }});

// ************************ //
// Newsletter Section FadeIns
// ************************ //
     $('.newsletter .title, .work .title').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInRight delayp2');   }});
      $('.newsletter form').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated fadeInLeft delayp2');   }});

// ************************ //
// Footer Fade In
// ************************ //
            $('footer .logo *').one('inview', function (event, visible) {
    if (visible) {   $(this).addClass('animated bounceIn delayp2');   }});
}
});