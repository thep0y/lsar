import * as os from 'os'
import * as fs from 'fs'
import { log } from './logger/logger'

const mainPath = './dist/main.js'

const isWindows = os.platform() == 'win32'

const getVersion = (): string => {
  const content = fs.readFileSync('./package.json')
  const { version } = JSON.parse(content.toString('utf-8')) as {
    version: string
  }
  return version
}

fs.readFile(mainPath, (err, data) => {
  if (err) log.fatal(err)

  const verion = getVersion()

  const content =
    '#!/usr/bin/env node\n' + data.toString().replace('<<<<>>>>', verion)
  fs.writeFile(mainPath, content, (err) => {
    if (err) log.fatal(err)
  })
})

if (!isWindows) {
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
