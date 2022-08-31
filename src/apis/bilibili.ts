import { Base, color, logger } from '.'

interface CDNItem {
    host: string;
}

interface CodecItem {
    accept_qn: number[];
    base_url: string;
    current_qn: number;
    url_info: CDNItem[];
}

enum Format {
    fmp4 = 'fmp4',
    ts = 'ts',
    flv = 'flv'
}

interface FormatItem {
    codec: CodecItem[];
    format_name: string;
}

interface StreamItem {
    format: FormatItem[];
}

interface Response {
    code: number;
    message: string;
    data: {
        playurl_info: {
            playurl: {
                stream: StreamItem[];
            };
        };
    };
}

export class Bilibili extends Base {
  baseURL = 'https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?protocol=0,1&format=0,1,2&codec=0,1&qn=10000&platform=web&ptype=8&dolby=5&panorama=1&room_id='
  private readonly pageURL?: string

  constructor (roomID: number, url?: string) {
    super(roomID ? roomID : 0)

    if (!roomID && !url) {
      logger.fatal('房间号和房间页面链接必需传入一个')
    }

    this.pageURL = url
  }

  get roomURL(): string {
    return this.baseURL + this.roomID.toString()
  }

  private async parseRoomID() {
    const res = await this.get(this.pageURL!)
    console.log(res)
  }

  private async getRoomInfo() {
    if (!this.roomID) {
      await this.parseRoomID()
      return
    }

    const res = await this.get(this.roomURL)
    const body = JSON.parse(res) as Response
    if (body.code !== 0) {
      throw Error(body.message)
    }

    logger.info('已获取到正确响应')

    return body
  }

  async printLiveLink(): Promise<void> {
    const res = await this.getRoomInfo()

    console.log('\n选择下面的任意一条链接，播放失败换其他链接试试：\n')

    // res.data.playurl_info.playurl.stream.forEach(s => {
    //   s.format.forEach(fmt => {
    //     if (fmt.format_name !== Format.flv) {
    //       fmt.codec.forEach(c => {
    //         c.url_info.forEach(cdn => {
    //           if (cdn.host.startsWith('https://d1--cn-')) {
    //             logger.info('跳过 "https://d1--cn-" 开头的链接')
    //             return
    //           }

    //           const url = cdn.host + c.base_url
    //           url.indexOf('?')
    //           console.log(color.gray(url.indexOf('?') ? url.split('?', 2)[0] : url), '\n')
    //         })
    //       })
    //     } else {
    //       logger.info('跳过 flv')
    //     }
    //   })
    // })
  }
}