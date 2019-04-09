import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-module';
import '@polymer/polymer/lib/elements/dom-bind';
import '@polymer/polymer/lib/elements/dom-repeat';

import '../../style/dashboard-style';

/***
 * Import entry point module dev
 */
import '../../module/dashboard/index';
import '../../module/dashboard/element/icons/icons';

import '../../module/monitor/index';
import '../../module/monitor/element/icons/icons';
import '../../module/monitor/element/paper-monitor-viewer/paper-monitor-viewer';

import '../../elements/layout/dsign-layout';
import '../../entrypoint/dashboard/src/boot';