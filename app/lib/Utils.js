
class Utils {

    /**
     * @returns {string}
     */
    static get uid() {
        let timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    }

    /**
     * String with path name and extension

     * @param {string} oldPath
     *
     * String with path with name and extension

     * @param {string} newPath
     * @private
     */
    static move(oldPath, newPath) {

        let fs = require('fs');
        let readStream = fs.createReadStream(oldPath);
        let writeStream = fs.createWriteStream(newPath);

        let error = (data) => {
            console.error(data);
        };

        let close = (data) => {
            console.log('close read stream');
        };

        readStream.on('error', error);
        writeStream.on('error', error);

        readStream.on('close', function () {
            fs.unlink(oldPath, close);
        });

        readStream.pipe(writeStream);
    }

    static removeDir(path) {
        let fs = require('fs');
        if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }
}
