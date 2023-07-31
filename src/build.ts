import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'
import * as UglifyJS from 'uglify-js'
import { Logger, LoggerLevel } from './logger/logger'

const log = new Logger({ level: LoggerLevel.DEBUG })

const mainPath = './dist/main.js'

const isWindows = os.platform() == 'win32'

const getVersion = (): string => {
  const content = fs.readFileSync('./package.json')
  const { version } = JSON.parse(content.toString('utf-8')) as {
    version: string
  }
  return version
}

const distDir = './dist'

// const clearFiles = () => {
//   const jsFiles = fs.readdirSync(distDir)
//   jsFiles.forEach((v) => {
//     fs.unlinkSync(path.join(distDir, v))
//   })
// }

const ujOptions = {
  mangle: {
    toplevel: true,
  },
  nameCache: {},
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

const getAllJsFiles = () => {
  const jsFiles: string[] = []

  const traverseDir = (dirPath: string) => {
    const files = fs.readdirSync(dirPath)

    files.forEach((file) => {
      const filePath = path.join(dirPath, file)
      const stat = fs.statSync(filePath)

      if (stat.isFile() && path.extname(filePath) === '.js') {
        jsFiles.push(filePath)
      } else if (stat.isDirectory()) {
        traverseDir(filePath)
      }
    })
  }

  traverseDir(distDir)

  return jsFiles
}

const jsFiles = getAllJsFiles()
log.info('dist 目录文件', jsFiles)

const getContent = (file: string) => {
  return UglifyJS.minify(fs.readFileSync(file, 'utf-8'), ujOptions).code
}

jsFiles.forEach((file) => {
  if (file.endsWith('build.js')) return

  const code = getContent(file)

  fs.writeFile(file, code, 'utf-8', (err) => {
    if (err) log.error(err)
  })
})

fs.unlinkSync(path.join(distDir, 'build.js'))
