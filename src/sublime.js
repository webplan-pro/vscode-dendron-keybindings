let fs = require('fs')

class Sublime {

    isInstalled() {

        return new Promise((resolve, reject) => {

            var paths = {
                darwin: `/Applications/Sublime Text.app`,
                windows: `C:\Program Files (x86)\Sublime Text 3\sublime_text.exe`
            }

            let platformPath = paths[process.platform]

            if(!platformPath) {
                reject(`Platform not supported ${process.platform} yet`)
            }

            fs.stat(platformPath,(err, stats) => {
                if(stats.isFile() || stats.isDirectory()) {
                    resolve();
                } else {
                    reject()
                }
            })

        })

    
    }
}

module.exports = new Sublime()