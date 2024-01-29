const TimelineEntity = (async () => {      

    const { Time } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/date/Time.js`));

    const { MonitorPropertyAwareMixin } = await import(`${container.get('Application').getBasePath()}module/monitor/src/entity/mixin/MonitorPropertyAwareMixin`);
    const { PlayerPropertyAwareMixin } = await import(`${container.get('Application').getBasePath()}module/resource/src/entity/mixin/PlayerPropertyAwareMixin`);  
    const { BindMixin } = await import(`${container.get('Application').getBasePath()}module/resource/src/entity/mixin/BindMixin`);    
    const { TimelineAwareMixin } = await import(`${container.get('Application').getAdditionalModulePath()}/timeline/src/entity/mixin/TimelineAwareMixin`); 

    const { EntityIdentifier } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));

    /**
     * @class TimelineEntity
     */
    class TimelineEntity  extends TimelineAwareMixin(BindMixin(PlayerPropertyAwareMixin(MonitorPropertyAwareMixin(EntityIdentifier)))) {

        constructor() {

            super();

            /**FV
             * @type {string|null}
             */
            this.name = null;
        }
    }
    return {TimelineEntity: TimelineEntity};
})();

export default TimelineEntity;
export const then = TimelineEntity.then.bind(TimelineEntity);