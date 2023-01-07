# actual code to download
# stores code to file: 'app_v3.js'
%%writefile ./drive/MyDrive/zoom_downloads/app_v3_1.js
'use strict';

// for colab code
const linksPath = './drive/MyDrive/zoom_downloads/Fuse-Links.xlsx';
const download_root = './drive/MyDrive/zoom_downloads/';  // create a folder called  'zoom_downloads' in MyDrive where downloads are to be stored

// for running code locally
// var download_root = '/home/gayatri/Documents/college/zoom_downloads/downloads/';
// var linksPath = '/home/gayatri/Documents/college/zoom_downloads/Fuse-Links.xlsx';  // colab: './drive/MyDrive/zoom_downloads/Fuse-Links.xlsx'


const excelToJson = require('convert-excel-to-json');
// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra')
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

var fs = require('fs'); // to create folder if not exist // reference: https://colab.research.google.com/drive/168X6Zo0Yk2fzEJ7WDfY9Q_0UOEmHSrZc?usp=sharing
const { ConsoleMessage } = require('puppeteer')
var progress_stored_previoiusly = 0;
// var borrowed = new Array();     // borrow link to download so that no link is downloaded twice
// var to_download = new Array();  // links to download

// add recaptcha plugin and provide it your 2captcha token (= their apiKey)
// 2captcha is the builtin solution provider but others would work as well.
// Please note: You need to add funds to your 2captcha account for this to work
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: '' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
    },
    visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)


const delay = ms => new Promise(resolve => {
    console.log("sleeping for " + ms/1000 + " s");
    setTimeout(resolve, ms);
});

// syncronous delay
function delay_sync(ms) {
  console.log("syncronous delay  " + ms/1000 + " s");
  return new Promise(resolve => setTimeout(resolve, ms));
}

// const randomInteger = require('random-int');
const randomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



// create 'progress_logs_v3.json' if file doesnot exist
if (!fs.existsSync(download_root + 'progress_logs_v3.json')){
  console.log('\ncreating file: progress_logs_v3.json...\n');
  fs.writeFileSync(download_root + 'progress_logs_v3.json', JSON.stringify(
    {
      "comment":"progress for sheets are generated and updated based on sheet_name automatically .."
    }
  ));
 }

// Create 'error_links_logs' if file doesnot exist
if (!fs.existsSync(download_root + 'error_logs.json')){
  console.log('\ncreating file: error_logs.json...\n');
  fs.writeFileSync(download_root + 'error_logs.json', JSON.stringify(
      {
          link_logs:[],
          other_logs:[],
      }
      ));
}

let load_json_data = (file_path) => {
  // loading error links
  // var saved_data;
  try {
      var saved_data = fs.readFileSync(file_path, 'utf-8');
      saved_data = JSON.parse(saved_data);
      // console.log('Loaded Links...: \n ' + saved_data);
      return saved_data;
  } catch (error) {
      console.log('Error Loading json file ...: \n ' + file_path + error); 
  }
}


let save_json_data = function (data, file_path){
  let to_save_data  = JSON.stringify(data);
try {
    fs.writeFileSync(file_path, to_save_data);
} catch (error) {
    console.log('Error saving data to file error_data...' + file_path + error);
}
}


// update current progress of sheet after asynchronously waiting for download_time seconds. 
let async_wait_and_update_current_download_progress =  async (how_long_after_to_assume_downloaded, borrowed, to_download) => {
  setTimeout(function(){
    console.log('to_download:', to_download)
    console.log('borrowed: ', borrowed)
    save_json_data({'borrowed':[...borrowed], 'to_download':[...to_download]}, download_root + 'progress_logs_v3.json');
    console.log('saved...')
      // let current_date_ms = Date.parse(new Date());
      // console.log(`updated download index to: ${current_link_index} for sheet: ${current_sheet}`);

  }, how_long_after_to_assume_downloaded);//wait 2 seconds
}






