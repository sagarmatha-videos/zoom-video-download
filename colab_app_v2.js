# stores code to file: 'app_v2_1.js'
%%writefile ./drive/MyDrive/zoom_downloads/app_v2_1.js
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
// puppeteer.use(
//   RecaptchaPlugin({
//     provider: {
//       id: '2captcha',
//       token: '76975554edb7dcdaeeb61b8e32240569' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
//     },
//     visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
//   })
// )














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



// create 'progress_logs_v2.json' if file doesnot exist
if (!fs.existsSync(download_root + 'progress_logs_v2.json')){
  console.log('\ncreating file: progress_logs_v2.json...\n');
  fs.writeFileSync(download_root + 'progress_logs_v2.json', JSON.stringify(
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

// load data test
// data = {'borrowed':[0,1], 'to_download':[0,1,2,3,4,5,6,7,8,9]}
var data = load_json_data(download_root + 'progress_logs_v2.json');
var borrowed = [...data.borrowed]       // links download in progress
console.log('\nborrowed: ',borrowed)
var to_download = [...data.to_download]    // ALL LINKS INITIALLY
console.log('\no_download', to_download)

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
    save_json_data({'borrowed':[...borrowed], 'to_download':[...to_download]}, download_root + 'progress_logs_v2.json');
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



const download_links = async (links, download_root, current_sheet, progress_stored_previoiusly) => {
  // initialize data progress logs v2
    // to_download = [...Array(links.length).keys()]
    // console.log('\n\nto download', to_download)
    // borrowed = []
    // save_json_data({'borrowed':[...borrowed], 'to_download':[...to_download]}, download_root + 'progress_logs_v2.json');
    // return

    
  
  
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




    // var dmPage = await browser.newPage()  // download manager page
    // await dmPage.goto('chrome://downloads/')


    
      const screenShotPath = download_root + "screenshots/";
      // for (let [current_link_index, link] of links.entries() ){
      for(let current_link_index of to_download){
        let link = links[parseInt(current_link_index)]
        // data = load_json_data(download_root + 'progress_logs_v2.json');
        // borrowed = [...data.borrowed]       // links download in progress
        // console.log('\nborrowed: ',borrowed)
        // to_download = [...data.to_download]    // ALL LINKS INITIALLY
        // console.log('\no_download', to_download)

        // if (current_link_index % 2 ==0 && current_link_index != 0) await delay(180000) // 5 MINUTES BREAK AFTER EVERY 5 DOWNLOADS
        if(to_download.indexOf(current_link_index) == -1){
          console.log(`\n link: ${current_link_index} not in downloada skipping...\n`)
          continue
        } else if (borrowed.indexOf(current_link_index) != -1){ // skip if already downloaded) {
          // console.log(`\n link: ${current_link_index} in borrowed skipping...\n`);
          continue;
          // skip if link is already in progress
        } 
        
        
        console.log(`\n link: ${current_link_index} not in borrowed downloading...\n`)
        borrowed.push(current_link_index); // add link to borrowed list
        save_json_data({'borrowed':[...borrowed], 'to_download':[...to_download]}, download_root + 'progress_logs_v2.json');
        
        
        progress_bar(current_link_index, links.length, 'download');  // displays progress of download
        try {
          
          
          let className = link['A'];
          if (className == 'Class Name') continue; // skip title row
          
          let courseName = String(link['B']).replace("/", "|");
          let grade = String(link['C']).replace("/", "|");
          let duration = link['D'];
          let startDateTime = link['E'];
          let endDateTime = link['F'];
          let instructorName = String(link['G']).replace("/", "|");
          let password = link['I'];
          let url = link['J'];

          if (url.slice(0,4) !='http') {
            append_error_logs({courseName: courseName, grade: grade, duration: duration, startDateTime: startDateTime, endDateTime: endDateTime, instructorName: instructorName, password: password, url: url, error_value: 'url not link'},'other_logs');
            continue; // skip non download url
        }

          // folders path for each download link
          const rootDir = download_root;  // colab:  './drive/MyDrive/zoom_downloads/'
          const subjectFolderName =  `${courseName}[${grade}][${instructorName}]`;
          const downloadPath = rootDir + subjectFolderName;
          console.log('\ndownload_path: ', downloadPath, 'screenshot:' , screenShotPath, '\n\n')
          console.log('url', url, 'password: \"' + password + '\"')

          // create folder if not exists
          if (!fs.existsSync(downloadPath)){
            fs.mkdirSync(downloadPath);
            console.log(`creating folder: ${downloadPath}`);
            
            if (!fs.existsSync(screenShotPath)){    // create screenshot path if don't exist
                fs.mkdirSync(screenShotPath);
            }
          }

          // set download location 
          const client = await page.target().createCDPSession();
          console.log(downloadPath);
          await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: downloadPath,
            eventsEnabled: true,
          })
          
          /*// test if download works
          try{await page.goto('https://media.istockphoto.com/photos/emoji-holding-loudspeaker-isolated-on-white-background-picture-id961333268?p=1');
            await delay(60000);// 60 sec delay
        } catch(err){console.log(err);}*/
            await page.goto(url, {timeout: 30000, waitUntil: 'networkidle2'});
            await page.screenshot({path: download_root + 'screen_before_click_download.png'});

            // await page.waitForSelector('#passcode');
            try{
              await page.type('#password', password);
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
            }

            console.log(`downloading... sheet:${current_sheet} link_index:${current_link_index}` + String(url));
            
            // console.log(`current_link_index: ${current_link_index}`);
            // await async_wait_and_update_current_download_progress(180000, parseInt(current_link_index) + parseInt(progress_stored_previoiusly), current_sheet); // assume downloaded after 3 minutes
            
            await async_wait_and_update_current_download_progress(35000, borrowed , to_download)
            await delay(randomInteger(25000, 75000)); // random delay betn 35 and 80 seconds after each download click
          
            borrowed.splice(borrowed.indexOf(current_link_index), 1)  // remove link from borrowed
            // console.log(borrowed)
            to_download.splice(to_download.indexOf(current_link_index), 1)    // remove link from to_download
            // console.log(to_download)
            // save_json_data({'borrowed':[...borrowed], 'to_download':[...to_download]}, download_root + 'progress_logs_v2.json');
            
          
          // screenshot before each delay :: 10 screenshots
          await page.screenshot({path: screenShotPath + current_link_index +'.png'});
          
          
          await page.screenshot({path: download_root + 'screen_after_click_download.png'});
          
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



      // // wait till pending downloads are finished.
      // // source: https://stackoverflow.com/a/69215213
      // console.log('waiting for downoads to finish ...');
      // await dmPage.bringToFront(); // this is necessary
      // await dmPage.waitForFunction(
      //     () => {
      //         // monitoring the state of the first download item
      //         // if finish than return true; if fail click
      //         const total_downloads_count = document.querySelector('downloads-manager').shadowRoot.querySelector('#mainContainer').childElementCount;
      //         all_downloaded = 1
      //         for (let id_count =0;id_count < total_downloads_count; id_count ++){
      //           if (document.querySelector('downloads-manager')[shadowRoot].querySelector(`#frb${id_count}`)[shadowRoot].querySelector('#content').classList.length > 1)
      //           {
      //             all_downloaded = 0
      //             break;
      //           }
      //         }
      //         if (all_downloaded == 1) return true;
      //         console.log('all items not downloaded...');
      //     },
      //     { polling: 'raf', timeout: 0 }, // polling? yes. there is a 'polling: "mutation"' which kind of async
      // );
      // console.log('download finished, closing browser ...');
      console.log('\n\n --------------- ************************* --------------- ');
      console.log(' --- completed clicking download btn -> download in progress --- \n ------------ waiting 10 minutes ------------ ');
      console.log(' --------------- ************************* --------------- \n\n ');
      delay_sync(180000);
      process.exit("Exit: this is the error of zoom (maybe wait few minutes and re-run the script)");
    // await delay(randomInteger(720000, 1200000)); // random delay betn 12 and 20 minutes
    // waiting 15 minutes before closing browser after clicking download to all links of specific sheet
    console.log(`\n Closing sheet: ${current_sheet} browser after waiting for 10 minutes after \"last link download click\" for download to complete. \n`);
    await browser.close();
}


// const auth_values = [{'url':'https://zoom.us/rec/download/KUl1-kXVTdIOH8ghAHDYVMXd1ZSf6eRcMnJ3m4gAZaUTPJryavrqub0ty8hzIiDGHbaWu02BCM5b-_bZ.tN6AJP4a9wIOcZJI', 'password':'Lt_j15r_'}];
// download_it(auth_values)

var all_sheets_links = excelToJson({  sourceFile: linksPath  });
try {
  // concatinate all the sheets
  // var all_links = []
    for (let current_sheet in all_sheets_links){ // loop through all sheets
        console.log(current_sheet);
        let sheet_links = all_sheets_links[current_sheet]
        if (sheet_links == undefined) {console.log('Empty no data in the sheet'); break;} // break if sheet is empty
        // console.log(sheet_links.slice(0,3));
        // all_links = all_links.concat(links[current_sheet]);

        // console.log('extracted links ... ' + String(sheet_links.slice(0,2)));
        let download_progress = load_json_data(download_root + 'progress_logs.json');
        
        // check if progress for sheet exists
        // and continue download from saved progress link_index
        if (download_progress[current_sheet] != 0 && download_progress[current_sheet] != undefined ){
          try {
            // console.log(sheet_links);
            console.log(`Sheet ${current_sheet} : (${sheet_links.length}) links loaded`);
            // let len_all_links = sheet_links.length
            progress_stored_previoiusly = parseInt(download_progress[current_sheet])
            sheet_links = [... sheet_links.slice(progress_stored_previoiusly, sheet_links.length)] // continue download from previously downloaded index
            if (sheet_links == []) {
              console.log(`\n\n All links from ${current_sheet} are downloaded!! \n\n`);
              continue;
            }
          } catch (error) {
            console.log(`Error slicing links for sheet: ${current_sheet} :: error:`  + error );
          }
        }
        
        // sheet_links= sheet_links.slice(0,2);
        console.log('\n\n continuing from previous progress at index: ', progress_stored_previoiusly,'\n\n')
        console.log(`Sheet ${current_sheet} : (${sheet_links.length}) links to be downloaded `);
        download_links(sheet_links, download_root, current_sheet, progress_stored_previoiusly);
  }
} catch (error) {
  // store error reading the link: link_path, error_message
  append_error_logs({linksPath:linksPath, error_msg: 'error reading links file', error_value: String(error)}, 'other_logs');
}