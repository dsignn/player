import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/paper-styles/default-theme';

const template = html`
<custom-style id="timeslot-style">
    <style is="custom-style">
    
        :root {

            --timeslot-running : #39A33D;
            --timeslot-pause   : #FAD646;
            --timeslot-idle   : #F00755;
        }
 
    </style>
</custom-style>`;

template.setAttribute('style', 'display: none;');
document.head.appendChild(template.content);

window.customElements.define('timeslot-style', class TimeslotStyle extends HTMLElement {});
