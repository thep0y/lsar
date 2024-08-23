import { fatal } from "../../logger";
import { Base } from "..";

type Resolution = "FULL_HD1" | "HD1" | "SD1" | "SD2";

interface RoomInfo {
  data: {
    data: {
      status: 1 | 2;
      title: string;
      stream_url: {
        flv_pull_url: Record<Resolution, string>;
        hls_pull_url_map: Record<Resolution, string>;
      };
    }[];
    user: {
      nickname: string;
    };
  };
}

export class Douyin extends Base {
  baseURL = "https://live.douyin.com/";

  headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Upgrade-Insecure-Requests": "1",
  };

  get roomURL(): string {
    return this.baseURL + this.roomID.toString();
  }

  private async getSetCookie() {
    const resp = await this.get(this.roomURL, this.headers);
    const respHeader = resp.headers;

    const setCookie = respHeader.get("Set-Cookie");
    if (!setCookie) {
      return fatal("未获取到 cookie");
    }

    return setCookie;
  }

  private async getAcNonce() {
    const cookie = await this.getSetCookie();
    const acNonceRegex = /^__ac_nonce=(.*?);/;
    const acNonce = acNonceRegex.exec(cookie);
    if (!acNonce) {
      return fatal("cookie 中未获取到 __ac_nonce");
    }

    return acNonce[1];
  }

  private async getTtwid() {
    const cookie = await this.getSetCookie();
    const ttwidRegex = /^ttwid=(.*?);/;
    const ttwid = ttwidRegex.exec(cookie);
    if (!ttwid) {
      return fatal("cookie 中未获取到 ttwid");
    }

    return ttwid[1];
  }

  private async getRoomInfo(): Promise<RoomInfo> {
    const url = `https://live.douyin.com/webcast/room/web/enter/?aid=6383&app_name=douyin_web&live_id=1&device_platform=web&language=zh-CN&enter_from=web_live&cookie_enabled=true&screen_width=1728&screen_height=1117&browser_language=zh-CN&browser_platform=MacIntel&browser_name=Chrome&browser_version=116.0.0.0&web_rid=${this.roomID}`;

    const resp = await this.get(url, this.headers);
    return resp.json();
  }

  async printLiveLink(): Promise<void> {
    const acNonce = await this.getAcNonce();
    this.headers.cookie = `__ac_nonce=${acNonce}`;

    const ttwid = await this.getTtwid();

    this.headers.cookie = `ttwid=${ttwid}`;
    this.headers.Accept = "*/*";
    this.headers.Host = "live.douyin.com";
    this.headers.Connection = "keep-alive";
    delete this.headers["Upgrade-Insecure-Requests"];

    const roomInfo = await this.getRoomInfo();

    console.log(
      `${roomInfo.data.user.nickname}-${roomInfo.data.data[0].title}`,
    );

    const { flv_pull_url, hls_pull_url_map } = roomInfo.data.data[0].stream_url;

    console.log({ flv: flv_pull_url, hls: hls_pull_url_map });
  }
}
