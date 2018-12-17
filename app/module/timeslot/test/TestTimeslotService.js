let assert  = require('chai').assert;
let expect  = require('chai').expect;

const TimeslotService = require('../src/TimeslotService');

describe('Timeslot Service', function() {

    it('Construct', function() {
        let timeslotService = new TimeslotService();

        expect(timeslotService.runningTimeslots).to.be.an('object').that.is.empty;
        expect(timeslotService.timeslotSender).to.be.an('null');
        expect(timeslotService.timeslotStorage).to.be.an('null');
        expect(timeslotService.eventManager).to.be.an.instanceof(EvtManager);
    });
});