const fs = require("node:fs");
const readXlsxFile = { readSheetNames } = require("read-excel-file/node");
const { createWorker } = require("tesseract.js");
 this.worker
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

  read = async ({ ext, path }) => {
    if (imageTypes.includes(ext)) ext = "image";
    if (!this.store[path].converted) switch (ext) {
      case "image":
        console.log("image found");
        await this.worker.load();
        await this.worker.loadLanguage('nld');
        await this.worker.initialize('nld');
        const { data: { text } } = await this.worker.recognize(path);
        this.store[path].results = text;
        this.store[path].converted = true;
      break;
      case "pdf":

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
    return this.store[path]
  }

}