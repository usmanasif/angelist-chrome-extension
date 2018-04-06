$(document).ready(function(){
  console.log("alarm started");
  chrome.alarms.create("myAlarm", {delayInMinutes: 1, periodInMinutes: 1} );

  chrome.alarms.onAlarm.addListener(function(alarm) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
        console.log(response);
        if (response){
          if(response.farewell == "goodbye"){
            console.log("alarm closed");
            chrome.alarms.clear("myAlarm");
          }
        }
    });
});
  });
});
