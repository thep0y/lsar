import { debug, fatal, defaultColor as color } from "../logger/logger";

export abstract class Base {
  roomID: number;
  readonly baseURL: string = "";

  constructor(roomID: number) {
    this.roomID = roomID;
  }

  abstract get roomURL(): string;

  abstract printLiveLink(): Promise<void>;

  async json<T extends object>(url: string, options: RequestInit): Promise<T> {
    const response = await this.request(url, options);
    return response.json();
  }

  async text(url: string, options: RequestInit): Promise<string> {
    const response = await this.request(url, options);
    return response.text();
  }

  async request(url: string, options: RequestInit): Promise<Response> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`状态码异常: ${response.status}`);
      }

      return response;
    } catch (e) {
      return fatal("请求出错", (e as Error).message);
    }
  }

  async get(
    url: string,
    headers?: { [key: string]: string },
  ): Promise<Response> {
    debug("GET 正在访问的链接：", url);

    const options: RequestInit = {
      method: "GET",
      headers: headers || {},
    };

    return await this.request(url, options);
  }

  static ContentType = {
    json: "application/json",
    form: "application/x-www-form-urlencoded",
  };

  async post(
    url: string,
    body: string | object,
    contentType: keyof typeof Base.ContentType = "form",
  ): Promise<Response> {
    debug("POST 正在访问的链接：", url, "使用的参数", body);

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": Base.ContentType[contentType],
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    };

    return await this.request(url, options);
  }
}

interface Link {
  link: string;
  tooltip?: string;
  suffix?: string;
}

export const printLink = ({ link, tooltip, suffix }: Link) => {
  if (typeof tooltip === "string") console.log(tooltip);

  console.log(color.gray(link));

  if (typeof suffix === "string") console.log(suffix);
};

export const isType = <T extends object>(
  key: string,
  obj: object,
): obj is T => {
  return key in obj;
};

export * from "./douyu";
export * from "./bilibili";
export * from "./huya";
export * from "./douyin";
