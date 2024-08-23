import { defaultColor as color, info, fatal, debug } from "../../logger";
import { Base } from "..";

interface CDNItem {
  host: string;
  extra: string;
}

interface CodecItem {
  accept_qn: number[];
  base_url: string;
  current_qn: number;
  url_info: CDNItem[];
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

interface VerifyFailedResult {
  code: -101;
  message: string;
  data: {
    isLogin: false;
  };
}

interface VerifySuccessResult {
  code: 0;
  message: string;
  data: {
    isLogin: boolean;
    uname: string;
  };
}

type VerifyResult = VerifyFailedResult | VerifySuccessResult;

export class Bilibili extends Base {
  baseURL =
    "https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?protocol=0,1&format=0,1,2&codec=0,1&qn=10000&platform=web&ptype=8&dolby=5&panorama=1&room_id=";
  private readonly pageURL: string = "";
  private cookie: string;

  constructor(cookie: string, roomID?: number, url = "") {
    super(roomID ? roomID : 0);

    if (!roomID && !url) {
      fatal("房间号和房间页面链接必需传入一个");
    }

    this.pageURL = url;
    this.cookie = cookie;
  }

  get roomURL(): string {
    return this.baseURL + this.roomID.toString();
  }

  private async verifyCookie() {
    debug("验证 cookie");
    const url = "https://api.bilibili.com/x/web-interface/nav";
    const resp = await this.get(url, { cookie: this.cookie });
    const data: VerifyResult = await resp.json();
    if (data.code !== 0) {
      return fatal(data.message);
    }

    const { uname } = data.data;

    return uname;
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
    const html = await res.text();

    let findResult = html.match(/"defaultRoomId":"(\d+)"/);
    if (!findResult) {
      findResult = html.match(/"roomid":(\d+)/);
    }

    if (!findResult) throw Error("未找到房间 id");

    return Number(findResult[1]);
  }

  private async getRoomInfo() {
    if (!this.roomID) {
      this.roomID = await this.parseRoomID();
    }

    const res = await this.get(this.roomURL, { cookie: this.cookie });
    const body = (await res.json()) as Response;
    if (body.code !== 0) {
      fatal(body.message);
    }

    info("已获取到正确响应");

    return body;
  }

  async printLiveLink(): Promise<void> {
    const username = await this.verifyCookie();
    info("验证成功，登录的用户:", username);

    const res = await this.getRoomInfo();

    console.log("\n选择下面的任意一条链接，播放失败换其他链接试试：\n");

    for (const s of res.data.playurl_info.playurl.stream) {
      for (const fmt of s.format) {
        for (const c of fmt.codec) {
          for (const cdn of c.url_info) {
            const url = cdn.host + c.base_url + cdn.extra;
            console.log(color.gray(url), "\n");
          }
        }
      }
    }
  }
}
