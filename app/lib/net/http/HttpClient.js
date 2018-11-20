class  HttpClient  {

    /**
     * @param {String} url
     * @param {Object} headers
     */
    constructor(url, headers) {

        this.url = url;

        this.headers = headers;

        this.client = require('node-fetch');
    }

    /**
     * @param placeholder
     * @param headers
     * @return {Promise}
     */
    get(attachPath, headers) {


        // TODO merge headers
        // TODO compute path

        return this.client(
            `${this.url}${attachPath}`,
            {
                headers: this.headers
            }
        );
    }
}