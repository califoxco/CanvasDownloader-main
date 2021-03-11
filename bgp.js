var urls = []
var fileurls = []
var suburl = []
var listenerStatus = true
var binaryData = []
var finishedDownloading = true
var lastClip=1
var progress = 1
var fileName = ""

var MAXFILENUM = 2048


chrome.webRequest.onSendHeaders.addListener(function(wr){
    if (listenerStatus){
        if(wr.url.match('service=multirequest&apiVersion')){
            suburl.push(wr.url)
        }
        if(wr.url.match('mp4/seg')){
            urls.push(wr.url)

            
            chrome.tabs.query({currentWindow:true, active:true},
                function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, {downloadlink: wr.url})
                })
        }   
    }
},{
    urls: ["<all_urls>"],
    types:["xmlhttprequest"]
}, ["requestHeaders"])

chrome.runtime.onMessage.addListener(function (request) {
    if (request.downloadInit){
        finishedDownloading = false
        listenerStatus = false
        fileName = request.filename
        lastClip = findLastClip(1,MAXFILENUM, urls[urls.length-1])
        console.log("final answer is "+lastClip)

        // create file urls
         for(var i = 1; i<=lastClip; i++){
            fileurls.push(urls[urls.length-1].replace(/seg-\d{1,2}/,("seg-"+i)))
        }
        console.log({fileurls}) 

        finishedDownloading = false
        listenerStatus = false

        if (suburl.length!=0){

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var mysuburl = JSON.parse(this.responseText);
                downloadsub(mysuburl[0])
                console.log("ultimate link: " + mysuburl[0])
            }
            };
            xmlhttp.open("GET", suburl[0], true);
            xmlhttp.send();

        }

        for (var i = 1; i <=lastClip; i++){
            download(i)
        }


    }
})

function downloadsub(url){
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = "blob"

    xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4 && xhr.status === 200) {
            console.log("completed subtitles.")
            var blob = xhr.response
            var subblob = []
            subblob.push(blob)
            var a = document.createElement('a')
            a.href = window.URL.createObjectURL(new Blob(subblob, {type: "srt"}))
            a.download = fileName+".srt"
            a.dispatchEvent(new MouseEvent('click'))
            suburl = []
        }
        else if ((xhr.status === 404 || xhr.status === 400)){
            console.log("failed to download subtitles.")
            suburl = []
        }
    }
    console.log("starting download subtitle" + url)
    xhr.send()
}


function download(index){
    var xhr = new XMLHttpRequest()
    listenerStatus = false
    xhr.open('GET', fileurls[index], true)
    xhr.responseType = "blob"
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4 && xhr.status === 200) {

            var blob = xhr.response
            binaryData[index] = blob
            console.log("currentStatus : "+xhr.status)
            console.log("completed "+ index)
            progress++
            checkcompletion()
        }
        else if ((xhr.status === 404 || xhr.status === 400)){
            progress++
            console.log("failed to download clip: " + index)
            checkcompletion()
        }
    }
    console.log("starting download "+index)
    xhr.send()
}


function checkcompletion(){
    console.log("progress is "+progress)
    chrome.runtime.sendMessage({dprogress: progress, total:lastClip})
    if (progress == lastClip){
        var a = document.createElement('a')
        a.href = window.URL.createObjectURL(new Blob(binaryData, {type: "mp4"}))
        a.download = fileName+".mp4"
        a.dispatchEvent(new MouseEvent('click'))
        chrome.runtime.sendMessage({downloadCompleted: true})
        urls = []
        fileurls = []
        listenerStatus = true
        binaryData = []
        finishedDownloading = true
        lastClip=1
        progress=1
        fileName = ""
    }
}

function findLastClip(low, high, myurl){
    var temp
    var mid = Math.floor((low+high)/2)
    if (high <= low) {
        finishedDownloading = true
        return low
    }
    
    console.log("low is : " + low)
    console.log("mid is : " + mid)
    console.log("high is : " + high)
    console.log("\n")

    var xhr = new XMLHttpRequest()
    listenerStatus = false
    xhr.open('GET', myurl.replace(/seg-\d{1,2}/,("seg-"+mid)), false)
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4 && xhr.status === 200) {
            temp = findLastClip(mid+1, high, myurl)
        }
        else if ((xhr.status === 404 || xhr.status === 400)&& !finishedDownloading){
            temp = findLastClip(low, mid-1, myurl)
        }
    }
    xhr.send()
    return temp
}
