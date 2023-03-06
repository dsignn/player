
(async () => {
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-icon/iron-icon.js`));
    await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/iron-iconset-svg/iron-iconset-svg.js`));
    const { html } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/lib/utils/html-tag.js`));

    const template = html`<iron-iconset-svg name="soccer" size="24">
        <svg>
            <defs style="enable-background:new 0 0 511.999 511.999;">

                <g id="menu"  viewBox="0 0 32 32" width="24" height="24">
                    <path d="M22,27c2.206,0,4-1.794,4-4s-1.794-4-4-4s-4,1.794-4,4S19.794,27,22,27z M22,21c1.103,0,2,0.897,2,2s-0.897,2-2,2    s-2-0.897-2-2S20.897,21,22,21z"/><path d="M30.923,1.618c-0.102-0.245-0.296-0.439-0.541-0.541C30.26,1.026,30.13,1,30,1H2C1.87,1,1.74,1.026,1.618,1.077    C1.373,1.179,1.179,1.374,1.077,1.618C1.026,1.74,1,1.87,1,2v20c0,0.44,0.288,0.83,0.71,0.957c0.42,0.128,0.878-0.036,1.122-0.402    L6.535,17h18.93l3.703,5.555C29.356,22.838,29.672,23,30,23c0.097,0,0.194-0.014,0.29-0.043C30.712,22.83,31,22.44,31,22V2    C31,1.87,30.974,1.74,30.923,1.618z M13,7v1h-2V7H13z M17,7v1h-2V7H17z M21,7v1h-2V7H21z M25,7v1h-2V7H25z M17,10v2h-2v-2H17z     M9,8H7V7h2V8z M7,10h2v2H7V10z M11,10h2v2h-2V10z M13,14v1h-2v-1H13z M15,14h2v1h-2V14z M19,14h2v1h-2V14z M19,12v-2h2v2H19z     M23,10h2v2h-2V10z M25.586,5H6.414l-2-2h23.172L25.586,5z M3,4.414l2,2v9.283l-2,3V4.414z M7,14h2v1H7V14z M23,15v-1h2v1H23z     M27,15.697V6.414l2-2v14.283L27,15.697z"/><path d="M30,29h-8c-0.553,0-1,0.448-1,1s0.447,1,1,1h8c0.553,0,1-0.448,1-1S30.553,29,30,29z"/><path d="M19,29h-2c-0.553,0-1,0.448-1,1s0.447,1,1,1h2c0.553,0,1-0.448,1-1S19.553,29,19,29z"/><path d="M14,29H2c-0.553,0-1,0.448-1,1s0.447,1,1,1h12c0.553,0,1-0.448,1-1S14.553,29,14,29z"/>
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
                <g id="holder" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                </g>
                <g id="bench-right" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
                </g>
                <g id="bench-left" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
                </g>
                <g id="rostrum" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/>
                </g>
                <g id="yellow-card" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                </g>
                <g id="double-yellow-card" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none"/><path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z"/>
                </g>
                <g id="red-card" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                </g>
                <g id="ball" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none"/><path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
                </g>
                <g id="replace" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none"/><path d="M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z"/>
                </g>
                <g id="replace-out" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/>
                </g>
                <g id="replace-in" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/><path d="M0 0h24v24H0z" fill="none"/>
                </g>     
            </defs>
        </svg>
    </iron-iconset-svg>`;

    document.head.appendChild(template.content);
})()