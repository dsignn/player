import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/paper-styles/default-theme';

const template = html`
<custom-style id="dashboard-style">
    <style is="custom-style">
    
    
     :root {
            /**
            --dark-primary-color:       #E64A19;
            --default-primary-color:    #FF5722;
            --light-primary-color:      #FFCCBC;
            --text-primary-color:       #FFFFFF;
            --accent-color:             #4CAF50;
            --primary-background-color: #FFCCBC;
            --primary-text-color:       #212121;
            --secondary-text-color:     #757575;
            --disabled-text-color:      #BDBDBD;
            --divider-color:            #BDBDBD;
    
            --drawer-menu-color:           #ffffff;
            --drawer-border-color:         1px solid #ccc;
            --drawer-toolbar-border-color: 1px solid rgba(0, 0, 0, 0.22);
    
            --paper-menu-background-color: #fff;
            --menu-link-color:             #111111;
            */
               
            --dark-primary-color:       #512DA8;
            --default-primary-color:    #673AB7;
            --light-primary-color:      #D1C4E9;
            --text-primary-color:       #FFFFFF;
            --accent-color:             #CDDC39;
            --primary-background-color: #D1C4E9;
            --primary-text-color:       #212121;
            --secondary-text-color:     #757575;
            --disabled-text-color:      #BDBDBD;
            --divider-color:            #BDBDBD;


            /* Components */

            /* paper-drawer-panel */
            --drawer-menu-color:           #ffffff;
            --drawer-border-color:         1px solid #ccc;
            --drawer-toolbar-border-color: 1px solid rgba(0, 0, 0, 0.22);

            /* paper-menu */
            --paper-menu-background-color: #fff;
            --menu-link-color:             #111111;

            /* paper-input */
            --paper-input-container-color:       var(--primary-text-color);
            --paper-input-container-focus-color: var(--primary-text-color);
            --paper-input-container-input-color: var(--primary-text-color);
            
            /* paper-tooltup */
            --paper-tooltip-background: var(--default-primary-color);
             
            /* paper-toggle-button */
            --paper-toggle-button-unchecked-button :  {
                background-color:  red;
            }
            
            --paper-toggle-button-checked-button-color : var(--accent-color);
            --paper-toggle-button-unchecked-bar-color: red;
            --paper-toggle-button-checked-bar-color: var(--accent-color);
      
            --menu-width: 56px;
            --menu-min-width : 56px;
            --content-padding: 8px;
            
            --padding-top-view-list: 20px;
            --app-background: #ECEDEF;
            
            /**********************************************************
                            GLOBAL LAYOUT ELEMENTS
            **********************************************************/
                        
            --paper-badge : {}
            
            --paper-button : {
                background: var(--accent-color);
                background-color: var(--accent-color);
                color: var(--text-primary-color);
            };
            
            --paper-badge : {}
            
            --paper-card : {}
            
            --paper-dropdown-menu : {}
                    
            --paper-icon-button : {}        
                        
            --paper-item : {}
            
            --paper-menu-button : {}
            
            --paper-swatch-picker-icon : {}
            
            --paper-tabs : {
                 background: var(--accent-color);
                 background-color: var(--accent-color);
                 color: var(--text-primary-color);
            }
            
            --paper-toolbar : {
                 background: var(--accent-color);
                 background-color: var(--accent-color);
                 color: var(--text-primary-color);
            }
            
            --paper-tooltip : {
                background-color: var(--dark-primary-color);
                background:  var(--dark-primary-color);
                font-size: 16px;
            }
            
            --paper-listbox: {}
            
            --paper-fab: {}
            
            --app-toolbar: {
                background: var(--default-primary-color);
                background-color: var(--default-primary-color);
                color: var(--text-primary-color);
            }
            
             --app-toolbar: {
                background: var(--default-primary-color);
                background-color: var(--default-primary-color);
                color: var(--text-primary-color);
            }
            
            --paper-icon-button-action: {
                color: var(--text-primary-color);
                background-color: var(--accent-color);
                height: 50px;
                width: 50px;
                border-radius: 100%;
                box-shadow: 0 3px 8px rgba(0,0,0,.23), 0 3px 8px rgba(0,0,0,.16);
            }
            
            --paper-icon-button-menu: {
      
                color: var(--default-primary-color);
            }
            
            --header-view-list: {
                font-size: 18px;                  
            }
            
            --paper-card-container: {
                width: 100%;
                padding: var(--content-padding);
            }
            
            --info-cursor: {
                color: var(--text-primary-color);
                cursor: help;
            }
            
            --application-paper-card-left-content: {
                background-image: url("../../style/icon/placeholder.jpg");
            }
         }

        /*******************************************
                    LAYOUT STYLE
        *******************************************/
        body, html {
            height: 100%;
        }

        body {
            margin: 0;
            font-family: 'Roboto', 'Noto', sans-serif;
            color: var(--primary-text-color);
            background-color: var(--app-background);
        }
                
    </style>
</custom-style>`;

template.setAttribute('style', 'display: none;');
document.head.appendChild(template.content);