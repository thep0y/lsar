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
    private isPost = false
    private roomURL: string
    private ub98484234Reg = new RegExp(/var vdwdae325w_64we.*?function ub98484234\(.*?return eval\(strc\)\(.*?\);\}/)

    constructor(rid: number) {
        this.rid = rid
        this.roomURL = 'https://www.douyu.com/' + rid.toString()
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private async get(url: string): Promise<string> {
        logger.debug('GET 正在访问的链接：', url)
        try {
            const resp = await get(url).timeout({
                response: 5000,
                deadline: 60000
            })
            if (resp.statusCode === 200) {
                return resp.text
            } else {
                logger.fatal('状态码不对', resp.statusCode)
            }
        } catch (e) {
            logger.error((e as Error).message)
            return ''
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private async post(url: string, params: string): Promise<string> {
        logger.debug('POST 正在访问的链接：', url, '使用的参数', params)
        try {
            const resp = await post(url).timeout({
                response: 5000,
                deadline: 60000
            }).type('form').send(params)
            if (resp.statusCode === 200) {
                return resp.text
            } else {
                logger.fatal('状态码不对', resp.statusCode)
            }
        } catch (e) {
            logger.error((e as Error).message)
            return ''
        }
    }

    private async getRoomInfo(params: string): Promise<Info | null> {
        let url = ''
        let resp = ''
        if (this.isPost) {
            url = `https://www.douyu.com/lapi/live/getH5Play/${this.rid}`
            resp = await this.post(url, params)
            if (!resp) {
                logger.warn('响应异常，更换 GET 请求重试')
                return null
            }
        } else {
            url = `https://playweb.douyu.com/lapi/live/getH5Play/${this.rid}?${params}`
            resp = await this.get(url)
            if (!resp) {
                logger.warn('响应异常，更换 POST 请求重试')
                return null
            }
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

    private async series() {
        const ts = Math.floor((new Date).getTime() / 1e3)
        const html = await this.getRoomPage()
        const signFunc = this.matchSignFunc(html)
        const params = this.createParams(signFunc, ts)
        const info = await this.getRoomInfo(params)
        return info
    }

    private async getLiveName() {
        /*
            码率或清晰度
                - 900 高清
                - 2000 超清
                - 4000 蓝光 4 M
                - 更高 主播可以自己设置更高的码率，没有固定值，但是可以获取到具体值，使用flv名不加码率时会自动使用最高码率播放
            添加码率后的文件名为 {name}_{bit}.flv 或 {name}_{bit}.xs，
            不添加码率就会播放最高码率
        */
        const info = await this.series()
        let link_name = ''
        if (info) {
            link_name = info.data.rtmp_live.split('?')[0].split('.')[0].split('_')[0]
        } else {
            /*
               斗鱼每个房间获取房间信息的请求方式随机变换，GET 和 POST 都有可能，
               所以这里请求失败时修改
            */
            this.isPost = !this.isPost
            const info = await this.series()
            if (!info) {
                logger.fatal('更换请求方式、生成新请求参数后仍未得到正确响应，请重新运行几次程序')
            } else {
                link_name = info.data.rtmp_live.split('?')[0].split('.')[0].split('_')[0]
            }
        }
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
        console.log(color.gray(x_p2p_link))
        console.log('\n')
    }
}