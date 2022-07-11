import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-iconset-svg/iron-iconset-svg.js';

import {html} from '@polymer/polymer/lib/utils/html-tag.js';


const template = html`
<iron-iconset-svg name="ice-hockey" size="24">
    <svg>
        <defs style="enable-background:new 0 0 511.999 511.999;">
            <g id="menu">
            <path d="M17 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zM5 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </g>              
        </defs>
    </svg>
</iron-iconset-svg>`;

document.head.appendChild(template.content);
window.customElements.define('ice-hockey-icons', class MonitorIcons extends HTMLElement {});
