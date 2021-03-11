document.addEventListener('DOMContentLoaded', function(){
    document.querySelector('button').addEventListener('click', onclick, false)
    function onclick(){
        chrome.tabs.query({currentWindow:true, active:true},
        function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {popupMessage: "download"});
        })
    }
},false)

chrome.runtime.onMessage.addListener(function (request) {
    if (request.dprogress){
        console.log(Math.ceil(100*(request.dprogress/request.total)))
        document.querySelector('progress').value = Math.ceil(100*(request.dprogress/request.total))
    }
    else if (request.downloadInit){
        (document.getElementsByTagName("button")[0]).innerHTML = "downloading"
    }

    else if (request.downloadCompleted){
        document.querySelector('progress').value = 0
    }
})