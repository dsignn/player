import { EventManagerAware } from "@dsign/library/src/event";
import { EventManager } from "@dsign/library/src/event/index";
import { FileEntity } from "./entity/FileEntity";
import { MultiMediaEntity } from "./entity/MultiMediaEntity";
import { MetadataEntity } from "./entity/MetadataEntity";

/**
 * @class AbstractResourceSenderService
 */
export class AbstractResourceSenderService extends EventManagerAware {

   /**
    * Name of the "message" send from sender when play resource
    *
    * @return {string}
    */
   static get CLEAR_LAYER() { return 'clear-layer'; }

   /**
    * Name of the "message" send from sender when play resource
    *
    * @return {string}
    */
   static get PLAY() { return 'play-resource'; }

   /**
    * Name of the "message" send from sender when stop resource
    *
    * @return {string}
    */
   static get STOP() { return 'stop-resource'; }

   /**
    * Name of the "message" send from sender when pause resource
    *
    * @return {string}
    */
   static get PAUSE() { return 'pause-resource'; }

   /**
    * Name of the "message" send from sender when resume resource
    *
    * @return {string}
    */
   static get RESUME() { return 'resume-resource'; }

   /**
    * Name of the "message" send from sender when resume resource
    *
    * @return {string}
    */
   static get CHANGE_TIME() { return 'change-time-resource'; }

   /**
    * Name of the "message" send from sender when resume resource
    *
    * @return {string}
    */
   static get UPDATE_TIME() { return 'update-time-resource'; }

   /**
    * @param {Storage} resourceStorage
    * @param {Storage} resourceSenderStorage
    * @param {Timer} timer
    * @param {ContainerAggregate} dataInjectorManager
    */
   constructor(resourceStorage, timer, dataInjectorManager) {

      super();

      this.resourceStorage = resourceStorage;

      this.timer = timer;

      this.dataInjectorManager = dataInjectorManager;

      this.eventManager = new EventManager();

      /**
        * Check if timer is inject
        */
      if (!this.timer) {
         throw 'Timer not set';
      }
   }

   /**
    * @private
    */
   _schedule() {
      throw 'Must be implements';
   }

   /**
    *
    * @param {Object} resourceSenderEntity
    * @return {boolean}
    */
   isRunning(resourceSenderEntity) {
      throw 'Must be implements';
   }

   /**
    * @param {Object} resourceSenderEntity
    */
   play(resourceSenderEntity) {
      throw 'Must be implements';
   }

   /**
    * @param {Object} resourceSenderEntity
    */
   stop(resourceSenderEntity) {
      throw 'Must be implements'
   }

   /**
    * @param {Object} resourceSenderEntity
    */
   pause(resourceSenderEntity) {
      throw 'Must be implements'
   }

   /**
    * @param resourceSenderEntity
    */
   resume(resourceSenderEntity) {
      throw 'Must be implements'
   }

   /**
    * @param {Array} dataReferences
    * @return {Promise}
    * @private
    */
   async _extractDataFromDataReferences(dataReferences) {

      let promises = [];
      let data;

      for (let cont = 0; dataReferences.length > cont; cont++) {
         data = {};
         if (this.dataInjectorManager.has(dataReferences[cont].name)) {

            data[this.dataInjectorManager.get(dataReferences[cont].name).serviceNamespace] =
               await this.dataInjectorManager.get(dataReferences[cont].name).getData(dataReferences[cont].data);

            promises.push(data);
         }
      }

      return Promise.all(promises);
   }

   /**
    *
    * @param resource
    * @return {Object}
    * @private
    */
   async _extractData(resource) {

      let data = {};

      switch (true) {
         case (resource instanceof MultiMediaEntity):
            for (let cont = 0; resource.getResources().length > cont; cont++) {
               let tmpResource = resource.getResources()[cont];

               if ((tmpResource instanceof MetadataEntity) && tmpResource.getDataReferences().length > 0) {
                  Object.assign(data, this.arrayToObject(await this._extractDataFromDataReferences(tmpResource.getDataReferences())));
               }
            }

            break;
         case (resource instanceof MetadataEntity && resource.getDataReferences().length > 0):
            Object.assign(data, this.arrayToObject(await this._extractDataFromDataReferences(resource.getDataReferences())));
            break;

      }
      return data;
   }

   /**
    * @param {array} arrayData 
    * @returns object
    */
   arrayToObject(arrayData) {
      let data = {}
      for (let cont = 0; arrayData.length > cont; cont++) {
         Object.assign(data, arrayData[cont]);
      }

      return data;
   }

   /**
    * @param {*} nameEvt 
    * @param {*} resourceSenderEntity 
    */
   emitResourceEvt(nameEvt, resourceSenderEntity, data) {

      let evtData = {
         resource: resourceSenderEntity
      }

      if (data) {
         evtData.data = data;
      }

      this.getEventManager().emit(nameEvt, evtData);
   }
}