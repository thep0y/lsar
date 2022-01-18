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
    DEBUG = 1,
    INFO,
    WARN,
    ERROR,
    FATAL,
}

type T = string | number | Error | object

/**
 * 彩色日志
 */
export class Logger {
    private color: Color
    private addDate = false
    private level: LoggerLevel

    constructor(addDate = false, color = new Color(), level = LoggerLevel.WARN) {
        this.addDate = addDate
        this.color = color
        this.level = level
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

    debug(...msgs: T[]) {
        if (LoggerLevel.DEBUG >= this.level) {
            const msg = `${this._time()} [${this.color.purple('DEBUG')}]`
            console.log(this.mergeMsgs(msg, msgs))
        }
    }

    info(...msgs: T[]) {
        if (LoggerLevel.INFO >= this.level) {
            const msg = `${this._time()} [${this.color.green('INFO')}]`
            console.log(this.mergeMsgs(msg, msgs))
        }
    }

    error(...msgs: T[]) {
        if (LoggerLevel.ERROR >= this.level) {
            const msg = `${this._time()} [${this.color.red('ERROR')}]`
            console.log(this.mergeMsgs(msg, msgs))
        }
    }

    warn(...msgs: T[]) {
        if (LoggerLevel.WARN >= this.level) {
            const msg = `${this._time()} [${this.color.yellow('WARNING')}]`
            console.log(this.mergeMsgs(msg, msgs))
        }
    }

    fatal(...msgs: T[]) {
        const msg = `${this._time()} [${this.color.red('FATAL')}]`
        console.log(this.mergeMsgs(msg, msgs))
        process.exit(1)
    }
}