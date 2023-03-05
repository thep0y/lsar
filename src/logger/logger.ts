/**
 * 彩色文字
 */
export class Color {
  private base(code: number, msg: string): string {
    return `\u001B[${code}m${msg}\u001B[39m`
  }
  cyan(msg: string): string {
    return this.base(36, msg)
  }

  green(msg: string): string {
    return this.base(32, msg)
  }

  gray(msg: string): string {
    return this.base(90, msg)
  }

  red(msg: string): string {
    return this.base(31, msg)
  }

  yellow(msg: string): string {
    return this.base(33, msg)
  }

  purple(msg: string): string {
    return this.base(35, msg)
  }
}

export enum LoggerLevel {
  TRACE = 1,
  DEBUG,
  INFO,
  WARNING,
  ERROR,
  FATAL,
}

type T = string | number | Error | object

const isDebug = () => {
  const debug = process.env.DEBUG

  if (!debug) {
    return false
  }

  if (debug === '1' || debug.toLowerCase() === 'true') {
    return true
  }

  return false
}

/**
 * 彩色日志
 */
export class Logger {
  private color: Color
  private addDate = false
  private level: LoggerLevel
  private prefixes: Record<LoggerLevel, string>

  constructor(addDate = false, color = new Color(), level = LoggerLevel.WARNING) {
    this.addDate = addDate
    this.color = color
    if (isDebug()) {
      this.level = LoggerLevel.DEBUG
    } else {
      this.level = level
    }

    this.prefixes = {
      1: this.color.gray('TRC'),
      2: this.color.purple('DEB'),
      3: this.color.green('INF'),
      4: this.color.yellow('WAR'),
      5: this.color.red('ERR'),
      6: this.color.red('FAT')
    }
  }

  private _time(): string {
    if (this.addDate) {
      return this.datetime()
    }
    return this.time()
  }

  private datetime(): string {
    const now = new Date(Date.now())

    let mon: string | number = now.getMonth()
    let date: string | number = now.getDate()
    let hour: string | number = now.getHours()
    let min: string | number = now.getMinutes()
    let sec: string | number = now.getSeconds()
    mon = mon < 10 ? '0' + mon.toString() : mon
    date = date < 10 ? '0' + date.toString() : date
    hour = hour < 10 ? '0' + hour.toString() : hour
    min = min < 10 ? '0' + min.toString() : min
    sec = sec < 10 ? '0' + sec.toString() : sec

    return this.color.gray(`${now.getFullYear()}-${mon}-${date} ${hour}:${min}:${sec}`)
  }

  private time(): string {
    const now = new Date(Date.now())

    let hour: string | number = now.getHours()
    let min: string | number = now.getMinutes()
    let sec: string | number = now.getSeconds()
    let mils: string | number = now.getMilliseconds()
    hour = hour < 10 ? '0' + hour.toString() : hour
    min = min < 10 ? '0' + min.toString() : min
    sec = sec < 10 ? '0' + sec.toString() : sec
    mils = mils < 100 ? mils < 10 ? '00' + mils.toString() : '0' + mils.toString() : mils

    return this.color.gray(`${hour}:${min}:${sec}.${mils}`)
  }

  private mergeMsgs(msg: string, msgs: T[]): string {
    msgs.forEach(v => {
      msg += ' ' + v.toString()
    })
    return msg
  }

  private baseMsg(level: LoggerLevel): string {
    return `${this._time()} ${this.prefixes[level]} ${this.color.cyan('>')}`
  }

  trace(...msgs: T[]) {
    if (LoggerLevel.TRACE >= this.level) {
      console.log(this.mergeMsgs(this.baseMsg(LoggerLevel.TRACE), msgs))
    }
  }

  debug(...msgs: T[]) {
    if (LoggerLevel.DEBUG >= this.level) {
      console.log(this.mergeMsgs(this.baseMsg(LoggerLevel.DEBUG), msgs))
    }
  }

  info(...msgs: T[]) {
    if (LoggerLevel.INFO >= this.level) {
      console.log(this.mergeMsgs(this.baseMsg(LoggerLevel.INFO), msgs))
    }
  }

  error(...msgs: T[]) {
    if (LoggerLevel.ERROR >= this.level) {
      console.log(this.mergeMsgs(this.baseMsg(LoggerLevel.ERROR), msgs))
    }
  }

  warn(...msgs: T[]) {
    if (LoggerLevel.WARNING >= this.level) {
      console.log(this.mergeMsgs(this.baseMsg(LoggerLevel.WARNING), msgs))
    }
  }

  fatal(...msgs: T[]): never {
    console.log(this.mergeMsgs(this.baseMsg(LoggerLevel.FATAL), msgs))
    return process.exit(1)
  }
}

export const log = new Logger()
