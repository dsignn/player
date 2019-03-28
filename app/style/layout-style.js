import {html} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout';

export const flexStyle = html`
    <style is="custom-style">
    
        .layout-menu {
            width: var(--menu-width);
            min-width: var(--menu-min-width);
        }
        
        .layout-content {
            min-height: 100%;
            height: max-content;
            border-left: var(--divider-color) solid 1px;
        }
    
        /*******************************************
                    FLEX LAYOUT
         *******************************************/

        .layout {
            @apply --layout;
        }

        .layout-horizontal {
            @apply --layout-horizontal;
        }

        .layout-vertical {
            @apply --layout-vertical;
        }

        .layout-flex-auto {
            @apply  --layout-flex-auto;
        }

        .layout-center-aligned {
            @apply  --layout-center;
        }

        .layout-center-justified {
            @apply --layout-center-justified;
        }

        .layout-container {
            height: 100%;
        }
        
        .layout-content {
            padding: var(--content-padding);
        }
    </style>`;