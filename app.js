'use strict';
const excelToJson = require('convert-excel-to-json');
const puppeteer = require('puppeteer');
var fs = require('fs'); // to create folder if not exist // reference: https://colab.research.google.com/drive/168X6Zo0Yk2fzEJ7WDfY9Q_0UOEmHSrZc?usp=sharing
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));





// create 'progress_logs.json' if file doesnot exist
if (!fs.existsSync('progress_logs.json')){
  console.log('\ncreating file: progress_logs.json...\n');
  fs.writeFileSync('progress_logs.json', JSON.stringify(
    {
      "1":0,
      "comment":"1 stores sheet 1 progress and 2 stores sheet 2 progress and so on .."
    }
  ));
 }

// Create 'error_links_logs' if file doesnot exist
if (!fs.existsSync('error_logs.json')){
  console.log('\ncreating file: error_logs.json...\n');
  fs.writeFileSync('error_logs.json', JSON.stringify(
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
let async_wait_and_update_current_download_progress =  async (how_long_after_to_assume_downloaded, current_link_index, current_sheet) => {
  setTimeout(function(){
      let previous_progress = load_json_data('progress_logs.json');   // load currenet progress
      previous_progress[current_sheet] = current_link_index + 1;      // update currenet progress
      save_json_data(previous_progress, 'progress_logs.json');    // store currenet progress
      
      // let current_date_ms = Date.parse(new Date());
      console.log(`updated download index to: ${current_link_index} for sheet: ${current_sheet}`);

  }, how_long_after_to_assume_downloaded);//wait 2 seconds
}






let append_error_logs = (new_log, where) => {
  // where = 'link_logs' or 'other_logs'

  let previous_logs = load_json_data('error_logs.json');  // load previous logs
  // console.log('previous_logs' + previous_logs);
  // console.log('prev' + previous_logs);
  previous_logs[where].push(new_log);                   // update logs
  // console.log(previous_logs[where]);
  
  save_json_data(previous_logs, 'error_logs.json');    // store error logs
  previous_logs = JSON.stringify(previous_logs);
  console.log('\nappended error log ...\n');
}

// append_error_logs({prev:'link', current:'sth.'}, 'other_logs');  # test
// append_error_logs({prev:'test', current:'test33'}, 'other_logs');  # test 
// const err_logs = load_json_data('error_logs.json');console.log(aa);  # test


const udpate_latest_downloaded_link = async (link_index, download_time) => {
  // wait for download_time seconds

  // load resume_logs.json
  
  // update download_index 
  if (downloaded_index < link_index){
    downloaded_index = link_index;
    // save resume_logs.json
  }  
};


const download_links = async (links, download_root, current_sheet) => {

    // initialize browser
    // source: await puppeteer.launch({executablePath:"/usr/bin/chromium-browser", args:['--no-sandbox','--start-maximized']});
    const browser = await puppeteer.launch({headless:false, ignoreHTTPSErrors: true}); // colab: const browser = await puppeteer.launch({executablePath:"/usr/bin/chromium-browser", args:['--no-sandbox','--start-maximized'], ignoreHTTPSErrors: true, headless: true});
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36');
    
    // accept cookies
    console.log('opening \'https://zoom.us/\' and accepting cookies ...');
    await page.goto('https://zoom.us/', {timeout: 30000});//, {waitUntil: 'networkidle0'});
    await page.waitForSelector('#onetrust-accept-btn-handler');
    await page.click('#onetrust-accept-btn-handler');
    console.log('accepted cookies ...')

    await delay(2000);  // wait 2 seconds

    // file_name
    // f'[count_index] + [{class_name[:170]}] + [{course_name}] + [{Grade}] + [{Duration}] + [{StartDateTime}] + [{EndDateTime}] + [{InstructorName}]




    var dmPage = await browser.newPage()  // download manager page
    await dmPage.goto('chrome://downloads/')


    

      for (let [current_link_index, link] of links.entries() ){
        try {
          
          
          let className = link['A'];
          if (className == 'Class Name') continue; // skip title row
          
          let courseName = link['B'];
          let grade = link['C'];
          let duration = link['D'];
          let startDateTime = link['E'];
          let endDateTime = link['F'];
          let instructorName = link['G'];
          let password = link['I'];
          let url = link['J'];

          if (url.slice(0,4) !='http') {
            append_error_logs({courseName: courseName, grade: grade, duration: duration, startDateTime: startDateTime, endDateTime: endDateTime, instructorName: instructorName, password: password, url: url, error_value: 'url not link'},'other_logs');
            continue; // skip non download url
        }

          // folders path for each download link
          const rootDir = download_root;  // colab:  './drive/MyDrive/zoom_doom/'
          const subjectFolderName =  `${courseName}[${grade}][${instructorName}]`;
          const downloadPath = rootDir + subjectFolderName;
          
          // create folder if not exists
          if (!fs.existsSync(downloadPath)){
            fs.mkdirSync(downloadPath);
            console.log(`creating folder: ${downloadPath}`);
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
            await page.goto(url, {timeout: 30000});
            await page.screenshot({path: 'screen_before_click_download.png'});
          
            await page.waitForSelector('#password');
            await page.type('#password', password);
            await page.click('.submit');
            console.log(`downloading... sheet:${current_sheet} link_index:${current_link_index}` + String(url));
          
          console.log(`current_link_index: ${current_link_index}`);
          await async_wait_and_update_current_download_progress(3000, current_link_index, current_sheet); // assume downloaded after 3 minutes
          await delay(5000);  // wait 5 seconds
          await page.screenshot({path: 'screen_after_click_download.png'});
          
          // display any error by zoom <zoom sometimes give '401 unauthorized' error >
          let error_element = await page.$('#error_msg')
          let error_value = await page.evaluate(el => el.textContent, error_element)
          if (!(String(error_value) == '')){
            // storing error log
            append_error_logs({courseName: courseName, grade: grade, duration: duration, startDateTime: startDateTime, endDateTime: endDateTime, instructorName: instructorName, password: password, url: url, error_value: error_value}, 'link_logs');
            
            // displaying error message in console 
            console.log('Error\n' + error_value);
            console.log('On Link: ' + link);
            continue;
          }

        
      } catch (error) {
        // storing error log
        append_error_logs({link:link, error_value: JSON.stringify(error)},'link_logs');
        
        // displaying error message in console 
        console.log('\n' + 'Error' + error + '\n');
        console.log('On Link: ' + link);
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

    await delay(6000); // waiting 10 minutes before closing browser after clicking download to all links of specific sheet
    console.log(`\n Closing sheet: ${current_sheet} browser after waiting for 10 minutes after \"last link download click\" for download to complete. \n`);
    await browser.close();
}


// const auth_values = [{'url':'https://zoom.us/rec/download/KUl1-kXVTdIOH8ghAHDYVMXd1ZSf6eRcMnJ3m4gAZaUTPJryavrqub0ty8hzIiDGHbaWu02BCM5b-_bZ.tN6AJP4a9wIOcZJI', 'password':'Lt_j15r_'}];
// download_it(auth_values)

const linksPath = '/home/gayatri/Documents/college/zoom_doom/Fuse-Links.xlsx';  // colab: './drive/MyDrive/zoom_doom/Fuse-Links.xlsx'

var all_sheets_links = excelToJson({  sourceFile: linksPath  });
try {
  // concatinate all the sheets
  // var all_links = []
  for (let current_sheet = 1; current_sheet > -1; current_sheet++){ // infinite loop for current sheets
    let sheet_links = all_sheets_links['Sheet' + current_sheet]
    if (sheet_links == undefined) break; // break if sheet is empty
    // console.log(sheet_links.slice(0,3));
    // all_links = all_links.concat(links['Sheet' + current_sheet]);

    // console.log('extracted links ... ' + String(sheet_links.slice(0,2)));
    let download_progress = load_json_data('progress_logs.json');
    
    // check if progress for sheet exists
    // and continue download from saved progress link_index
    if (download_progress[current_sheet] != 0 && download_progress[current_sheet] != undefined ){
      try {
        // console.log(sheet_links);
        sheet_links = sheet_links.slice(download_progress[current_sheet], sheet_links.length) // continue download from previously downloaded index
        if (sheet_links == []) {
          console.log(`\n\n All links from ${current_sheet} are downloaded!! \n\n`);
          continue;
        }
      } catch (error) {
        console.log(`Error slicing links for sheet: ${current_sheet} :: error:`  + error );
      }
      
    }
    
    const download_root = '/home/gayatri/Documents/college/zoom_doom/downloads/';
    // sheet_links= sheet_links.slice(0,2);
    console.log(`Sheet ${current_sheet} : (${sheet_links.length}) links loaded`);
    download_links(sheet_links.slice(0,2), download_root, current_sheet);
  }
} catch (error) {
  // store error reading the link: link_path, error_message
  append_error_logs({linksPath:linksPath, error_msg: 'error reading links file', error_value: String(error)}, 'other_logs');
}