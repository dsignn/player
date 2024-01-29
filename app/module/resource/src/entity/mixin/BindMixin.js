/**
 * 
 * @class BindMixin 
 */
export const BindMixin = (superClass) => {

    return class extends superClass {

        constructor() {
            super();

            this.binds = [];
        }

        /**
         * @param {ReferenceEntity} referenceEntity
         * @return {BindMixin}
         */
        removeBind(referenceEntity) {

            let index = this.binds.findIndex(
                (element) => {
                    return element.resourceReference.id === referenceEntity.resourceReference.id && 
                        element.monitorContainerReference.id === referenceEntity.monitorContainerReference.id;
                }
            );

            if (index > -1) {
                this.binds.splice(index, 1);
            }

            return this;
        }

        /**
         * 
         * @param {ReferenceEntity} referenceEntity 
         */
        appendBind(referenceEntity) {
                        
            this.binds.push(referenceEntity);
            return this;
        }

        /**
         * @returns array
         */
        getBinds() {
            return this.binds;
        }
    }

};
