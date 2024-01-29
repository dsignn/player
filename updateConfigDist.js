const fs = require('fs');

var globalConfig = {
    "enableFetures": {
        "--enable-accelerated-mjpeg-decode": true,
        "--enable-vulkan": true,
        "--enable-unsafe-webgpu": true,
        "--enable-features": "Vulkan,UseSkiaRenderer,VaapiVideoEncoder,VaapiVideoDecoder,CanvasOopRasterization,WebUIDarkMode",
        "--enable-accelerated-video": "true",
        "--ignore-gpu-blacklist": "true",
        "--enable-native-gpu-memory-buffers": "true",
        "--enable-gpu-rasterization": "true"
    },
    "app": {
        "basePath": "http://127.0.0.1:8081/",
        "moduleRelativePath": "src/module"
    },
    "localize": {
        "defaultLanguage": "it",
        "languages": [
            "it",
            "en"
        ]
    },
    "sender": {
        "ipcProxy": {
            "proxyName": "proxy"
        }
    },
    "storage": {
        "adapter": {
            "mongo": {
                "name": "dsign",
                "uri": "127.0.0.140",
                "port": 27017
            },
            "dexie": {
                "nameDb": "dsign",
                "version": 1
            },
            "localStorage": {
                "namespace": "dsign"
            }
        }
    },
    "module": []
}

/**
 * Read module directory
 */
fs.readdir('./app/module', (err, files) => {
    if (err) {
        console.log(err);
        return;
    }
    else {
    
        for (let cont = 0; files.length > cont; cont++) {
            let config = fs.readFileSync(`./app/module/${files[cont]}/package.json`);            
            globalConfig.module.push(JSON.parse(config.toString()));
        }

        globalConfig.module.sort((first, second) => {
            if( first.sort < second.sort) {
                return -1
            } else {
                1
            }
        });

        fs.writeFile('./app/config/config.json.dist', JSON.stringify(globalConfig, null, '\t'), err => {
            if (err) 
                console.error(err);
            
            console.log('config dist dei moduli aggiornati');
        });


        fs.writeFile('./app/config/config-development.json', JSON.stringify(globalConfig, null, '\t'), err => {
            if (err) 
                console.error(err);
            
            console.log('config development dei moduli aggiornati');
        });
    }
})