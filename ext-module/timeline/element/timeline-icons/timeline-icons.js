(async () => {  

    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-icon/iron-icon.js`));
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-iconset-svg/iron-iconset-svg.js`));
    const { html} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/lib/utils/html-tag.js`));

    const template = html`
    <iron-iconset-svg name="timeline" size="24">
        <svg>
            <defs>
                <path id="menu" clip-path="url(#b)" d="M23 8c0 1.1-.9 2-2 2-.18 0-.35-.02-.51-.07l-3.56 3.55c.05.16.07.34.07.52 0 1.1-.9 2-2 2s-2-.9-2-2c0-.18.02-.36.07-.52l-2.55-2.55c-.16.05-.34.07-.52.07s-.36-.02-.52-.07l-4.55 4.56c.05.16.07.33.07.51 0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.18 0 .35.02.51.07l4.56-4.55C8.02 9.36 8 9.18 8 9c0-1.1.9-2 2-2s2 .9 2 2c0 .18-.02.36-.07.52l2.55 2.55c.16-.05.34-.07.52-.07s.36.02.52.07l3.55-3.56C19.02 8.35 19 8.18 19 8c0-1.1.9-2 2-2s2 .9 2 2z"/>
                <g id="list"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/><path d="M0 0h24v24H0z" fill="none"/></g>
                <g id="delete"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M6 21h12V7H6v14zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></g>
            </defs>
        </svg>
    </iron-iconset-svg name="timeline">`;

    document.head.appendChild(template.content);
})()
