

(async () => {
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-icon/iron-icon.js`));
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-iconset-svg/iron-iconset-svg.js`));
    const { html} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/lib/utils/html-tag.js`));


    const template = html`<iron-iconset-svg name="hello-word" size="24">
        <svg>
            <defs style="enable-background:new 0 0 511.999 511.999;">
                <g id="menu">
                    <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
                </g>              
            </defs>
        </svg>
    </iron-iconset-svg>`;

    document.head.appendChild(template.content);
})()

