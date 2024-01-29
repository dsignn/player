/**
 * 
 * @class DurationMixin 
 */
export const DurationMixin = (superClass) => {

    return class extends superClass {

        constructor() {
            super();

            this.timelineItems = [];
        }

        /**
        * 
        */
        getDuration() {

            let itemDuration = 0;

            if (this.timelineItems.length === 0) {
                return itemDuration;
            }

            let last = this.timelineItems[this.timelineItems.length - 1];
            let lastItemDuration = last.time.getDuration();

            for (let index = 0; last.timeslotReferences.length > index; index++) {
                if (itemDuration < last.timeslotReferences[index].duration) {
                    itemDuration = last.timeslotReferences[index].duration;
                }
            }

            return (lastItemDuration + itemDuration);
        }
    }
}