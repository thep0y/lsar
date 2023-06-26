import { get, post, SuperAgentRequest } from 'superagent'
import {
  trace,
  debug,
  error,
  fatal,
  defaultColor as color,
} from '../logger/logger'

export abstract class Base {
  roomID: number
  readonly baseURL: string = ''

  constructor(roomID: number) {
    this.roomID = roomID
  }

  abstract get roomURL(): string

  abstract printLiveLink(): Promise<void>

  async request(req: SuperAgentRequest): Promise<string> {
    try {
      const resp = await req

      const respHeader = JSON.stringify(resp.headers)
      trace('响应头', respHeader)

      if (resp.statusCode === 200) {
        debug('响应成功，状态码 200')
        trace('响应体：', resp.text)
        return resp.text
      } else {
        return fatal('状态码不对', resp.statusCode)
      }
    } catch (e) {
      error('请求出错', (e as Error).message)
      return ''
    }
  }

  async get(url: string, headers?: { [key: string]: string }): Promise<string> {
    debug('GET 正在访问的链接：', url)

    let req = get(url)
    if (headers) {
      for (const k in headers) {
        req = req.set(k, headers[k])
      }
    }

    return await this.request(
      req.timeout({
        response: 5000,
        deadline: 60000,
      })
    )
  }

  async post(url: string, params: string): Promise<string> {
    debug('POST 正在访问的链接：', url, '使用的参数', params)
    return await this.request(
      post(url)
        .timeout({
          response: 5000,
          deadline: 60000,
        })
        .type('form')
        .send(params)
    )
  }
}

interface Link {
  link: string
  tooltip?: string
  suffix?: string
}

export const printLink = ({ link, tooltip, suffix }: Link) => {
  if (typeof tooltip === 'string') console.log(tooltip)

  console.log(color.gray(link))

  if (typeof suffix === 'string') console.log(suffix)
}

export * from './douyu'
export * from './bilibili'
