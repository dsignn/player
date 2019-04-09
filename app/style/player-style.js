import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/paper-styles/default-theme';

const template = html`
<custom-style id="player-style">
    <style is="custom-style">
    
        /*******************************************
                    LAYOUT STYLE
        *******************************************/
        body, html {
            height: 100%;
            overflow: hidden;
            margin: 0;
            padding: 0;
        }
                
    </style>
</custom-style>`;

template.setAttribute('style', 'display: none;');
document.head.appendChild(template.content);