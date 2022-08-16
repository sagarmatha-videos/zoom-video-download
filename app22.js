'use strict';
const excelToJson = require('convert-excel-to-json');
const linksPath = '/home/gayatri/Documents/college/zoom_doom/Fuse-Links.xlsx' 

const links = excelToJson({
    sourceFile: linksPath

})['Sheet1'];

// console.log(links)
for (const link of links){
  if (link['A'] == 'Class Name') continue; // skip title row
  download_it(link['A'], link['B'], link['C'], link['D'], link['E'], link['F'], link['G'], link['I'], link['J'])
}
// const Nightmare = require('nightmare')
// const nightmare = Nightmare({ show: true })
 
// nightmare
//   .goto('https://duckduckgo.com')
//   .type('#search_form_input_homepage', 'github nightmare')
//   .click('#search_button_homepage')
//   .wait('#r1-0 a.result__a')
//   .evaluate(() => document.querySelector('#r1-0 a.result__a').href)
//   .end()
//   .then(console.log)
//   .catch(error => {
//     console.error('Search failed:', error)
//   })

  // nightmare
  // .goto('https://zoom.us/rec/download/KUl1-kXVTdIOH8ghAHDYVMXd1ZSf6eRcMnJ3m4gAZaUTPJryavrqub0ty8hzIiDGHbaWu02BCM5b-_bZ.tN6AJP4a9wIOcZJI')
  // .wait('#onetrust-accept-btn-handler')
  // .click('#onetrust-accept-btn-handler')  // accept cookies
  // .type('#password', 'Lt_j15r_')  // enter password
  // .click('.submit') // submit
  
  // .end()
  // .then(console.log)
  // .catch(error => {
  //   console.error('Search failed:', error)
  // })