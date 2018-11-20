/**
 *
 */
class HydratorStrategy {

    constructor(hydrator) {
        this.hydrator = hydrator ? hydrator : null;
        this.referenceObject = null;
    }

    /**
     *
     * @param data
     * @returns {*}
     */
    hydrateStrategy(data) {
        let hydrate = [];
        if (Array.isArray(data)) {
            for (let cont = 0; data.length > cont; cont++) {

                this.hydrator.referenceObject = this._getReferenceObject(cont);
                hydrate[cont] = this.hydrator.hydrate(
                    data[cont]
                );
            }
        } else {

            this.hydrator.referenceObject = this._getReferenceObject();
            hydrate = this.hydrator.hydrate(
                data
            );
        }

        return hydrate;
    }

    /**
     * @param index
     * @return {undefined}
     * @private
     */
    _getReferenceObject(index) {
        let reference = undefined;
        if (index === 0 || index > 0) {
            if (Array.isArray(this.referenceObject) && this.referenceObject.length > index) {
                reference = this.referenceObject[index]
            }
        } else {
            reference = typeof this.referenceObject  === 'object' && this.referenceObject !== null
        }
        return reference;
    }


    /**
     *
     * @param data
     * @returns {{}|*}
     */
    extractStrategy(data) {
        let extract = [];
        if (Array.isArray(data)) {
            for (let cont = 0; data.length > cont; cont++) {
                extract[cont] = this.hydrator.extract(data[cont]);
            }
        } else {
            extract = this.hydrator.extract(data);
        }

        return extract;
    }

}

module.exports = HydratorStrategy;