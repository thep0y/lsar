import * as os from 'os'
import * as fs from 'fs'
import { log } from './logger/logger'

const mainPath = './dist/main.js'

const isLinux = os.platform() == 'linux'

fs.readFile(mainPath, (err, data) => {
    if (err) log.fatal(err)

    const content = '#!/usr/bin/env node\n' + data.toString()
    fs.writeFile(mainPath, content, (err) => {
        if (err) log.fatal(err)
    })
})

if (isLinux) {
    fs.open(mainPath, 'r', (err, fd) => {
        if (err) log.fatal(err)

        fs.fstat(fd, (err, stats) => {
            if (err) log.fatal(err)
            log.debug('原权限', stats.mode)
            fs.fchmod(fd, '0755', (err) => {
                if (err) log.fatal(err)
            })
        })

    })
}