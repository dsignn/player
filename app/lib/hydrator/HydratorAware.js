/**
 * Hydrator aware
 */
class HydratorAware {

    constructor(hydrator) {
        this._hydrator = hydrator;
    }

    /**
     * @param hydrator {*}
     * @returns {HydratorAware}
     */
    set hydrator(hydrator) {
        switch (true) {
            case hydrator === null:
            case !(typeof hydrator === 'object'):
            case !(typeof hydrator.hydrate === 'function'):
            case !(typeof hydrator.extract === 'function'):
                throw 'Wrong object for hydrator aware';
                break
        }
        this._hydrator = hydrator;
        return this;
    }

    /**
     * @returns {null}
     */
    get hydrator() {
        return this._hydrator;
    }
}

module.exports = HydratorAware;