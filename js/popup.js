var name_count = 0;
var names = [];
var length = 0;
var prev_length = 0;
var ids = [];

$(window).on('load', function(){

  setTimeout(function(){
    $(".cards > .card").each(function(index){
      ids[index] = $(this).attr("data-candidate_id");
    });

    $(".card-content > .details > .title").each(function(index){
      names[index] = $(this).text();
      name_count = index;
    });
  }, 5000);

});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "hello"){
      console.log("message incoming...");
      prev_length = names.length;
      $(".cards > .card").each(function(index){
        if ($(this).attr("data-candidate_id"))
          ids[index] = $(this).attr("data-candidate_id");
      });
      $(".card-content > .details > .title").each(function(index){
        if(index >= name_count){
          names[index] = $(this).text();
          name_count = index;
        }
      });
      console.log(ids);
      console.log(names);
      length = names.length;

      if(length == prev_length) {
        $(".cards > .card").each(function(index){
          if ($(this).attr("data-candidate_id")){
            $(this).append("<div class='u-fontSize4 u-colorGray6 s-vgBorderBottom0_5 s-vgPadTop0_5 s-vgPadBottom0_5 s-vgPadLeft1 s-vgPadRight1'><img style='width:15%;' src="+"'"+chrome.extension.getURL("images/qualified-icon.jpg")+"'"+"> YES YES</div>");
          }
        });
        sendResponse({farewell: "goodbye"});

      }
    }
});
