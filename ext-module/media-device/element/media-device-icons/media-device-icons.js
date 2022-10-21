 
(async () => {   
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-icon/iron-icon.js`));
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-iconset-svg/iron-iconset-svg.js`));
    const { html} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/lib/utils/html-tag.js`));

    const template = html`<iron-iconset-svg name="media-device" size="24">
        <svg>
            <defs>
                <g id="menu"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></g>       
            </defs>
        </svg>
    </iron-iconset-svg>`;
    
    document.head.appendChild(template.content);
})()