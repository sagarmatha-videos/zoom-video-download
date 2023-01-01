# colab_code:
`v3:` https://colab.research.google.com/drive/1TCYgn7MPdptT_aDChtysmSuvhoiVb0nB#scrollTo=ZBwmLxMAISTd<br>
`v2:` https://colab.research.google.com/drive/17Erm5rypj9M_qiaGDY4t1m4H2N4n160d?usp=sharing

# What does it do?
- Automatically download recorded zoom videos from links.
- Downloads to google drive
- runs in google colab
- Videos Recorded at Sagarmatha Engineering College while teaching in covid-19 lock-down.
- Were downloaded for distributing as reference for students.

 ## Requirements:
  - nodeJs
  - puppeteer	:: web automation
  - puppeteer-extra-plugin-stealth	:: avoid bot detection
  - convert-excel-to-json		:: to read excel links
  - puppeteer-extra-plugin-recaptcha	:: to auto-solve capatchas got by script **(paid)**

# How to use:
- simplest way: use colab, run cells serially :: recommended_code_to_run -> colab_app_v3.ipynb
- pre-requisite: 
	- a file called 'zoom_download' at path 'MyDrive/zoom_downloads/' which is root directory
	- 'Fuse-links.xlsx' file in download_root path

## Modifications For your needs
- update download_root or create file 'zoom_downloads' in your google drive :: downloads would be saved there
- update linksPath or upload 'Fuse-links.xlsx' to 'zoom_downloads' from previous step -> excel_file path you want to extract links from
- run  the code

## Background
- `nohup node app.js`		# run in background :: outputs logs to nohup.out  || however colab will close it sth. like in half an hour
- `node app.js`			# run in foreground :: outputs logs to stdout/console

## Working:
- get download_links from excel file 'Fuse-links.xlsx'
- opens one browser instance for each sheet and run them parallely
- links_of_sheet = links that are not previously downloaded. lookup: 'progress_logs.json '
- to download: goto zoom.us -> accept cookies, then iterate through video links -> enter password and click download
- assume video is downloaded after 30 seconds and store 'download_index' and 'sheet_number' to file : 'progress_logs.json '
- wait 10 minutes before closing browser after after "last link's download button" for download to complete. (doesnt work)

## Errors
- zoom frequently gives 401 which is unauthorized error (i.e. it detected bot)	:: solutions:
	- script detect 401 error and exit
	- puppeteer-extra-plugin-stealth :: helps in hiding puppeteer from detection

- sometimes gives capatchas: paid soln: 2capatcha

## Would have been helpful:
	- premium colab : multiple notebooks running parrallely in background
	- some download manager :: but was not a big problem


# files generated:
- `screen_after_click_download.png`				# screenshot before download click
- `screen_before_click_download.png`				# screenshot after download click
- `nohup.out`                                                   # nodejs logs
- `error_logs.json`                                             # try-catch error logs
- `progress_logs.json`                                          # download progress counter

# todo
 
 - **download manager** to track download progress.
 - close browser if all pending downloads are completed :: <currently: waits 10 minutes before closing browser after clicking on download button of last download link of the sheet>
 - track actual file being downloaded :: currently: assume downloaded after 30 seconds currently
 
 - use multiple tabs instead of multiple browsers & split links to be downloaded among thems.
 - download comments and add as metadata to video.

# Previous updates
	- updated the resume function for video download and store links/error_message in file that got error while downloading so that we can download them seperately later
	- address multiple sheets
	- resume video doenload after colab restart with previous progress 
		:: stores download_index of each sheet in progress_logs.json file
	- Added  a lot of try-catch so that it hopefully continue downloading other links even if it got error in any one link

# -----------------
# References:
# -----------------

* chromedriver
https://chromedevtools.github.io/devtools-protocol/tot/Page/
updateD: https://chromedevtools.github.io/devtools-protocol/tot/Browser/#method-setDownloadBehavior

* browser automation in node:
https://www.youtube.com/watch?v=xUqK8VFhu64

* pupiteer:
https://pptr.dev/api/puppeteer

* wait for downloads to complete
https://stackoverflow.com/a/69215213
