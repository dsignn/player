import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-iconset-svg/iron-iconset-svg.js';

import {html} from '@polymer/polymer/lib/utils/html-tag.js';


const template = html`
<iron-iconset-svg name="admin" size="24">
    <svg>
        <defs>
            <g id="menu"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></g>       
        </defs>
    </svg>
</iron-iconset-svg>`;

document.head.appendChild(template.content);
window.customElements.define('admin-icons', class AdminIcons extends HTMLElement {});
