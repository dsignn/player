import {html} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout';

export const flexStyle = html`
    <style is="custom-style">
    
        .layout-menu {
            width: var(--menu-width);
            min-width: var(--menu-min-width);
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
        
        .layout-end-aligned {
            @apply  --layout-end;
        }

        .layout-center-justified {
            @apply --layout-center-justified;
        }
        
        .layout-end-justified {
            @apply --layout-end-justified;
        }
        
        .layout-flex {
            @apply --layout-flex;
        }
        
        .layout-flex-2 {
            @apply --layout-flex-2;
        }

        .layout-flex-3 {
            @apply --layout-flex-3;
        }

        .layout-flex-4 {
            @apply --layout-flex-4;
        }

        .layout-flex-5 {
            @apply --layout-flex-5;
        }

        .layout-flex-6 {
            @apply --layout-flex-6;
        }

        .layout-flex-7 {
            @apply --layout-flex-7;
        }
        
        .layout-flex-8 {
            @apply --layout-flex-8;
        }
        
        .layout-flex-9 {
            @apply --layout-flex-9;
        }
        
        .layout-flex-10 {
            @apply --layout-flex-10;
        }
        
        .layout-flex-11 {
            @apply --layout-flex-11;
        }
        
        .layout-flex-12 {
            @apply --layout-flex-12;
        }

        .layout-container {
            height: 100%;
        }
        
        .layout-content {
            padding: var(--content-padding);
        }
       
        .debug1 {
            background: red;
            opacity: 0.5;
        }
         
        .debug2 {
            background: green;
            opacity: 0.5;
        }
    </style>`;