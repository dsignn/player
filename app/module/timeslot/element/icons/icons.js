import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-iconset-svg/iron-iconset-svg.js';

import {html} from '@polymer/polymer/lib/utils/html-tag.js';


const template = html`
<iron-iconset-svg name="timeslot" size="24">
    <svg>
        <defs>
             <g id="menu"><path d="M2,2H4V20H22V22H2V2M7,10H17V13H7V10M11,15H21V18H11V15M6,4H22V8H20V6H8V8H6V4Z"></path></g>          
        </defs>
    </svg>
</iron-iconset-svg>`;

document.head.appendChild(template.content);
