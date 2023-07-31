import { Command, InvalidArgumentError } from 'commander'
import { Douyu, Bilibili } from './apis'
import { Huya } from './apis/huya'

const program = new Command()

program
  .name('lsar')
  .description('能够获取斗鱼、B站直播源的命令行工具')
  .version('<<<<>>>>')

const myParseInt = (value: string) => {
  const parsedValue = Number(value)
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('不是一个整数')
  }
  return parsedValue
}

program
  .command('douyu')
  .argument('<roomID>', '目标房间号（支持靓号）', myParseInt)
  .description('解析斗鱼直播源（支持靓号）')
  .action((roomID: number) => {
    const c = new Douyu(roomID)
    c.printLiveLink()
      .then()
      .catch((e) => {
        console.log(e)
      })
  })

interface BiliArg {
  roomID: number
  url?: string
}

program
  .command('bili')
  .description('解析B站直播源。\n可以使用房间ID或房间链接作为传入参数。')
  .option('-r, --roomID <roomID>', '目标房间号', myParseInt, 0)
  .option('-u, --url <pageURL>', '房间页面链接')
  .action((arg: BiliArg) => {
    const c = new Bilibili(arg.roomID, arg.url)
    c.printLiveLink().catch((e) => {
      console.log(e)
    })
  })

type HuyaArg = BiliArg

program
  .command('huya')
  .description('解析虎牙直播源。目前仅支持使用房间号')
  .option('-r, --roomID <roomID>', '目标房间号', myParseInt, 0)
  // .option('-u, --url <pageURL>', '房间页面链接')
  .action((arg: HuyaArg) => {
    const h = new Huya(arg.roomID)
    h.printLiveLink().catch((e) => {
      console.log(e)
    })
  })

program.parse(process.argv)
