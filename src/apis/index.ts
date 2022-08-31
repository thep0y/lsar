import { get, post } from 'superagent'
import { Color, Logger, LoggerLevel } from '../logger/logger'

export const color = new Color()
export const logger = new Logger(false, color, process.env.DEBUG === '1' ? LoggerLevel.DEBUG : LoggerLevel.WARN)

export abstract class Base {
  readonly roomID: number
  readonly baseURL: string = ''

  constructor(roomID: number) {
    this.roomID = roomID
  }

  abstract get roomURL(): string

  abstract printLiveLink(): Promise<void>

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async get(url: string): Promise<string> {
    logger.debug('GET 正在访问的链接：', url)
    try {
      const resp = await get(url)
        .set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36 Edg/104.0.1293.70')
        .timeout({
          response: 5000,
          deadline: 60000
        })
      if (resp.statusCode === 200) {
        logger.debug('响应成功')
        return resp.text
      } else {
        logger.fatal('状态码不对', resp.statusCode)
      }
    } catch (e) {
      logger.error('请求出错', (e as Error).message)
      return ''
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async post(url: string, params: string): Promise<string> {
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
      logger.error('请求出错', (e as Error).message)
      return ''
    }
  }
}

export * from './douyu'
export * from './bilibili'