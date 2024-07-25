import { defaultColor as color, info, fatal } from "../../logger";
import { Base } from "..";

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
  fmp4 = "fmp4",
  ts = "ts",
  flv = "flv",
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
  baseURL =
    "https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?protocol=0,1&format=0,1,2&codec=0,1&qn=10000&platform=web&ptype=8&dolby=5&panorama=1&room_id=";
  private readonly pageURL: string = "";

  constructor(roomID: number, url = "") {
    super(roomID ? roomID : 0);

    if (!roomID && !url) {
      fatal("房间号和房间页面链接必需传入一个");
    }

    this.pageURL = url;
  }

  get roomURL(): string {
    return this.baseURL + this.roomID.toString();
  }

  private async parseRoomID() {
    const res = await this.get(this.pageURL, {
      Host: "live.bilibili.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "zh-CN",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      DNT: "1",
      "Sec-GPC": "1",
    });

    let findResult = res.match(/"defaultRoomId":"(\d+)"/);
    if (!findResult) {
      findResult = res.match(/"roomid":(\d+)/);
    }

    if (!findResult) throw Error("未找到房间 id");

    return Number(findResult[1]);
  }

  private async getRoomInfo() {
    if (!this.roomID) {
      this.roomID = await this.parseRoomID();
    }

    const res = await this.get(this.roomURL);
    const body = JSON.parse(res) as Response;
    if (body.code !== 0) {
      fatal(body.message);
    }

    info("已获取到正确响应", res);

    return body;
  }

  async printLiveLink(): Promise<void> {
    const res = await this.getRoomInfo();

    console.log("\n选择下面的任意一条链接，播放失败换其他链接试试：\n");

    for (const s of res.data.playurl_info.playurl.stream) {
      for (const fmt of s.format) {
        if (fmt.format_name !== Format.flv) {
          for (const c of fmt.codec) {
            for (const cdn of c.url_info) {
              if (cdn.host.startsWith("https://d1--cn-")) {
                info('跳过 "https://d1--cn-" 开头的链接');
                return;
              }

              const url = cdn.host + c.base_url;
              console.log(
                color.gray(url.indexOf("?") ? url.split("?", 2)[0] : url),
                "\n",
              );
            }
          }
        } else {
          info("跳过 flv");
        }
      }
    }
  }
}
