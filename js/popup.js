var matchCandidatesUrl = "http://localhost:3000/v1/angel/match";
var fetchCandidateUrl = "http://localhost:3000/v1/angel/candidate";
var ablyKey = "";
var ablyChannel = "";
var candidatesArray = [];
var matchedCandidates = [];
var refreshIntervalId;
var refreshIntervalInfo;
var candidateId = "";
var tarckModels = ["AssessmentResult", "TeamCandidate"];

function onInit(){
  $(window).on('load', function(){
    trackCandidatesListing();
    trackDetailView();
    // ablyUpdates();
  });
}

// track if candidates are listed
function trackCandidatesListing() {
  refreshIntervalId = setInterval(function(){
    if (candidatesArray.length != 0) {
      clearInterval(refreshIntervalId);
      candidatesArray = extractCandidates();
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
    modalCheck();
  });
}

// check if modal is opened
function modalCheck() {
  refreshIntervalInfo = setInterval(function(){
    if (matchedCandidates.length != 0 && candidateId != "") {
      clearInterval(refreshIntervalInfo);
      populateInviteTab();
      updateModalView(candidateId);
    }
    else {
      if($(".mfp-s-ready").is(":visible")){
        candidateId = $(".mfp-content [data-candidate-id]").attr("data-candidate-id");
      }
    }
  }, 1000);
}

// update cards
function renderUpdates(obj, className, type = "") {
  if (type == "update") {
    $(className).find(".qualified-candidate").remove();
  }
  if(obj["assessment_results"].length > 1){
    $(className).append('<div class="qualified-candidate" style="width: 100%; display: table; width: 100%;"> \
      <div style="display: inline-block; width: 54px; vertical-align: middle;"> \
        <img style="width: 40px;" src="'+chrome.extension.getURL("images/qualified-icon.jpg")+'"> \
      </div> \
      <div style=" display: inline-block; vertical-align: middle; color: #00a466; font-size: 100%;"> \
        <i class="fa fa-check-circle" aria-hidden="true"></i> '+ titleize(obj['state']) +' \
      </div> </div>');
    $.each( obj["assessment_results"], function( i, ob ) {
      var score = ob["assessment_score"] == null ? "0" : ob["assessment_score"];
      $(className).append(' <div class="qualified-candidate" style="padding: 4px; width: 100%; display: table; width: 100%;"> \
        <div style="font-size: 12px; font-weight: 600; display: inline-block; text-align: center; width: 30px; border-radius: 25px; border: 2px solid #00a466; padding: 5px; display: inline-block; vertical-align: middle;"> '+ score +'%</div> \
        <div style=" display: inline-block; vertical-align: middle; font-size: 100%; margin-left: 10px;"> \
          '+ ob['assessment_title'] +' \
        </div> </div>').slideDown();
    });
  } else {
    var score = obj["assessment_results"][0]["assessment_score"] == null ? "0" : obj["assessment_results"][0]["assessment_score"];
    $(className).append('<div class="qualified-candidate" style="width: 100%; display: table; width: 100%;"> \
      <div style="display: inline-block; width: 54px; vertical-align: middle;"> \
        <img style="width: 40px;" src="'+chrome.extension.getURL("images/qualified-icon.jpg")+'"> \
      </div> \
      <div style=" display: inline-block; vertical-align: middle; color: #00a466; font-size: 100%;"> \
        <i class="fa fa-check-circle" aria-hidden="true"></i> '+ titleize(obj['state']) +' \
      </div> \
      <div style="font-size: 12px; font-weight: 600; border-radius: 25px; border: 2px solid #00a466; padding: 5px; display: inline-block; vertical-align: middle; float: right; margin: 9px 8px 0 0;">'+ score +'%</div> </div>'
    ).slideDown();
  }
}

// update assessment_results in modal
function updateModalView(candidateId) {
  var candidate = matchedCandidates.find(x => x.angel_id === candidateId);
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
    renderUpdates(candidate, ".assess .assess-results");
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
    renderUpdates(obj, "[data-candidate_id="+ obj['angel_id'] +"]");
  });
}

