import { Command, InvalidArgumentError } from 'commander'
import { Douyu, Bilibili } from './apis'

console.log(process.argv)

const program = new Command()

program
  .name('直播源解析')
  .description('能够获取斗鱼、B站直播源的命令行工具')
  .version('1.0.3')

const myParseInt = (value: string) => {
  console.log(value)
  const parsedValue = Number(value)
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('不是一个整数')
  }
  return parsedValue
}

program
  .command('douyu')
  .argument('<roomID>', '目标房间号', myParseInt)
  .description('解析斗鱼直播源')
  .action((roomID: number) => {
    const c = new Douyu(roomID)
    c.printLiveLink().then().catch((e) => {
      console.log(e)
    })
  })

interface BiliArg {
    roomID: number;
    url?: string;
}

program
  .command('bili')
  .description('解析B站直播源。\n可以使用房间ID或房间链接作为传入参数。')
  .option('-r, --roomID <roomID>', '目标房间号', myParseInt, 0)
  .option('-u, --url <pageURL>', '房间页面链接')
  .action((arg: BiliArg) => {
    const c = new Bilibili(arg.roomID, arg.url?.split('?')[0])
    c.printLiveLink().catch((e) => {
      console.log(e)
    })
  })

program.parse(process.argv)

// if (process.argv.length < 3) {
//     console.log('需要传入房间号')
// } else {
//     const roomID = process.argv.slice(2)[0]
//     const c = new Douyu(parseInt(roomID))
//     c.printLiveLink().then().catch((e) => {
//         console.log(e)
//     })
// }