// to test is links path is correct
// should display links as output

'use strict';
const excelToJson = require('convert-excel-to-json');

const linksPath = '/home/gayatri/Documents/college/zoom_doom/Fuse-Links.xlsx';  // colab: './drive/MyDrive/zoom_doom/Fuse-Links.xlsx'

const links = excelToJson({
    sourceFile: linksPath

})['Sheet1'];

console.log(links);