// invite tab html
function populateInviteTab() {
  $('<li class="u-uppercase" data-tab="invite-tab"> \
    <a href="javascript:void(0);">Invite \
    </a></li>').appendTo('.mfp-content .nav-tabs .g-sub_nav');
  $('<div class="invite-tab js-tab hidden" style="display: none;"> \
    <div data-applicant-id="7570486"> \
      <div class="action conversation-editor"> \
        <div class="section-title u-fontSize18"> \
          Invite Candidate To An Assessment \
        </div> \
        <div class="section-subtitle s-vgBottom1_5 u-colorGray6"> \
          Invite candidate to a Qualified assessment. Once the candidate in invited, they will receive an email directly from Qualified \
          (not Angel.co) which will provide them instructions for taking the assessment. \
        </div> \
        <div class="s-form"> \
          <form id="invite_form" class="js-conversation-form"> \
            <input name="utf8" type="hidden" value="✓"> \
            <div class="s-grid s-vgTop1"> \
              <div class="field-row s-grid-colSm4 s-vgPadTop0_5"> \
                <label class="s-form-sideLabelLg u-fontSize14 u-colorGray9"> \
                  Assessment \
                </label> \
              </div> \
              <div class="s-grid-colSm12"> \
                <div class="js-new-email new-email"> \
                  <select class="s-form--blended js-email-template-select" name="assessment_id"> \
                    <option></option> \
                    <option value="6198">PM Prescreen Assessment</option> \
                    <option value="6711">Web Developer Assessment: Round 1</option> \
                  </select> \
                </div> \
              </div> \
            </div> \
            <div class="s-grid s-vgTop1"> \
              <div class="s-grid-colSm24 s-vgBottom0_5"> \
                <div class="input"> <span class="s-form-sideLabelLg u-fontSize14 u-colorGray9"> Custom Message: </span> \
                  <textarea name="body" id="body" rows="5" class="s-form u-fontSize14 external-message js-conversation-editor-textarea" placeholder="Type your message to here" style="overflow-x: hidden; word-wrap: break-word; resize: horizontal;"></textarea></div> \
                </div> \
              </div> \
              <div class="s-grid"> \
                <div class="s-grid-colSm24"> \
                  <div class="c-button c-button--blue js-send-email-button js-send s-vgRight0_5"> \
                    Invite To Assessment \
                  </div> \
                </div> \
              </div> \
            </form> \
          </div> \
          <div class=" dc22 fcn7 _a _jm" data-_tn="conversations/conversation" _js-initialized="true"><div class="conversation js-conversation s-vgTop1_5"> \
            <div class=" dc22 fme41 _a _jm" data-_tn="conversations/message" _js-initialized="true"><div class="message s-vgPadTop1 s-vgPadBottom1"> \
              <div class="photo"> \
                <a href="#"><img alt="" src="https://d1qb2nb5cznatu.cloudfront.net/users/7702113-medium_jpg?1522793467"></a> \
              </div> \
              <div class="message-content u-fontSize13 u-colorGray6"> \
                <div class="message-header"> \
                  <span class="message-sender u-fontWeight500"> \
                    <a href="#">Danielle</a> \
                  </span> \
                  <span class="comment-time u-fontSize11 u-colorGrayA"> \
                    1 day ago \
                  </span> \
                </div> \
                <div class="message-body"> \
                  <div class=" ds31 shared fet92 expandable_text _a _jm" data-_tn="shared/expandable_text" _js-initialized="true"> \
                    <div class="s-grid"> \
                      <div class="s-grid-colSm24"> \
                        <div style="padding: 7px 0px 14px 0px" class="c-button js-send-email-button js-send s-vgRight0_5"> \
                          Data Science Survey \
                        </div> \
                        <div class="js-delay-checkbox s-vgRight0_5 u-floatRight"> \
                          <div style="font-size: 12px; font-weight: 600; display: inline-block; text-align: center; width: 30px; border-radius: 25px; border: 2px solid #00a466; padding: 5px; display: inline-block; vertical-align: middle;"> 78%</div>  \
                        </div> \
                      </div> \
                    </div> \
                    <span class="js-truncated-text truncated-text"> \
                      <p>I am available anytime Monday the 16th after 11am.&nbsp; \
                      <br>Other than Monday, I am available via phone anytime at 2:30pm or after 5:15pm.&nbsp;Let me know what works bests if its in person and I can make it...</p> \
                    </span> \
                  </div> \
                </div> \
              </div> \
            </div> \
          </div> \
        </div> \
      </div> \
    </div> \
  </div> ').appendTo('.mfp-content .nav-tabs');
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
    url: matchCandidatesUrl,
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

// check updates from ably
function ablyUpdates() {
  var ably = new Ably.Realtime(ablyKey);
  var channel = ably.channels.get(ablyChannel);
  channel.subscribe(function(message) {
    if(message["name"] == "model.updated" && (tarckModels.includes(message["data"]["type"]))){
      fetchAssessmentAndUpdateCard(message["data"]["id"], message["data"]["type"]);
    }
  });
}

// get updated data
function fetchAssessmentAndUpdateCard(id, type) {
  var payload = type == "AssessmentResult" ? { assessment_result_id: id } : { candidate_id: id };
  $.ajax({
    url: fetchCandidateUrl,
    type: 'GET',
    data: payload,
    success: function(result) {
      if (result != null) {
        updateMatchedCandidates(result);
        renderUpdates(result, ".mfp-content [data-candidate-id="+ result['angel_id'] +"] .js-profile-details .info .assess .assess-results", "update");
        renderUpdates(result, "[data-candidate_id="+ result['angel_id'] +"]", "update");
      } else {
        console.log("No data found!");
      }
    }
  });
}

// update candidates array
function updateMatchedCandidates(data) {
  var foundIndex = matchedCandidates.findIndex(candidate => candidate['angel_id'] == data['angel_id']);
  matchedCandidates[foundIndex] = data;
}

// start extention
onInit();

