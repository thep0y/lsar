import { get, post, SuperAgentRequest } from 'superagent'
import { Color, Logger } from '../logger/logger'

export const color = new Color()
export const logger = new Logger(false, color)

export abstract class Base {
  roomID: number
  readonly baseURL: string = ''

  constructor(roomID: number) {
    this.roomID = roomID
  }

  abstract get roomURL(): string;

  abstract printLiveLink(): Promise<void>;

  async request(req: SuperAgentRequest): Promise<string> {
    try {
      const resp = await req

      const respHeader = JSON.stringify(resp.headers)
      logger.trace('响应头', respHeader)

      if (resp.statusCode === 200) {
        logger.debug('响应成功，状态码 200')
        logger.trace('响应体：', resp.text)
        return resp.text
      } else {
        return logger.fatal('状态码不对', resp.statusCode)
      }
    } catch (e) {
      logger.error('请求出错', (e as Error).message)
      return ''
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async get(url: string, headers?: { [key: string]: string }): Promise<string> {
    logger.debug('GET 正在访问的链接：', url)

    let req = get(url)
    if (headers) {
      for (const k in headers) {
        req = req.set(k, headers[k])
      }
    }

    return await this.request(req.timeout({
      response: 5000,
      deadline: 60000
    }))
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async post(url: string, params: string): Promise<string> {
    logger.debug('POST 正在访问的链接：', url, '使用的参数', params)
    return await this.request(post(url)
      .timeout({
        response: 5000,
        deadline: 60000
      })
      .type('form')
      .send(params))
  }
}

export * from './douyu'
export * from './bilibili'
