import { Buffer } from "buffer";

interface Metadata {
  id: string;
  buffer: Buffer;
}

interface File {
  info: any;
  data: string;
}

const metaObject = (file: File): Metadata => {
  return {
    id: "",
    buffer: Buffer.from(file.data)
  };
}

export default class Converter {

  constructor() {}

  process(file: File) {
    const metadata = metaObject(file);
    return metadata;
  }

}