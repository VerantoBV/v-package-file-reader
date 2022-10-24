const fs = require("node:fs");
const readXlsxFile = { readSheetNames } = require("read-excel-file/node");
const { createWorker } = require("tesseract.js");
const Jimp = require("jimp");

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

      break;
      case "image":
        console.log("image found");
        console.log("grayscale the given image");
        Jimp.read(path, (e, f) => {
          f
            .clone()
            .greyscale()
            .write(dump)
        })
        console.log("initialize tesseract worker");
        await this.worker.load();
        await this.worker.loadLanguage('nld');
        await this.worker.initialize('nld');
        console.log("worker started reading image");
        const { data: { text } } = await this.worker.recognize(dump);
        console.log("worker finished reading image");
        this.store[path].results = text;
        this.store[path].converted = true;
        console.log("results stored within the cache");
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

}