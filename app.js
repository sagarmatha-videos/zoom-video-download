'use strict';
const excelToJson = require('convert-excel-to-json');
const puppeteer = require('puppeteer');
var fs = require('fs'); // to create folder if not exist // reference: https://colab.research.google.com/drive/168X6Zo0Yk2fzEJ7WDfY9Q_0UOEmHSrZc?usp=sharing
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


const download_them = async (links, download_root) => {

    // initialize browser
    // source: await puppeteer.launch({executablePath:"/usr/bin/chromium-browser", args:['--no-sandbox','--start-maximized']});
    const browser = await puppeteer.launch({headless:true, ignoreHTTPSErrors: true}); // colab: const browser = await puppeteer.launch({executablePath:"/usr/bin/chromium-browser", args:['--no-sandbox','--start-maximized'], ignoreHTTPSErrors: true, headless: true});
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36');
    
    await delay(2000);  // wait 2 seconds

      // file_name
      // f'[count_index] + [{class_name[:170]}] + [{course_name}] + [{Grade}] + [{Duration}] + [{StartDateTime}] + [{EndDateTime}] + [{InstructorName}]

      
      for (const link of links){
        
        const className = link['A'];
        if (className == 'Class Name') continue; // skip title row
        
        const courseName = link['B'];
        const grade = link['C'];
        const duration = link['D'];
        const startDateTime = link['E'];
        const endDateTime = link['F'];
        const instructorName = link['G'];
        const password = link['I'];
        const url = link['J'];

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
        await page.goto(url);
        await page.screenshot({path: 'example.png'});
      
        // await page.click('#onetrust-accept-btn-handler');
        await page.type('#password', password);
        await page.click('.submit');
        console.log('downloading...');
        
       await delay(10000);  // wait 10 seconds
       await page.screenshot({path: 'screen.png'});
        
    
    }
    await delay(6000000000); // waiting 6000000 seconds= 166.6 hours before closing browser
    await browser.close();
}


// const auth_values = [{'url':'https://zoom.us/rec/download/KUl1-kXVTdIOH8ghAHDYVMXd1ZSf6eRcMnJ3m4gAZaUTPJryavrqub0ty8hzIiDGHbaWu02BCM5b-_bZ.tN6AJP4a9wIOcZJI', 'password':'Lt_j15r_'}];
// download_it(auth_values)

const linksPath = '/home/gayatri/Documents/college/zoom_doom/Fuse-Links.xlsx';  // colab: './drive/MyDrive/zoom_doom/Fuse-Links.xlsx'

const links = excelToJson({
    sourceFile: linksPath

})['Sheet1'];


const download_root = '/home/gayatri/Documents/college/zoom_doom/downloads/';
download_them(links, download_root);