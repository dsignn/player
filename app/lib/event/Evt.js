/**
 *
 */
class Evt {

    /**
     * @param name
     * @param data
     */
    constructor(name, data) {

        this.name = name;
        this.data = data;
        this.stopPropagation = false;
    }
}

module.exports = Evt;