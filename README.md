# CanvasDownloader
1. Download this code as zip
2. Go to chrome://extensions and enable developer mode
3. Click "unload the pack" and choose the unzipped folder
4. (optional) You might want to pin the extension to your top right conner
5. Go to Media Gallery
6. Right-click the video you want to download, select "Open in new tab"
7. Select the new tab, click the play button
8. Left-click the extension icon and click "download"
9. The .srt file (subtitles) will download immediately, the .mp4 file (video) may take a while. You can check the progress by left clicking the extension icon

Here's my pointers: try to find the "video master link" via the Network tab in your chrome. To access the Network tab, press `f12` in chrome while visiting your lecture video page. It will prompt your console and there you can select "Network".  You will just need to refresh your page to see what is being loaded to your browser. 

The way canvas works is that it breaks down the video.mp4 file into hundreds of smaller mp4 files. The url to each of these mp4 is "(masterlink)seg-(videonumber)".  All you need to do is to find the master link, and make http request to download every single url content, then finally combine the bytes into a mp4 file.
