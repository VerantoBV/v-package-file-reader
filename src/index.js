const fs = require("node:fs");
const readXlsxFile = { readSheetNames } = require("read-excel-file/node");
const { createWorker } = require("tesseract.js");
const Jimp = require("jimp");
const pdf = require("pdf-parse");

const imageTypes = [ "apng", "avif", "gif", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "png", "svg", "webp" ]

module.exports = class Extractor {

  constructor() {
    this.store = [];
    this.first = true;
    this.worker = createWorker({
      // logger: m => console.log(m)
    });
  }

  metadata = (path) => {
    const arr = path.split(/[\/\\]/);
    return {
      path: arr.join("/"),
      dump: `./dump/${arr[arr.length - 1]}`,
      name: arr[arr.length-1].split(".")[0],
      ext: arr[arr.length-1].split(".")[1],
      converted: false,
      results: []
    };
  }

  append = (path) => {
    const meta = this.metadata(path);
    // create store for file extention if it doesn't exist
    if (!this.store[path]) this.store[path] = meta;
    // return the data
    return { meta, read: () => this.read(meta) }
  }

  read = async ({ path, dump, ext }) => {
    if (imageTypes.includes(ext)) ext = "image";
    if (!this.store[path].converted) switch (ext) {
      case "pdf":
          let dataBuffer = fs.readFileSync(path);
          pdf(dataBuffer).then(function(data){
            // number of pages
            console.log(data.numpages);
            // number of rendered pages
            console.log(data.numrender);
            // PDF info
            console.log(data.info);
            // PDF metadata
            console.log(data.metadata);
            // PDF.js version
            // check https://mozilla.github.io/pdf.js/getting_started/
            console.log(data.version);
            // PDF text
            console.log(data.text);
          });
      break;
      case "image":
        console.log("- started refactoring image");
        const image = await Jimp.read(path)
        image
          .clone()
          .greyscale()
          .write(dump)
        console.log("- finished refactoring image");
        console.log("- started initializing text extraction worker");
        await this.worker.load();
        await this.worker.loadLanguage('nld');
        await this.worker.initialize('nld');
        console.log("- started text extraction from the image");
        const { data: { text } } = await this.worker.recognize(dump);
        console.log("- finished text extraction from the image");
        console.log("- started memoization of the results the worker delivered");
        this.store[path].results = text;
        this.store[path].converted = true;
        console.log("- finished memoization of the results the worker delivered");
      break;
      case "xlsx":
        this.store[path].sheets = await readSheetNames(path);
        for (const sheet of this.store[path].sheets) 
          this.store[path].results[sheet] = await readXlsxFile(fs.readFileSync(path), { sheet });
        this.store[path].converted = true;
      break;
      default:
        console.error("[file-reader:error] invalid file extention: " + ext);
      break;
    }
    console.log("----------------------------------------------------");
    return this.store[path]
  }

  process = (filedata) => {
    console.log(filedata)
  }

}