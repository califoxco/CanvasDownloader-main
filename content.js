var newLink;
console.log("CanvasDownloader extension injected")
chrome.runtime.onMessage.addListener(function (request) {
    if (request.downloadlink != null){
        newLink = request.downloadlink;
    }
    else if (request.popupMessage != null){
        if (newLink !=null){
            var name = (document.getElementsByTagName("title")[0]).innerHTML;
            chrome.runtime.sendMessage({downloadInit: true, filename: name})
        }
        else {
            alert("nothing to download")
        }
    }
})
