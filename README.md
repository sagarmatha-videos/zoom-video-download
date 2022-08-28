
# zoom video downloader (nodejs)
 ## download: uses 'puppetter'
 ## reading excel file: uses ''

`npm install`  ### to install packages
`node app.js`  ### to run code <download videos>

# How to use:
- update download_root -> to file you want downloads to be saved
- update linksPath -> excel_file path you want to extract links from
- puppeteer.launch({headless:false})	# to open headless mode <doesnot display browser>

- nohup node app.js		# run in background :: outputs logs to nohup.out
- node app.js			# run in foreground :: outputs logs to stdout/console

# working:
- iterates through excel sheets and download links
- opens one browser instance for each sheet and run them parallely
- links_of_sheet = links that are not previously downloaded. lookup: 'progress_logs.json '
- to download: goto zoom.us -> accept cookies, then iterate through video links -> enter password and click download
- assume video is downloaded after 3 minutes and store 'download_index' and 'sheet_number' to file : 'progress_logs.json '
- wait 10 minutes before closing browser after after "last link's download button" for download to complete.

# files generated:
- screen_after_click_download.png
- screen_before_click_download.png
- nohup.out							# nodejs logs
- error_logs.json					# try-catch error logs
- progress_logs.json				# download progress counter

# todo
 - close browser if all pending downloads are completed :: <currently: waits 10 minutes before closing browser after clicking on download button of last download link of the sheet>
 - track actual file being downloaded :: currently: assume downloaded after 3 minutes currently :: 
 - download file name and metadata
 

# References:

# colab_code:
https://colab.research.google.com/drive/17Erm5rypj9M_qiaGDY4t1m4H2N4n160d

# chromedriver
https://chromedevtools.github.io/devtools-protocol/tot/Page/
updateD: https://chromedevtools.github.io/devtools-protocol/tot/Browser/#method-setDownloadBehavior

# browser automation in node:
https://www.youtube.com/watch?v=xUqK8VFhu64

# pupiteer:
https://pptr.dev/api/puppeteer

# wait for downloads to complete
https://stackoverflow.com/a/69215213
