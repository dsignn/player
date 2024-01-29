/**
 * 
 * @class DataReferenceMixin 
 */
export const DataReferenceAwareMixin = (superClass) => {
    
    return class extends superClass {

        constructor() {
            super();
        
            this.dataReferences = [];
        }

        /**
         * @returns {string}
         */
        appendDataReference(dataReference) {
            return this.dataReferences.push(dataReference);
            return this;
        }

        /**
         * @returns array
         */
        getDataReferences() {
            return this.dataReferences;
        }
    }   
};
