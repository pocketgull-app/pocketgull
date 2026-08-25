// Mock implementation to bypass ADK dependency on @google-cloud/storage in the browser
export class Storage {
    constructor() { }
    bucket() { return this; }
    file() { return this; }
    save() { return Promise.resolve(); }
    download() { return Promise.resolve(); }
}
