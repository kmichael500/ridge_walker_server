import 'pdf-image';
import {PDFImage} from 'pdf-image';
import * as fs from 'fs'
import * as glob from 'glob';

  test().then(()=>{
    console.log("done")
  });

async function test() {
  var fileNames = GetMapFileNames();
  for (let i = 0; i<fileNames.length; i++){
    let seconds = .1;

    ConvertMap(fileNames[i])

    console.log("I'm on " + i + " of " + fileNames.length);
    await sleep(1000);
  }
}

function ConvertMap(mapName: string){
    let rootFolder = './setup_scripts/convert_maps_pdf_png/';
    // rootFolder = './';
    if (process.env.ROOTFOLDER) {
      rootFolder = process.env.ROOTFOLDER;
    }


    const pdfPath =  rootFolder +'pdfs/' + mapName;
    const pageNumber = 0;

    const pdfImage = new PDFImage(pdfPath, {
      convertOptions: {
        // '-resize': '80%',
        '-density': '100',
        '-background': 'white',
        '-alpha': 'background -alpha off',
      },
      outputDirectory: rootFolder + "images/",
      //   combinedImage: true
    });
    pdfImage.setConvertExtension('png');

    pdfImage.convertPage(0).then(
      imagePath => {
        // console.log('imgpath', imagePath);
      },
      err => {
        console.log(err);
      }
    );

}

function sleep(millis: number) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

function GetMapFileNames(): string[]{
  let mapNames: string[] = [];
  var rootDir = "setup_scripts/convert_maps_pdf_png/pdfs/";
  // rootDir = "/";

  glob.sync(rootDir+"*.pdf").map((file) => {
      var fileName = file.split("/")[3];
      mapNames.push(fileName);
    })
  
  // console.log(hi);
  return mapNames
}

