
(async () => {
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-icon/iron-icon.js`));
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-iconset-svg/iron-iconset-svg.js`));
    const { html} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/lib/utils/html-tag.js`));

    const template = html`<iron-iconset-svg name="ice-hockey" size="24">
        <svg>
            <defs style="enable-background:new 0 0 511.999 511.999;">
                <g id="menu" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M14.87,13l5.62-9.56-5-1.65L12,8,8.46,1.79,3.51,3.44,9.13,13,7.42,16H2v6H9.57L12,17.87,14.43,22H22V16H16.58Zm1.6-8.79,1,.35L13.72,11l-.57-1ZM8.43,20H4V18H8.58l1.72-3,.54.91ZM20,20H15.57L6.49,4.56l1.05-.35L15.42,18H20Z"/>
                </g>              
                <g id="disk">
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </g>   
                <g id="add-user">
                    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </g>  
                <g id="upload-file">
                    <path d=" M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                </g>           
            </defs>
        </svg>
    </iron-iconset-svg>`;

    document.head.appendChild(template.content);
})()