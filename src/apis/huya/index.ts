import { debug, fatal, trace } from "../../logger";
import { Base, isType } from "..";
import { createHash } from "node:crypto";

interface CacheProfile {
  status: number;
  message: string;
  data: {
    liveStatus: string;
    stream: {
      baseSteamInfoList: {
        sCdnType: keyof typeof cdn;
        sStreamName: string;
        sFlvUrl: string;
        sFlvAntiCode: string;
        sFlvUrlSuffix: string;
        sHlsUrl: string;
        sHlsAntiCode: string;
        sHlsUrlSuffix: string;
        newCFlvAntiCode: string;
      }[];
    };
    liveData: {
      nick: string;
      gameFullName: string;
      introduction: string;
    };
  };
}

const cdn = {
  AL: "阿里",
  AL13: "阿里13",
  TX: "腾讯",
  HW: "华为",
  HS: "火山",
  WS: "网宿",
} as const;

interface BaseStream {
  sStreamName: string;
  sCdnType: keyof typeof cdn;
}

interface Flv extends BaseStream {
  sFlvUrl: string;
  sFlvUrlSuffix: string;
  sFlvAntiCode: string;
}

interface Hls extends BaseStream {
  sHlsUrl: string;
  sHlsUrlSuffix: string;
  sHlsAntiCode: string;
}

type RoomStream = Flv | Hls;

interface RoomInfo {
  roomInfo?: {
    eLiveStatus: number;
    tLiveInfo: {
      lProfileRoom: number;
      sRoomName: string;
      tLiveStreamInfo: {
        vStreamInfo: {
          value: RoomStream[];
        };
      };
    };
  };
  roomProfile?: {
    liveLineUrl: string;
  };
}

interface StreamResult {
  title: string;
  flv: Record<string, string>;
  hls: Record<string, string>;
}

export class Huya extends Base {
  baseURL = "https://m.huya.com/";
  private pageURL: string;

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

  private async getFinalRoomID() {
    let url: string;
    if (this.roomID) {
      url = this.roomURL;
    } else {
      url = this.pageURL;
    }

    trace("获取直播间页面信息", url);
    const resp = await this.get(url, {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    });

    const ptn = /stream: (\{.+"iFrameRate":\d+\})/;
    const streamStr = ptn.exec(resp)![1];
    const stream = JSON.parse(streamStr);
    return stream.data[0].gameLiveInfo.profileRoom as string;
  }

  private async getRoomProfile(roomID: string) {
    const resp = await this.get(
      `https://mp.huya.com/cache.php?m=Live&do=profileRoom&roomid=${roomID}`,
      {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      },
    );
    const profile: CacheProfile = JSON.parse(resp);
    if (profile.status !== 200) {
      throw Error(profile.message);
    }

    if (profile.data.liveStatus === "REPLAY") {
      fatal("此间正在重播，本程序不解析重播视频源");
    }

    const {
      liveData: { nick, gameFullName, introduction },
      stream: { baseSteamInfoList },
    } = profile.data;

    const streamInfo = {
      title: `${gameFullName}-${nick}: ${introduction}`,
      flv: {},
      hls: {},
    } as StreamResult;

    const uid = await this.getAnonymousUid();
    for (const item of baseSteamInfoList) {
      if (item.sFlvAntiCode && item.sFlvAntiCode.length > 0) {
        const anticode = this.parseAnticode(
          item.sFlvAntiCode,
          uid,
          item.sStreamName,
        );
        const url = `${item.sFlvUrl}/${item.sStreamName}.${item.sFlvUrlSuffix}?${anticode}`;
        streamInfo.flv[cdn[item.sCdnType]] = url;
      }
      if (item.sHlsAntiCode && item.sHlsAntiCode.length > 0) {
        const anticode = this.parseAnticode(
          item.sHlsAntiCode,
          uid,
          item.sStreamName,
        );
        const url = `${item.sHlsUrl}/${item.sStreamName}.${item.sHlsUrlSuffix}?${anticode}`;
        streamInfo.hls[cdn[item.sCdnType]] = url;
      }
    }

    return streamInfo;
  }

