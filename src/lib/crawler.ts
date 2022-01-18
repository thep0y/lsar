import { get, post } from 'superagent'
import { createHash } from 'crypto'
import { Color, Logger } from '../logger/logger'

const did = '10000000000000000000000000001501'

const color = new Color()
const logger = new Logger(false, color)

interface Info {
    data: {
        rtmp_live: string
    }
}

export class Crawler {
    private rid: number
    private isLiangHao: boolean
    private roomURL: string
    private ub98484234Reg = new RegExp(/var vdwdae325w_64we.*?function ub98484234\(.*?return eval\(strc\)\(.*?\);\}/)
    // private ub98484234Reg = new RegExp(/function ub98484234.*?function q7cad0d5d91/)

    constructor(rid: number, isLiangHao = false, roomURL = '') {
        this.rid = rid
        this.isLiangHao = isLiangHao
        if (this.isLiangHao) {
            if (!roomURL) {
                logger.fatal('靓号房间需要输入链接，因为在不同的区可能会存在相同的靓号，故而无法正确解析')
            }
            this.roomURL = roomURL
        } else {
            this.roomURL = 'https://www.douyu.com/' + rid.toString()
        }
    }

    private async get(url: string) {
        logger.debug('GET 正在访问的链接：', url)
        const resp = await get(url).timeout({
            response: 5000,
            deadline: 60000
        })
        if (resp.statusCode === 200) {
            return resp.text
        } else {
            console.log(resp.statusCode)
            throw '状态码不对'
        }
    }

    private async post(url: string, params: string) {
        const resp = await post(url).timeout({
            response: 5000,
            deadline: 60000
        }).type('form').send(params)
        if (resp.statusCode === 200) {
            return resp.text
        } else {
            console.log(resp.statusCode)
            throw '状态码不对'
        }
    }

    private async getRoomInfo(params: string) {
        let url = ''
        let resp = ''
        if (this.isLiangHao) {
            url = `https://www.douyu.com/lapi/live/getH5Play/${this.rid}`
            resp = await this.post(url, params)
        } else {
            url = `https://playweb.douyu.com/lapi/live/getH5Play/${this.rid}?${params}`
            resp = await this.get(url)
        }
        const info = JSON.parse(resp) as Info
        return info
    }

    private createParams(signFunc: string, ts: number): string {
        signFunc = signFunc + `(${this.rid},"${did}",${ts})`
        return eval(signFunc) as string
    }

    private matchSignFunc(html: string) {
        const matchResult = html.match(this.ub98484234Reg)!
        let ub98484234 = matchResult[0]
        ub98484234 = ub98484234.replace(/eval\(strc\)\(\w+,\w+,.\w+\);/, 'strc;')
        const ts = Math.floor((new Date).getTime() / 1e3)
        const ub98484234Call = `ub98484234(${this.rid}, ${did}, ${ts})`
        let signFunc = ''
        try {
            signFunc = eval(ub98484234 + ub98484234Call) as string
        } catch (e) {
            const slices = (e as Error).message.split(' ')
            if (slices[slices.length - 1] === 'defined') {
                const lossStr = `/var ${slices[0]}=.*?];/`
                const lossReg = new RegExp(eval(lossStr) as string)
                const matchResult = html.match(lossReg)!
                signFunc = eval(ub98484234 + matchResult[0] + ub98484234Call) as string
            }
        }
        const v = signFunc.match(/\w{12}/)!
        const hash = createHash('md5')
        hash.update(`${this.rid}${did}${ts}${v[0]}`)
        const md5 = hash.digest('hex')
        signFunc = signFunc.replace(/CryptoJS\.MD5\(cb\)\.toString\(\)/, `"${md5}"`)
        signFunc = signFunc.split('return rt;})')[0] + 'return rt;})'
        logger.debug(signFunc)
        return signFunc
    }

    private async getLiveName() {
        const ts = Math.floor((new Date).getTime() / 1e3)
        const html = await this.getRoomPage()
        const signFunc = this.matchSignFunc(html)
        const params = this.createParams(signFunc, ts)
        const info = await this.getRoomInfo(params)
        console.log(info)
        const link_name = info.data.rtmp_live.split('?')[0].split('.')[0].split('_')[0]
        return link_name
    }

    private async getRoomPage() {
        logger.debug('当前房间链接：', this.roomURL)
        return await this.get(this.roomURL)
    }

    async printLiveLink(): Promise<void> {
        const name = await this.getLiveName()
        const flv_link = `http://dyscdnali1.douyucdn.cn/live/${name}.flv`
        const x_p2p_link = `http://tx2play1.douyucdn.cn/live/${name}.xs`

        console.log('\n')
        console.log(color.yellow('flv'), '链接：')
        console.log(color.gray(flv_link), '\n')
        console.log(color.yellow('x-p2p'), '链接：')
        console.log(color.gray(x_p2p_link), '\n')
    }
}