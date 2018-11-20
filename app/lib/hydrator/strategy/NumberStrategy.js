/**
 *
 */
class NumberStrategy {

    /**
     *
     * @param data
     * @returns {*}
     */
    hydrateStrategy(data) {

        let hydrate = data;

        switch (typeof data) {
            case 'string':
                hydrate = parseFloat(data);
                break;
            case 'boolean':
                hydrate = data ? 1 : 0;
                break;
        }

        return hydrate;
    }

    /**
     *
     * @param data
     * @returns {{}|*}
     */
    extractStrategy(data) {
        let extract = data;

        switch (typeof data) {
            case 'string':
                extract = parseFloat(data);
                break;
            case 'boolean':
                extract = data ? 1 : 0;
                break;
        }

        return extract;
    }

}

module.exports = NumberStrategy;