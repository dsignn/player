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
         * @param {ResourceSenderEntity} resourceSenderEntity
         * @return {DurationMixin}
         */
        removeBind(resourceSenderEntity) {

            let index = this.binds.findIndex(
                (element) => {
                    return element.resourceReference.id === resourceSenderEntity.resourceReference.id && 
                        element.monitorContainerReference.id === resourceSenderEntity.monitorContainerReference.id;
                }
            );

            if (index > -1) {
                this.binds.splice(index, 1);
            }

            return this;
        }

        /**
         * 
         * @param {ResourceSenderEntity} resourceSenderEntity 
         */
        appendBind(resourceSenderEntity) {
                        
            this.binds.push(resourceSenderEntity);
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
