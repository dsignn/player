 
(async () => {   
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-icon/iron-icon.js`));
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-iconset-svg/iron-iconset-svg.js`));
    const { html} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/lib/utils/html-tag.js`));


    const template = html`
    <iron-iconset-svg name="playlist" size="24">
        <svg>
            <defs>
            <g id="menu"><path d="M19,9H2V11H19V9M19,5H2V7H19V5M2,15H15V13H2V15M17,13V19L22,16L17,13Z"/></g>       
            </defs>
        </svg>
    </iron-iconset-svg>`;

    document.head.appendChild(template.content);
})()