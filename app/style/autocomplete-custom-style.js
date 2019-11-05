import {html} from '@polymer/polymer/polymer-element.js';

export const autocompleteStyle = html`
    <style>
        :host {
            display: block;
            position: absolute;
        }
        
        paper-item.account-item {
            padding: 8px 16px;
        }
        
        .service-name {
            color: #333;
        }
        
        .service-description {
            margin-top: 4px;
            color: #999;
        }
    </style>
    `;
