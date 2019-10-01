
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-iconset-svg/iron-iconset-svg.js';

import {html} from '@polymer/polymer/lib/utils/html-tag.js';


const template = html`
<iron-iconset-svg name="video-panel" size="24">
    <svg>
        <defs>
            <g id="menu"><path d="M22,4H2v16h20V4z M4,9h10.5v3.5H4V9z M4,14.5h10.5V18L4,18V14.5z M20,18l-3.5,0V9H20V18z"/></g>       
        </defs>
    </svg>
</iron-iconset-svg>`;

document.head.appendChild(template.content);
window.customElements.define('video-panel-icons', class VideoPanelIcons extends HTMLElement {});
