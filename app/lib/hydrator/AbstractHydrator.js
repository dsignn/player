/**
 * Abstract class to hydrate object
 */
class AbstractHydrator {

    constructor(strategies, nameStrategies) {
        this.strategies = strategies ? strategies : {};
        this.nameStrategies = nameStrategies ? nameStrategies : {};
        this.referenceObject = null;
    }

    /**
     *
     * @param name
     * @param strategy
     * @returns {AbstractHydrator}
     */
    addStrategy(name, strategy) {
        switch (true) {
            case typeof strategy === null:
            case typeof strategy !== 'object':
            case typeof strategy.extractStrategy !== 'function':
            case typeof strategy.hydrateStrategy !== 'function':
                throw 'Wrong strategy';
                break;
        }

        this.strategies[name] = strategy;
        return this;
    }

    /**
     *
     * @param name
     * @returns {AbstractHydrator}
     */
    removeStrategy(name) {
        delete this.strategies[name];
    }

    /**
     * @param {Object} data
     * @param {Object} hydrateObject
     * @returns {Object}
     */
    hydrate(data, hydrateObject) {
        this._checkInputObject(data);
    }

    /**
     * @param {Object} object
     * @return {Object}
     */
    extract(object) {
        this._checkInputObject(object);
    }

    /**
     *
     * @param data
     * @private
     */
    _checkInputObject(data) {
        if(typeof data !== 'object' || data === null) {
            throw 'Wrong data input';
        }
    }
}

module.exports = AbstractHydrator;