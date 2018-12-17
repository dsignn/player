let assert  = require('chai').assert;
let expect  = require('chai').expect;

const PlaylistService = require('../src/PlaylistService');


describe('Playlist Service', function() {

    it('Construct', function() {
        let playlistService = new PlaylistService();

        expect(playlistService.runningPlaylist).to.be.an('object').that.is.empty;
        expect(playlistService.timeslotSender).to.be.an('null');
        expect(playlistService.playlistStorage).to.be.an('null');
        expect(playlistService.eventManager).to.be.an.instanceof(EvtManager);
    });

    it('setRunningPlaylist - getRunningPlaylist', function() {
        let playlistService = new PlaylistService();

        let playlist = {test:'test'};
        playlistService.setRunningPlaylist(playlist);

        expect(playlistService.runningPlaylist).to.be.an('object').that.is.empty;

        playlist.getMonitorId = function () {
            return 'test';
        };
        playlistService.setRunningPlaylist(playlist);

        expect(playlistService.runningPlaylist).to.be.an('object').that.is.not.empty;

        let running = playlistService.getRunningPlaylist(playlist.getMonitorId(), undefined);

        assert.equal(running, playlist);
    });

    it('isRunning', function() {
        let playlistService = new PlaylistService();

        let playlist = {test:'test'};
        playlist.getMonitorId = function () {
            return 'monitor';
        };

        playlist.context = 'standard';
        playlist.id = 1;

        let playlist2 = {test:'test'};
        playlist2.getMonitorId = function () {
            return 'monitor';
        };

        playlist2.context = 'overlay';
        playlist2.id = 2;

        playlistService.setRunningPlaylist(playlist);
        assert.equal(playlistService.isRunning(playlist), true, 'First running');
        assert.equal(playlistService.isRunning(playlist2), false, 'Second not running');

        playlistService.setRunningPlaylist(playlist2);
        assert.equal(playlistService.isRunning(playlist), true, 'First already running');
        assert.equal(playlistService.isRunning(playlist2), true, 'Second running');
    });
});