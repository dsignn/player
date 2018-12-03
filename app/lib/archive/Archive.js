class Archive {

    /**
     *
     * @param {string} type
     * @param {string} fileDestination
     * @param {Object} options
     */
    constructor(type, fileDestination, options) {

        /**
         * @type {string}
         */
        this.type = type;

        /**
         *
         * @type {Object}
         */
        this.options = options;

        /**
         * @type {string}
         */
        this.fileDestination = fileDestination;

        /**
         * @type {Archiver}
         */
        this._archive = null;

        /**
         * @type {fs.Stream | null}
         */
        this._output = null;
    }

    /**
     *
     */
    prepareArchive() {

        this._archive = archiver(this.type, this.options);
        this._output  = fs.createWriteStream(this.fileDestination);
        this._archive.pipe(this._output);
    }

    /**
     *
     * @param serviceName
     * @param storage
     * @return {Promise<any>}
     */
    appendStorageData(serviceName, storage) {
        return new Promise((resolve, reject) => {

            storage.getAll().then((data) => {

                let dataString = '';
                let comma = ',';
                for (let cont = 0; data.length > cont; cont++) {

                    comma = data.length > (cont+1) ? comma : '';
                    dataString = dataString.concat(`${JSON.stringify(storage.hydrator.extract(data[cont]))}${comma}`);
                }
                let result = `[${dataString}]`;

                this._archive.append(result, { name: `${serviceName}.json` });
                resolve(this);
            }).catch((err) => {reject(err)});
        });
    }

    /**
     * @param {string} path
     * @param {string} directoryInArchive
     */
    appendDirectory(path, directoryInArchive) {
        this._archive.directory(path, directoryInArchive);
    }

    /**
     *
     */
    archive() {
        this._archive.finalize();
    }
}

