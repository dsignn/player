/**
 * @param env
 * @returns {string}
 */
export const getHomeDir = (env) => {

    if (!env.HOME) {
        throw 'Dont set home directory in environment object';
    }

    if (!env.npm_package_name) {
        throw 'Dont set the name in the package json';
    }

    let directory;
    const os = require('os');
    const path = require('path');

    switch (os.type()) {
        case 'Linux':
            directory = `${env.HOME}${path.sep}.config${path.sep}${env.npm_package_name}`;
            break;
        case 'Darwin':
            directory = `${env.HOME}${path.sep}Library${path.sep}Application Support${path.sep}${env.npm_package_name}`;
            break;
        case 'Window_NT':
            directory = `${env.HOME}${path.sep}AppData${path.sep}Local${path.sep}${env.npm_package_name}`;
            break;
    }

    return directory;
}