  private async getRoomInfo() {
    let url: string;
    if (this.roomID) {
      url = this.roomURL;
    } else {
      url = this.pageURL;
    }

    trace("获取直播间页面信息", url);
    const resp = await this.get(url, {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    });

    const ptn = /<script> window.HNF_GLOBAL_INIT = (.*) <\/script>/;
    //const ptn = /stream: (\{.+"iFrameRate":\d+\})/;
    const infoStr = ptn.exec(resp)![1];
    //const infoStr = ptn.exec(resp)![1];

    debug("页面信息中获取房间详细信息", infoStr);

    const info = JSON.parse(infoStr) as RoomInfo;

    return info;
  }

  private async getAnonymousUid() {
    trace("获取 uid");
    const url = "https://udblgn.huya.com/web/anonymousLogin";
    const json = {
      appId: 5002,
      byPass: 3,
      context: "",
      version: "2.4",
      data: {},
    };

    const resp = await this.post(url, JSON.stringify(json), "json");
    const obj = JSON.parse(resp) as { data: { uid: string } };

    return obj.data.uid;
  }

  private newUuid() {
    trace("创建新 uuid");

    const now = new Date().getTime();
    const rand = Math.floor(Math.random() * 1000) | 0;
    return ((now % 10000000000) * 1000 + rand) % 4294967295;
  }

  private parseAnticode(code: string, uid: string, streamname: string) {
    const q = {} as Record<string, [string]>;
    for (const [k, v] of new URLSearchParams(code)) {
      q[k] = [v];
    }
    q.ver = ["1"];
    q.sv = ["2110211124"];

    q.seqid = [String(Number.parseInt(uid) + new Date().getTime())];
    debug("seqid", q.seqid);

    q.uid = [uid];
    q.uuid = [String(this.newUuid())];
    debug("uuid", q.uuid);

    const ss = createHash("md5")
      .update(`${q.seqid[0]}|${q.ctype[0]}|${q.t[0]}`)
      .digest("hex");
    debug("ss", ss);

    q.fm[0] = Buffer.from(q.fm[0], "base64")
      .toString("utf-8")
      .replace("$0", q.uid[0])
      .replace("$1", streamname)
      .replace("$2", ss)
      .replace("$3", q.wsTime[0]);

    q.wsSecret[0] = createHash("md5").update(q.fm[0]).digest("hex");
    debug("wsSecret", q.wsSecret);

    delete q.fm;
    if ("txyp" in q) {
      delete q.txyp;
    }

    const queryString = Object.entries(q)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value[0])}`,
      )
      .join("&");

    return queryString;
  }

  private async getLives(ri: RoomInfo) {
    const streamInfo = { flv: {}, hls: {} } as StreamResult;
    const uid = await this.getAnonymousUid();

    for (const s of ri.roomInfo!.tLiveInfo.tLiveStreamInfo.vStreamInfo.value) {
      if (isType<Flv>("sFlvUrl", s)) {
        const anticode = this.parseAnticode(s.sFlvAntiCode, uid, s.sStreamName);
        const url = `${s.sFlvUrl}/${s.sStreamName}.${s.sFlvUrlSuffix}?${anticode}`;
        streamInfo.flv[cdn[s.sCdnType]] = url;
      }

      if (isType<Hls>("sHlsUrl", s)) {
        const anticode = this.parseAnticode(s.sHlsAntiCode, uid, s.sStreamName);
        const url = `${s.sHlsUrl}/${s.sStreamName}.${s.sHlsUrlSuffix}?${anticode}`;
        streamInfo.hls[cdn[s.sCdnType]] = url;
      }
    }

    return streamInfo;
  }

  async printLiveLink(): Promise<void> {
    const roomID = await this.getFinalRoomID();
    const stream = await this.getRoomProfile(roomID);

    console.log("解析完成，任选一条下面的播放源，卡顿时可尝试切换其他播放源\n");
    console.log(stream);
    return;
  }
}
