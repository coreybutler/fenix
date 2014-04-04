// ************************ //
// Browser Detection
// ************************ //
$(document).ready(function() {
jQuery.each(jQuery.browser,function(i,d){
 (d === true) ? jQuery('body').addClass(i) : jQuery('body').addClass('v'+d.replace(/\./g,'-'));
});
});

// ************************ //
// Phone Owl Carousel Configuration - Phone Slider
// ************************ //
$(document).ready(function() {
     var itemamount = 2; // Adjust this number to get the correct speed from last slide to first transition
    var rewindSpeed = itemamount * 300;
  $("#phone_prev").owlCarousel({
    addClassActive : true,
    itemsDesktop : [1200,3],
    itemsDesktopSmall : [960,3],
    itemsTablet: [769,3],
    itemsMobile : [700,3],
    responsiveBaseWidth: ".center_phone",
    items: itemamount,
    slideSpeed : 600,
    navigation: true,
    mouseDrag: true,
    navigationText : ["&#xf190;","&#xf18e;"],
    rewindSpeed: rewindSpeed,
    afterAction: function(el){
       //remove class active
       this
       .$owlItems
       .removeClass('active')
       //add class active
       this
       .$owlItems //owl internal $ object containing items
       .eq(this.currentItem + 1)
       .addClass('active')
      //fade in text
      $('.left_points').stop().delay(300).fadeIn();
      //hide 2 away
      var active = $('.active');
      active.siblings().removeClass('o_2away');
      active.next().next().addClass('o_2away');
      active.prev().prev().addClass('o_2away');
      $('.bullet').removeClass('show');
      $('.active .bullet').addClass('show');
     },
     afterInit: function(){
      $('#phone_prev').trigger("owl.goTo",0);
     }
  });
  $("#bin_prev").owlCarousel({
    addClassActive : true,
    itemsDesktop : [1200,3],
    itemsDesktopSmall : [960,3],
    itemsTablet: [769,3],
    itemsMobile : [700,3],
    responsiveBaseWidth: ".center_bin",
    items: itemamount,
    slideSpeed : 600,
    navigation: true,
    mouseDrag: true,
    navigationText : ["&#xf190;","&#xf18e;"],
    rewindSpeed: rewindSpeed,
    afterAction: function(el){
       //remove class active
       this
       .$owlItems
       .removeClass('active')
       //add class active
       this
       .$owlItems //owl internal $ object containing items
       .eq(this.currentItem + 1)
       .addClass('active')
      //fade in text
      $('.left_points').stop().delay(300).fadeIn();
      //hide 2 away
      var active = $('.active');
      active.siblings().removeClass('o_2away');
      active.next().next().addClass('o_2away');
      active.prev().prev().addClass('o_2away');
      $('.bullet').removeClass('show');
      $('.active .bullet').addClass('show');
     },
     afterInit: function(){
      $('#bin_prev').trigger("owl.goTo",0);
     }
  });
// ************************ //
// Fade Out on Window Resize
// ************************ //
var is_touch_device = 'ontouchstart' in document.documentElement;
var viewport = $(window).width()
if (is_touch_device != true && viewport > 768) {
     function resizedw(){
      $('#phone_prev').fadeIn();
      $('#bin_prev').fadeIn();
  }
  var doit;
  window.onresize = function(){
    $('#phone_prev').hide();
    $('#bin_prev').hide();
    clearTimeout(doit);
    doit = setTimeout(resizedw, 200);
  };
}
});

// ************************ //
// Magnifying Glass
// ************************ //
$(document).ready(function()
{
  $("#magni_img").mlens(
  {
    imgSrc: $("#magni_img").attr("data-big"),     // path of the hi-res version of the image
    imgSrc2x: $("#magni_img").attr("data-big2x"),  // path of the hi-res @2x version of the image
                                                                   //for retina displays (optional)
    lensShape: "circle",        // shape of the lens (circle/square)
    lensSize: 230,          // size of the lens (in px)
    borderSize: 0,          // size of the lens border (in px)
    borderColor: "#0e0f10",        // color of the lens border (#hex)
    borderRadius: 0,        // border radius (optional, only if the shape is square)
    imgOverlay: $("#magni_img").attr("data-overlay"), // path of the overlay image (optional)
    overlayAdapt: true // true if the overlay image has to adapt to the lens size (true/false)
  });
});

// ************************ //
// Gallery Images
// ************************ //
$(document).ready(function() {

  $("#gallery-images").owlCarousel({
    itemsDesktop : [2000,4],
    itemsDesktopSmall : [1200,3],
    itemsTablet: [769,3],
    itemsMobile : [350,2],
    navigation : true,
    slideSpeed : 600,
    mouseDrag: true,
    pagination : true,
    navigationText : ["&#xf190;","&#xf18e;"]
  });

// ************************ //
 // prettyPhoto Settings
 // ************************ //
$("a[rel^='prettyPhoto']").prettyPhoto({
      theme: 'dark_rounded',
      markup: '<div class="pp_overlay"></div> \
      <div class="pp_pic_holder"> \
            <div class="ppt">&nbsp;</div> \
            <div class="pp_content_container"> \
                <div class="pp_content"> \
                  <div class="pp_loaderIcon"></div> \
                  <div class="pp_fade"> \
                    <div class="pp_hoverContainer"> \
                      <a class="pp_next" href="#">next</a> \
                      <a class="pp_previous" href="#">previous</a> \
                    </div> \
                    <div id="pp_full_res"></div> \
                    <div class="pp_details"> \
                      <div class="pp_nav"> \
                        <a href="#" class="pp_arrow_previous">Previous</a> \
                        <p class="currentTextHolder">0/0</p> \
                        <a href="#" class="pp_arrow_next">Next</a> \
                      </div> \
                      <p class="pp_description"></p> \
                      {pp_social} \
                    </div> \
                  </div> \
              </div> \
            </div> \
            <a class="pp_close" href="#"><i class="fa">&#xf00d;</i></a> \
          </div>'
    });

// ************************ //
// Bullets in Phone View
// ************************ //
$('.bullet').click(function(){
  var viewport = $(window).width();
  if (viewport < 740) {
  $(this).find('div').clone().appendTo('.phoneOverlay div');
  $('.phoneOverlay').fadeIn();
  }
});
$('.phoneOverlay').click(function(){
  $(this).fadeOut().find('div').empty();
});

// ************************ //
// Move nav in and Push Page
// ************************ //
$('.phone-menu').click(function(){
  $('body').animate({
    'right' : '240px'
  }, 310, "easeInOutCirc", function(){
    $(this).addClass('open');
  });
});

$('body').click(function(){
  if ( $(this).hasClass('open') ) {
    $(this).animate({
      'right' : 0
    }, 310, "easeInOutCirc", function(){
      $(this).removeClass('open');
    });
  }
});

// ************************ //
// Initiate Fast Click for Optimal Mobile Browsing
// ************************ //
$(function() {
    FastClick.attach(document.body);
});

// ************************ //
// Scrolling
// ************************ //
$('nav.main_navigation li a').click(function(e){
      e.preventDefault();
      var $this = $($(this).attr('href'));
      $('html,body').animate({
        'scrollTop': $this.offset().top+'px'
      }, "easeInOutCirc");
    });

});
