import { createHash } from "node:crypto";
import { CDNS, DOUYU_PROXY } from "./consts";
import { trace, debug, info, warn, error, fatal } from "../../logger";
import { Base, printLink } from "..";

const did = "10000000000000000000000000001501";

interface Info {
  error?: number;
  msg: string;
  data: {
    rtmp_url: string;
    rtmp_live?: string;
  };
}

interface MobileResponse {
  error: number;
  msg: string;
  data: {
    url: string;
  };
}

const infoString = (info: Info): string => {
  const {
    error,
    msg,
    data: { rtmp_url, rtmp_live },
  } = info;
  return JSON.stringify({
    error,
    msg,
    rtmp_url,
    rtmp_live,
  });
};

const NOT_LIVING_STATE = "房间未开播";
const INVALID_REQUEST = "非法请求";

export class Douyu extends Base {
  private isPost = true;
  private ub98484234Reg = new RegExp(
    /var vdwdae325w_64we.*?function ub98484234\(.*?return eval\(strc\)\(.*?\);\}/,
  );
  private finalRoomID = 0;
  private signFunc = "";

  baseURL = "https://www.douyu.com/";

  get roomURL(): string {
    return this.baseURL + this.roomID.toString();
  }

  private async getRoomInfo(params: string): Promise<Info | null> {
    let url = "";
    let resp = "";
    if (this.isPost) {
      url = `https://www.douyu.com/lapi/live/getH5Play/${this.finalRoomID}`;
      resp = await this.post(url, params);
      if (!resp) {
        warn("POST 请求未功能获得响应，更换 GET 请求重试");
        return null;
      }
    } else {
      url = `https://playweb.douyu.com/lapi/live/getH5Play/${this.finalRoomID}?${params}`;
      resp = await this.get(url);
      if (!resp) {
        warn("GET 请求未功能获得响应，更换 POST 请求重试");
        return null;
      }
    }

    const info = JSON.parse(resp) as Info;

    debug("有效响应体：", infoString(info));

    if (Object.hasOwn(info, "error")) {
      if (info.msg === NOT_LIVING_STATE) {
        return fatal(`${this.roomID} ${NOT_LIVING_STATE}`);
      }

      if (info.msg === INVALID_REQUEST) {
        error(INVALID_REQUEST);
      }
    }

    return info;
  }

  private createParams(ts: number): string {
    const signFunc = `${this.signFunc}(${this.finalRoomID},"${did}",${ts})`;
    return eval(signFunc) as string;
  }

  private matchSignFunc(html: string) {
    const matchResult = html.match(this.ub98484234Reg);
    if (matchResult == null) throw Error("没找到函数 ub98484234");

    let ub98484234 = matchResult[0];
    ub98484234 = ub98484234.replace(/eval\(strc\)\(\w+,\w+,.\w+\);/, "strc;");
    const ts = Math.floor(new Date().getTime() / 1e3);
    const ub98484234Call = `ub98484234(${this.finalRoomID}, ${did}, ${ts})`;
    let signFunc = "";
    try {
      signFunc = eval(ub98484234 + ub98484234Call) as string;
    } catch (e) {
      const slices = (e as Error).message.split(" ");
      if (slices[slices.length - 1] === "defined") {
        const lossStr = `/var ${slices[0]}=.*?];/`;
        const lossReg = new RegExp(eval(lossStr) as string);
        const matchResult = html.match(lossReg);
        if (matchResult == null) throw Error("没找到函数 ub98484234");

        signFunc = eval(ub98484234 + matchResult[0] + ub98484234Call) as string;
      }
    }
    const v = signFunc.match(/\w{12}/)!;
    const hash = createHash("md5");
    hash.update(`${this.finalRoomID}${did}${ts}${v[0]}`);
    const md5 = hash.digest("hex");
    signFunc = signFunc.replace(
      /CryptoJS\.MD5\(cb\)\.toString\(\)/,
      `"${md5}"`,
    );
    signFunc = `${signFunc.split("return rt;})")[0]}return rt;})`;
    trace(signFunc);
    return signFunc;
  }

