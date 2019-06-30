import {PolymerElement, html} from '@polymer/polymer';

import '../../style/player-style';

/**
 * Dashboard module
 */
import '../../module/dashboard/index';
import '../../module/dashboard/element/paper-widget/paper-widget';
import '../../module/dashboard/element/icons/icons';

/**
 * Monitor module
 */
import '../../module/monitor/index';
import '../../module/monitor/element/icons/icons';
import '../../module/monitor/element/paper-monitor-viewer/paper-monitor-viewer';
import '../../module/monitor/element/paper-player/paper-player';
import '../../module/monitor/element/paper-player-timeslot/paper-player-timeslot';
import '../../module/monitor/element/paper-player-manager/paper-player-manager';

/**
 * Resource module
 */
import '../../module/resource/index';
import '../../module/resource/element/icons/icons';
import '../../module/resource/element/wc-resource/wc-resource-test';

/**
 * Timeslot module
 */
import '../../module/timeslot/index';
import '../../module/timeslot/element/icons/icons';

import '../../module/timeslot/element/widget/paper-timeslot-tags/paper-timeslot-tags';
import '../../module/timeslot/element/widget/paper-timeslot-tags/paper-timeslot-tags-data';
import '../../module/timeslot/element/widget/paper-timeslot-monitors/paper-timeslot-monitors';
import '../../module/timeslot/element/widget/paper-timeslot-monitors/paper-timeslot-monitors-data';

/**
 * playlist module
 */
import '../../module/playlist/index';
import '../../module/playlist/element/icons/icons';

import '../../entrypoint/player/src/boot';
