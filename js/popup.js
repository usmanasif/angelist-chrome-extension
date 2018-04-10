var baseUrl = "http://localhost:3000/v1/angel/match";
var candidatesArray = [];
var matchedCandidates = [];
var refreshIntervalId;
var refreshIntervalInfo;
var candidateId = "";

function onInit(){
  $(window).on('load', function(){
    trackCandidatesListing();
    trackDetailView();
  });
}

// track if candidates are listed
function trackCandidatesListing() {
  refreshIntervalId = setInterval(function(){
    if (candidatesArray.length != 0) {
      clearInterval(refreshIntervalId);
      console.log(candidatesArray);
      matchCandidates();
    } else {
      candidatesArray = extractCandidates();
    }
  }, 2000);
}

// track details view
function trackDetailView() {
  $(document).on("click", ".card, .mfp-arrow", function(){
    candidateId = "";
    // modalCheck();
  });
}

// check if modal is opened
function modalCheck() {
  refreshIntervalInfo = setInterval(function(){
    console.log(candidateId);
    if (candidatesArray.length != 0 && candidateId != "") {
      clearInterval(refreshIntervalInfo);
      updateModalView(candidateId);
    }
    else {
      if($(".mfp-content").is(":visible")){
        candidateId = $(".mfp-content [data-candidate-id]").attr("data-candidate-id");
      }
    }
  }, 1000);
}

// update assessments in modal
function updateModalView(candidateId) {
  var candidate = matchedCandidates.find(x => x.angel_id === candidateId);
  console.log(candidate);
  if (candidate != undefined) {
    $(".mfp-content [data-candidate-id="+ candidate['angel_id'] +"] .js-profile-details .info").prepend('<div class="assess details-row"> \
      <div class="s-flexgrid s-flexgrid--fixed"> \
        <div class="s-flexgrid--width2 s-flexgrid-colSm u-colorGrayA u-fontSize12 u-uppercase"> \
          Assess \
        </div> \
        <div class="assess-results collapsed-value s-flexgrid-colSmW s-vgPadLeft1 u-fontSize13"> \
        </div> \
      </div> \
    </div> ');
    if(candidate["assessments"].length > 1){
      $(".assess .assess-results").append('<div style="width: 100%; display: table; width: 100%;"> \
        <div style="display: inline-block; width: 54px; vertical-align: middle;"> \
          <img style="width: 40px;" src="'+chrome.extension.getURL("images/qualified-icon.jpg")+'"> \
        </div> \
        <div style=" display: inline-block; vertical-align: middle; color: #00a466; font-size: 100%;"> \
          <i class="fa fa-check-circle" aria-hidden="true"></i> '+ titleize(candidate['state']) +' \
        </div>  </div>');
      $.each( candidate["assessments"], function( i, ob ) {
        var score = ob["score"] == null ? "0" : ob["score"];
        $(".assess .assess-results").append(' <div style="padding: 4px; width: 100%; display: table; width: 100%;"> \
          <div style="font-weight: 600; display: inline-block; text-align: center; width: 30px; border-radius: 25px; border: 2px solid #00a466; padding: 5px; display: inline-block; vertical-align: middle;"> '+ score +'%</div> \
          <div style=" display: inline-block; vertical-align: middle; font-size: 100%; margin-left: 10px;"> \
            '+ titleize(ob['title']) +' \
          </div> </div>').slideDown();
      });
    } else {
      var score = candidate["assessments"][0]["score"] == null ? "0" : candidate["assessments"][0]["score"];
      $(".assess .assess-results").append('<div style="width: 100%; display: table; width: 100%;"> \
        <div style="display: inline-block; width: 54px; vertical-align: middle;"> \
          <img style="width: 40px;" src="'+chrome.extension.getURL("images/qualified-icon.jpg")+'"> \
        </div> \
        <div style=" display: inline-block; vertical-align: middle; color: #00a466; font-size: 100%;"> \
          <i class="fa fa-check-circle" aria-hidden="true"></i> '+ titleize(candidate['state']) +' \
        </div> \
        <div style="font-weight: 600; border-radius: 25px; border: 2px solid #00a466; padding: 5px; display: inline-block; vertical-align: middle; float: right; margin: 9px 8px 0 0;">'+ score +'%</div>'
        ).slideDown();
    }
  }
}