let append_error_logs = (new_log, where) => {
  // where = 'link_logs' or 'other_logs'

  let previous_logs = load_json_data(download_root + 'error_logs.json');  // load previous logs
  // console.log('previous_logs' + previous_logs);
  // console.log('prev' + previous_logs);
  previous_logs[where].push(new_log);                   // update logs
  // console.log(previous_logs[where]);
  
  let initial_date = Date.now()
  
  while (Date.now() <= initial_date + 10000){}
  save_json_data(previous_logs, download_root + 'error_logs.json');    // store error logs
  previous_logs = JSON.stringify(previous_logs);
  console.log('\nappended error log ...\n');
  console.log('\n waiting 15 minutes sync for remaining downloads to finis \n')
  // update links.indexOf
  delay_sync(900000); // waiting 15 minutes for remaining downloads to finish
}


// js progress generator function
function progress_bar(current_progress, total, label){
  let progress = Math.round((current_progress/total)*100);
  console.log(`${label}_progress  : ${progress}% :: `, current_progress, '/', total);
  console.log(total);
  let bar = [];
  for (let i = 0; i < 100; i++){
    if (i < progress){
      bar.push('█');
    } else {
      bar.push('░');
    }
  }
  // return bar.join(''); // array to string
  console.log(bar.join(''));
}
// for (let i=0;i<10000;i++ ){progress_bar(i,10000, 'count')} # test progress_bar



