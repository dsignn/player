import '@polymer/paper-toast/paper-toast';

import '../../style/dashboard-style';
import '../../elements/layout/application-layout';

/**
 * start dashboard
 */
import '../../module/dashboard/index';
import '../../module/dashboard/element/paper-widget/paper-widget';
import '../../module/dashboard/element/icons/icons';
/**
 * end ashboard
 */


/**
 * start monitor
 */
import '../../module/monitor/index';
import '../../module/monitor/element/icons/icons';
import '../../module/monitor/element/paper-monitor-viewer/paper-monitor-viewer';
import '../../module/monitor/element/paper-player/paper-player';
import '../../module/monitor/element/paper-player-timeslot/paper-player-timeslot';
import '../../module/monitor/element/paper-player-manager/paper-player-manager';
/**
 * end monitor
 */


/**
 * start resource
 */
import '../../module/resource/index';
import '../../module/resource/element/icons/icons';
import '../../module/resource/element/wc-resource/wc-resource-test';
/**
 * end resource
 */


/**
 * start timeslot
 */
import '../../module/timeslot/index';
import '../../module/timeslot/element/icons/icons';

import '../../module/timeslot/element/widget/paper-timeslot-tags/paper-timeslot-tags';
import '../../module/timeslot/element/widget/paper-timeslot-tags/paper-timeslot-tags-data';
import '../../module/timeslot/element/widget/paper-timeslot-monitors/paper-timeslot-monitors';
import '../../module/timeslot/element/widget/paper-timeslot-monitors/paper-timeslot-monitors-data';
/**
 * end playlist
 */


/**
 * start playlist
 */
import '../../module/playlist/index';
import '../../module/playlist/element/icons/icons';
/**
 * end playlist
 */

/**
 * start admin
 */
import '../../module/admin/index'
import '../../module/admin/element/icons/icons'
/**
 * end admin
 */

/**
 * start media-device
 */
import '../../module/media-device/index'
import '../../module/media-device/element/icons/icons'
/**
 * end media-device
 */
 
/**
 * boot application
 */
import '../../entrypoint/dashboard/src/boot'


