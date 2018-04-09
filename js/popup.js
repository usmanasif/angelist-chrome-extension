var baseUrl = "http://localhost:3000/v1/angels/match_candidates";
var candidatesArray = [];
var refreshIntervalId;

function onInit(){
  $(window).on('load', function(){
    refreshIntervalId = setInterval(function(){
      if (candidatesArray.length != 0) {
        clearInterval(refreshIntervalId);
        console.log(candidatesArray);
        matchCandidates();
      } else {
        candidatesArray = extractCandidates();
      }
    }, 2000);
  });
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
    $.each( obj["assessments"], function( i, ob ) {
      var score = ob["score"] == null ? "0" : ob["score"];
      $("[data-candidate_id="+ obj['angel_id'] +"]").append('<div style="width: 100%; display: table; width: 100%;"> \
        <div style="display: inline-block; width: 54px; vertical-align: middle;"> \
          <img style="width: 46px;" src="'+chrome.extension.getURL("images/qualified-icon.jpg")+'"> \
        </div> \
        <div style=" display: inline-block; vertical-align: middle; color: #00a466; font-size: 15px;"> \
          <i class="fa fa-check-circle" aria-hidden="true"></i> '+ titleize(obj['state']) +' \
        </div> \
        <div style="border-radius: 25px; border: 2px solid #00a466; padding: 5px; display: inline-block; vertical-align: middle; float: right; margin: 9px 8px 0 0;">'+ score +'%</div>'
        );
    });
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
  $.post( baseUrl,
    {
      candidates: JSON.stringify(candidatesArray)
    },
    function(data, status){
      if (data.length != 0) {
        updateCandidates(data);
      } else {
        console.log("No data found!");
      }
  });
}

// start extention
onInit();