// extarct candidates data from page
function extractCandidates(){
  var candidates = [];
  $(".cards .card").each(function(index){
    var candidatesHash = {
      "angel_id": "",
      "name": ""
    };
    candidatesHash["angel_id"] = $(this).attr("data-candidate_id");
    candidatesHash["name"] = $(this).find(".card-content .title").text().replace(/[^a-zA-Z ]/g, "");
    if(candidatesHash['angel_id'] != undefined)
      candidates.push(candidatesHash);
  });
  return candidates;
}

// update candidates results
function updateCandidates(data) {
  $.each( data, function( index, obj ) {
    console.log(obj);
    if(obj["assessments"].length > 1){
      $("[data-candidate_id="+ obj['angel_id'] +"]").append('<div class="assessments" style="width: 100%; display: table; width: 100%;"> \
        <div style="display: inline-block; width: 54px; vertical-align: middle;"> \
          <img style="width: 40px;" src="'+chrome.extension.getURL("images/qualified-icon.jpg")+'"> \
        </div> \
        <div style=" display: inline-block; vertical-align: middle; color: #00a466; font-size: 100%;"> \
          <i class="fa fa-check-circle" aria-hidden="true"></i> '+ titleize(obj['state']) +' \
        </div>  </div>');
      $.each( obj["assessments"], function( i, ob ) {
        var score = ob["score"] == null ? "0" : ob["score"];
        $("[data-candidate_id="+ obj['angel_id'] +"]").append(' <div style="padding: 4px; width: 100%; display: table; width: 100%;"> \
          <div style="font-weight: 600; display: inline-block; text-align: center; width: 30px; border-radius: 25px; border: 2px solid #00a466; padding: 5px; display: inline-block; vertical-align: middle;"> '+ score +'%</div> \
          <div style=" display: inline-block; vertical-align: middle; font-size: 100%; margin-left: 10px;"> \
            '+ titleize(ob['title']) +' \
          </div> </div>').slideDown();
      });
    } else {
      var score = obj["assessments"][0]["score"] == null ? "0" : obj["assessments"][0]["score"];
      $("[data-candidate_id="+ obj['angel_id'] +"]").append('<div style="width: 100%; display: table; width: 100%;"> \
        <div style="display: inline-block; width: 54px; vertical-align: middle;"> \
          <img style="width: 40px;" src="'+chrome.extension.getURL("images/qualified-icon.jpg")+'"> \
        </div> \
        <div style=" display: inline-block; vertical-align: middle; color: #00a466; font-size: 100%;"> \
          <i class="fa fa-check-circle" aria-hidden="true"></i> '+ titleize(obj['state']) +' \
        </div> \
        <div style="font-weight: 600; border-radius: 25px; border: 2px solid #00a466; padding: 5px; display: inline-block; vertical-align: middle; float: right; margin: 9px 8px 0 0;">'+ score +'%</div>'
        ).slideDown();
    }
  });
}


function titleize(sentence) {
  if(!sentence.split) return sentence;
  var _titleizeWord = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    },
  result = [];
  sentence.split(" ").forEach(function(w) {
    result.push(_titleizeWord(w));
  });
  return result.join(" ");
}

// send request to api and match candidates
function matchCandidates() {
  $.ajax({
    url: baseUrl,
    type: 'PUT',
    data: {candidates: JSON.stringify(candidatesArray)},
    success: function(result) {
      if (result.length != 0) {
        matchedCandidates = result;
        updateCandidates(result);
      } else {
        console.log("No data found!");
      }
    }
  });
}

// start extention
onInit();