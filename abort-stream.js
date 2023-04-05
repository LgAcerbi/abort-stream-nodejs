const fs = require("fs");
const { Transform, pipeline, addAbortSignal } = require("stream");

const byteLimit = 68000;

const abortController = new AbortController();
const { signal } = abortController;
signal.onabort = () => {
    console.log(signal.aborted);
    console.log(signal.reason);
};

const inputFileStream = fs.createReadStream("doc.kml");
const outputFileStream = fs.createWriteStream("output.xml");
const validationFileStream = new Transform({
    transform(chunk, encoding, callback) {
        this.byteCount += chunk.byteLength;
        if (this.byteCount > this.byteLimit) {
            abortController.abort("Something");
        }

        console.log("passing chunk forward");
        callback(null, chunk);
    },
});

addAbortSignal(signal, validationFileStream);

validationFileStream.byteCount = 0;
validationFileStream.byteLimit = byteLimit;

pipeline(inputFileStream, validationFileStream, outputFileStream, (error) => {
    console.log(error);
});
