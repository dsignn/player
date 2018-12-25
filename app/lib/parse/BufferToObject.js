/**
 *
 */
class BufferToObject {

    /**
     *
     * @param {Uint8Array} data
     * @return {Object}
     */
    parse(data) {
        return JSON.parse(data.toString());
    }
}