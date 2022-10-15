import { createHash } from 'crypto'
import { DOUYU_PREFIXS } from '../lib/consts'
import { Base, color, logger } from '.'

const did = '10000000000000000000000000001501'

interface Info {
  error?: number;
  msg: string;
  data: {
    rtmp_live: string;
  };
}

export class Douyu extends Base {
  private isPost = false
  private ub98484234Reg = new RegExp(
    /var vdwdae325w_64we.*?function ub98484234\(.*?return eval\(strc\)\(.*?\);\}/
  )
  baseURL = 'https://www.douyu.com/'

  get roomURL(): string {
    return this.baseURL + this.roomID.toString()
  }

  private async getRoomInfo(params: string): Promise<Info | null> {
    let url = ''
    let resp = ''
    if (this.isPost) {
      url = `https://www.douyu.com/lapi/live/getH5Play/${this.roomID}`
      resp = await this.post(url, params)
      if (!resp) {
        logger.warn('响应异常，更换 GET 请求重试')
        return null
      }
    } else {
      url = `https://playweb.douyu.com/lapi/live/getH5Play/${this.roomID}?${params}`
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
    signFunc = signFunc + `(${this.roomID},"${did}",${ts})`
    return eval(signFunc) as string
  }

  private matchSignFunc(html: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const matchResult = html.match(this.ub98484234Reg)!
    let ub98484234 = matchResult[0]
    ub98484234 = ub98484234.replace(/eval\(strc\)\(\w+,\w+,.\w+\);/, 'strc;')
    const ts = Math.floor(new Date().getTime() / 1e3)
    const ub98484234Call = `ub98484234(${this.roomID}, ${did}, ${ts})`
    let signFunc = ''
    try {
      signFunc = eval(ub98484234 + ub98484234Call) as string
    } catch (e) {
      const slices = (e as Error).message.split(' ')
      if (slices[slices.length - 1] === 'defined') {
        const lossStr = `/var ${slices[0]}=.*?];/`
        const lossReg = new RegExp(eval(lossStr) as string)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const matchResult = html.match(lossReg)!
        signFunc = eval(ub98484234 + matchResult[0] + ub98484234Call) as string
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const v = signFunc.match(/\w{12}/)!
    const hash = createHash('md5')
    hash.update(`${this.roomID}${did}${ts}${v[0]}`)
    const md5 = hash.digest('hex')
    signFunc = signFunc.replace(
      /CryptoJS\.MD5\(cb\)\.toString\(\)/,
      `"${md5}"`
    )
    signFunc = signFunc.split('return rt;})')[0] + 'return rt;})'
    logger.debug(signFunc)
    return signFunc
  }

  private async series() {
    const ts = Math.floor(new Date().getTime() / 1e3)
    const html = await this.getRoomPage()

    const r = html.match(/\?room_id=(\d+)/)
    if (r) {
      this.roomID = Number(r[1])
    }

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
      if (info.data.rtmp_live == undefined) {
        logger.fatal(`${this.roomID} 房间未开播`)
      }
      link_name = info.data.rtmp_live.split('?')[0].split('.')[0].split('_')[0]
    } else {
      /*
               斗鱼每个房间获取房间信息的请求方式随机变换，GET 和 POST 都有可能，
               所以这里请求失败时修改，但也只修改一次请求方式，如果仍失败就需要重新执行
            */
      this.isPost = !this.isPost
      const info = await this.series()
      if (!info) {
        logger.fatal(
          '更换请求方式、生成新请求参数后仍未得到正确响应，请重新运行几次程序'
        )
      } else {
        if (info.data.rtmp_live == undefined) {
          logger.fatal(`${this.roomID} 房间未开播`)
        }
        link_name = info.data.rtmp_live
          .split('?')[0]
          .split('.')[0]
          .split('_')[0]
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

    console.log('\n选择下面的任意一条链接，播放失败换其他链接试试：\n')

    DOUYU_PREFIXS.forEach((v) => {
      const flv_link = `http://${v}.douyucdn.cn/live/${name}.flv`
      console.log(color.gray(flv_link), '\n')
    })
  }
}
