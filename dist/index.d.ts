interface Metadata {
    id: string;
}
export default class Converter {
    constructor();
    process(file: {
        data: string;
    }): Metadata;
}
export {};