  private async series(params: string) {
    const info = await this.getRoomInfo(params);
    return info;
  }

  private async params(): Promise<string> {
    if (!this.signFunc) {
      const html = await this.getRoomPage();

      const r = html.match(/\$ROOM.room_id = ?(\d+);/); // 有的房间号前有1个空格, 有的无空格
      if (r) {
        debug("正则查找房间 id 结果：", r[1]);
        this.finalRoomID = Number(r[1]);

        info("在网页中解析到最终房间 id：", this.finalRoomID);
      }

      this.signFunc = this.matchSignFunc(html);
    }
    const ts = Math.floor(new Date().getTime() / 1e3);
    const params = this.createParams(ts);
    debug("请求参数：", params);

    return params;
  }

  private async getLiveName(params: string) {
    /*
            码率或清晰度
                - 900 高清
                - 2000 超清
                - 4000 蓝光 4 M
                - 更高 主播可以自己设置更高的码率，没有固定值，但是可以获取到具体值，使用flv名不加码率时会自动使用最高码率播放
            添加码率后的文件名为 {name}_{bit}.flv 或 {name}_{bit}.xs，
            不添加码率就会播放最高码率
        */
    let info = await this.series(params);
    let link_name = "";
    if (info && info.error !== -15) {
      if (info.data.rtmp_live === undefined) {
        fatal(`${this.finalRoomID} 房间未开播`);
      } else {
        link_name = info.data.rtmp_live
          .split("?")[0]
          .split(".")[0]
          .split("_")[0];
      }
    } else {
      /*
               斗鱼每个房间获取房间信息的请求方式随机变换，GET 和 POST 都有可能，
               所以这里请求失败时修改，但也只修改一次请求方式，如果仍失败就需要重新执行
            */
      this.isPost = !this.isPost;
      info = await this.series(params);
      if (!info) {
        fatal(
          "更换请求方式、生成新请求参数后仍未得到正确响应，请重新运行几次程序",
        );
      } else {
        if (info.data.rtmp_live === undefined) {
          fatal(`${this.finalRoomID} 房间未开播`);
        } else {
          link_name = info.data.rtmp_live
            .split("?")[0]
            .split(".")[0]
            .split("_")[0];
        }
      }
    }

    printLink({
      tooltip: "PC播放流",
      link: `${info!.data.rtmp_url}/${info!.data.rtmp_live}`,
      suffix: "\n",
    });

    return link_name;
  }

  private async getRoomPage() {
    debug("当前房间链接：", this.roomURL);
    return await this.get(this.roomURL);
  }

  private async getMobileStream(params: string): Promise<string | undefined> {
    const url = "https://m.douyu.com/hgapi/livenc/room/getStreamUrl";
    const resp = await this.post(
      url,
      `${params}&rid=${String(this.finalRoomID)}&rate=-1`,
    );

    const mr = JSON.parse(resp) as MobileResponse;

    if (mr.error !== 0) {
      error("获取手机播放流出错：", mr.msg);
      return;
    }

    return mr.data.url;
  }

  async printLiveLink(): Promise<void> {
    const params = await this.params();

    const mobileStream = await this.getMobileStream(params);
    if (mobileStream) {
      console.log("优选：\n");
      printLink({ tooltip: "手机播放流", link: mobileStream, suffix: "" });
    }

    const name = await this.getLiveName(params);

    console.log("\n次选：选择下面的任意一条链接，播放失败换其他链接试试\n");

    for (const [cdn, config] of Object.entries(CDNS)) {
      for (const [prefix, format] of Object.entries(config)) {
        const link = `http://${prefix}.${cdn}${name}.`;

        if (format.flv) {
          const flv_link = `${link}flv`;
          printLink({ link: flv_link });
        }

        if (format.m3u8) {
          const m3u8_link = `${link}m3u8`;
          printLink({ link: m3u8_link });
        }

        console.log("\n");
      }
    }

    console.log("\n末选：上面 cdn 均不可用时，用下面的代理试试：\n");
    const proxy = DOUYU_PROXY + this.roomID.toString();
    printLink({ link: proxy });
  }
}
