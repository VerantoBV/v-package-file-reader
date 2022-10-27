"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("buffer");
const metaObject = (data) => {
    console.log(buffer_1.Buffer.from(data));
    return {
        id: ""
    };
};
class Converter {
    constructor() { }
    process(file) {
        const metadata = metaObject(file.data);
        return metadata;
    }
}
exports.default = Converter;
//# sourceMappingURL=index.js.map