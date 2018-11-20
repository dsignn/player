
try {
    AbstractHydrator = require('./AbstractHydrator');
}
catch(err) {
    AbstractHydrator = require(__dirname + '/lib/hydrator/AbstractHydrator');
}

/**
 * Hydrate by method property
 */
class AggregatePropertyHydrator extends AbstractHydrator {

    /**
     *
     * @param {String} type
     * @param {Object} strategies
     */
    constructor(type, strategies) {
        super(strategies);
        this.type = type;
        this.hydratorMap = {};
    }

    /**
     * @param {Object} hydrator
     * @param {array} arrayMap
     * @return {AggregatePropertyHydrator}
     */
    addHydratorMap(hydrator, arrayMap) {
        if (this.hydratorMap[hydrator.objectPrototype.constructor.name]) {
            for (let i = 0; arrayMap.lenght > i; i++) {
                let found = this.hydratorMap[hydrator.objectPrototype.constructor.name].map.find(
                    (element) => {
                        element === arrayMap[i];
                    }
                );

                if(!found) {
                    this.hydratorMap[hydrator.objectPrototype.constructor.name].map.push(arrayMap[i]);
                }
            }
        } else {
            this.hydratorMap[hydrator.objectPrototype.constructor.name] = {
                'hydrator' : hydrator,
                'map' : arrayMap
            };
        }
        return this;
    }

    /**
     * @param {String} type
     * @return {Object}
     * @private
     */
    _getHydratorFromType(type) {
        let hydrator = null;
        for (let property in this.hydratorMap) {
            let found = this.hydratorMap[property].map.find((element) => {
                return type === element;
            });

            if (found) {
                hydrator = this.hydratorMap[property].hydrator;
                break;
            }
        }
        return hydrator;
    }

    /**
     * @param {String} object
     * @return {Object}
     * @private
     */
    _getHydratorFromObject(object) {
        let hydrator = null;
        for (let property in this.hydratorMap) {
            if (object.constructor.name === property) {
                hydrator = this.hydratorMap[property].hydrator;
                break;
            }
        }
        return hydrator;
    }

    /**
     * @param {Object} data
     * @returns {Object}
     */
    hydrate(data) {
        super.hydrate(data);

        let hydrator = null;

        if (this.referenceObject) {
            hydrator = this._getHydratorFromObject(this.referenceObject);
            hydrator.referenceObject = this.referenceObject;
        }

        if (!hydrator) {
            hydrator = this._getHydratorFromObject(data);
        }

        if (!hydrator && data[this.type]) {
            hydrator = this._getHydratorFromType(data[this.type]);
        }

        if (!hydrator) {
            throw 'Hydrator not found';
        }

        return hydrator.hydrate(data);
    }

    /**
     * @param {Object} obj
     * @returns {Object}
     */
    extract(obj) {

        let hydrator = this._getHydratorFromObject(obj);

        if (!hydrator && obj[this.type]) {
            hydrator = this._getHydratorFromType(obj[this.type]);
        }

        if (!hydrator) {
            throw 'Hydrator not found';
        }

        return hydrator.extract(obj);
    }

}

module.exports = AggregatePropertyHydrator;