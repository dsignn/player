
(async () => {
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-icon/iron-icon.js`));
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-iconset-svg/iron-iconset-svg.js`));
    const { html} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/lib/utils/html-tag.js`));

    const template = html`<iron-iconset-svg name="soccer" size="24">
        <svg>
            <defs style="enable-background:new 0 0 511.999 511.999;">
                <g id="menu">
                    <path d="M17 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zM5 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
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