const download_links = async (links) => {
    // initialize browser
    // refrence: https://colab.research.google.com/drive/168X6Zo0Yk2fzEJ7WDfY9Q_0UOEmHSrZc?usp=sharing
    // google cloud console
    // const browser = await puppeteer.launch({executablePath:"/opt/google/chrome/google-chrome", args:['--no-sandbox','--start-maximized'], ignoreHTTPSErrors: true, headless: true});
    // colab specific
    const browser = await puppeteer.launch({executablePath:"/usr/bin/chromium-browser", args:['--no-sandbox','--start-maximized'], ignoreHTTPSErrors: true, headless: true});
    // const browser = await puppeteer.launch({headless:false, ignoreHTTPSErrors: true}); // colab: const browser = await puppeteer.launch({executablePath:"/usr/bin/chromium-browser", args:['--no-sandbox','--start-maximized'], ignoreHTTPSErrors: true, headless: true});  // colab code:  
  
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36');
    
    // accept cookies
    // console.log('opening https://zoom.us/ and accepting cookies ...');
    // await page.goto('https://zoom.us/', {timeout: 60000});//, {waitUntil: 'networkidle0'});
    // await page.screenshot({path: screenShotPath + 'before-accept-cookies' +'.png'});
    // await page.waitForSelector('#onetrust-accept-btn-handler');
    // document.querySelector('#onetrust-accept-btn-handler').click()
    // await page.screenshot({path: screenShotPath + 'after-accept-cookies' +'.png'});
    // console.log('accepted cookies ...')

    // await delay(2000);  // wait 2 seconds

    // file_name
    // f'[count_index] + [{class_name[:170]}] + [{course_name}] + [{Grade}] + [{Duration}] + [{StartDateTime}] + [{EndDateTime}] + [{InstructorName}]

      const screenShotPath = download_root + "screenshots/";
      // for (let [current_link_index, link] of links.entries() ){
      //for(let current_link_index of to_download){
      for (let link of links){
        console.log('link', link);
        // let link = links[parseInt(current_link_index)]
        try {
            let url = link['url']
            let path = link['path']
            let password = link['password']
            let current_link_index = links.indexOf(link)
            progress_bar(current_link_index, links.length, 'download');  // displays progress of download

          if (url.slice(0,4) !='http') {
            append_error_logs({courseName: courseName, grade: grade, duration: duration, startDateTime: startDateTime, endDateTime: endDateTime, instructorName: instructorName, password: password, url: url, error_value: 'url not link'},'other_logs');
            continue; // skip non download url
        }
        const downloadPath = download_root + path;
        console.log('point1');
        // create folder if not exists
        if (!fs.existsSync(downloadPath)){
            fs.mkdirSync(downloadPath);
            console.log(`creating folder: ${downloadPath}`);
            
            if (!fs.existsSync(screenShotPath)){    // create screenshot path if don't exist
                fs.mkdirSync(screenShotPath);
            }
        }
        console.log('point2');
        // set download location 
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: downloadPath,
            eventsEnabled: true,
        })  
        console.log(`set download path: ${downloadPath}`)
        console.log('point3');
          
        await page.goto(url, {timeout: 30000, waitUntil: 'networkidle2'});
        await page.screenshot({path: download_root + 'screen_before_click_download.png'});
        console.log('point4');
        // await page.waitForSelector('#passcode');
        try{
              await page.type('#password', password);
              await delay(randomInteger(1000, 5000)); // random delay betn 1 and 5 seconds
              
              console.log('point5');
              // submit password
              await page.click('.submit');
            } catch(err) {
              await page.type('#passcode', password);
              await delay(randomInteger(1000, 5000)); // random delay betn 1 and 5 seconds
              
              // solving capatcha
              // That's it, a single line of code to solve reCAPTCHAs 🎉
              // try{
              //   await page.solveRecaptchas()
              //   await Promise.all([
              //     page.waitForNavigation(),
              //     page.click(`#recaptcha-demo-submit`)
              //   ])
              // } catch(err){console.log(err)}
              
              // submit password
              await page.click('#passcode_btn');
              console.log(`downloading... link_index:${current_link_index}` + String(url));
              await delay(randomInteger(35000, 80000)); // random delay betn 35 and 80 seconds after each download click  
            }

            
          
          // screenshot before each delay :: 10 screenshots
          await page.screenshot({path: screenShotPath + current_link_index +'.png'});
          
          // display any error by zoom <zoom sometimes give '401 unauthorized' error >
          // zoom displaying error in two ways sometimes first way, second_way other times
          let error_element = await page.$('.zm-alert__content');
          let second_error_element = await page.$('#error_msg');
          if (error_element == null && second_error_element != null)error_element = second_error_element
          
          if (error_element != null){ 
            let error_value = await page.evaluate(el => el.textContent, error_element)
            if (!(String(error_value) == '')){
              // storing error log
              append_error_logs({courseName: courseName, grade: grade, duration: duration, startDateTime: startDateTime, endDateTime: endDateTime, instructorName: instructorName, password: password, url: url, error_value: error_value}, 'link_logs');
            
              // displaying error message in console 
              console.log('Error\n' + error_value);
              console.log('On Link: ' + link);
              // delay_sync(180000); // 3 minutes delay
              break
              // process.exit("Exit: this is the error of zoom (maybe wait few minutes and re-run the script)");
              //continue;
            }
          }

        
      } catch (error) {
        // storing error log
        append_error_logs({link:link, error_value: JSON.stringify(error)},'link_logs');

        // displaying error message in console 
        console.log('\n' + 'Error' + error + '\n');
        console.log('On Link: ' + link);
        
        console.log('Waiting 5 minutes to let pending downloads to finish');
        delay_sync(300000); // 5 minutes delay
        break
      }  
      }

      console.log('\n\n --------------- ************************* --------------- ');
      console.log(' --- completed clicking download btn -> download in progress --- \n ------------ waiting 10 minutes ------------ ');
      console.log(' --------------- ************************* --------------- \n\n ');
      delay_sync(180000);
      process.exit("Exit: this is the error of zoom (maybe wait few minutes and re-run the script)");
    // waiting 15 minutes before closing browser after clicking download to all links of specific sheet
    console.log(`\n Closing sheet: ${current_sheet} browser after waiting for 10 minutes after \"last link download click\" for download to complete. \n`);
    await browser.close();
}

let urls_path = download_root + "to_download_data_v3.json";
var links_to_download = load_json_data(urls_path);
links_to_download = links_to_download['data'];

try{
    download_links(links_to_download);
} catch (error) {
  // store error reading the link: link_path, error_message
  append_error_logs({linksPath:urls_path, error_msg: 'error reading links file', error_value: String(error)}, 'other_logs');
}



/*
- auto-find & download links not to download by folder_name & file_name
- 'to_download_data_v3.json' stores url, path:<folder_name>, password
- 'progress_logs_v3.json' stores index of links not downloaded :: not used anymore
- removed solveRecaptchas
- remove the concept of borrow
- zoom password submit showing two varients
- zoom password input id: #passcode           previous: #password
- zoom password submit  : #passcode_btn       previous: #submit
- error message:          .zm-alert__content  previous: #error_msg
*/