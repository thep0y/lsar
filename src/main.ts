import { Command, InvalidArgumentError } from "commander";
import { Douyu, Bilibili, Huya, Douyin } from "./apis";
import { fatal } from "./logger";

const program = new Command();

program
  .name("lsar")
  .description("能够获取斗鱼、B站直播源的命令行工具")
  .version("<<<<>>>>");

const myParseInt = (value: string) => {
  const parsedValue = Number(value);
  if (Number.isNaN(parsedValue)) {
    throw new InvalidArgumentError("不是一个整数");
  }
  return parsedValue;
};

program
  .command("douyu")
  .argument("<roomID>", "目标房间号（支持靓号）", myParseInt)
  .description("解析斗鱼直播源（支持靓号）")
  .action((roomID: number) => {
    const c = new Douyu(roomID);
    c.printLiveLink()
      .then()
      .catch((e) => {
        console.log(e);
      });
  });

interface BiliArg {
  roomID: number;
  url?: string;
}

program
  .command("bili")
  .description("解析B站直播源。\n可以使用房间ID或房间链接作为传入参数。")
  .argument("<cookie>", "B站登录后的 cookie，一定要用单引号或双引号包裹。")
  .option("-r, --roomID <roomID>", "目标房间号", myParseInt)
  .option("-u, --url <pageURL>", "房间页面链接。")
  .action((cookie: string, arg: BiliArg) => {
    const c = new Bilibili(cookie, arg.roomID, arg.url);
    c.printLiveLink().catch((e) => {
      console.log(e);
    });
  })
  .exitOverride((e) => {
    if (
      e.code === "commander.missingArgument" &&
      e.message.indexOf("'cookie'") > -1
    ) {
      return fatal("必须传入 cookie");
    }
  });

type HuyaArg = BiliArg;

program
  .command("huya")
  .description("解析虎牙直播源。")
  .option("-r, --roomID <roomID>", "目标房间号", myParseInt)
  .option("-u, --url <pageURL>", "房间页面链接")
  .action((arg: HuyaArg) => {
    if (arg.roomID === undefined && arg.url === undefined) {
      fatal("参数错误，请查阅 -h/--help 以正确传递参数");
    }
    const h = new Huya(arg.roomID, arg.url);
    h.printLiveLink().catch((e) => {
      console.log(e);
    });
  });

program
  .command("douyin")
  .description("解析抖音直播源")
  .argument("<roomID>", "目标房间号", myParseInt)
  .action((roomID: number) => {
    const c = new Douyin(roomID);
    c.printLiveLink()
      .then()
      .catch((e) => {
        console.log(e);
      });
  });

program.parse(process.argv);
