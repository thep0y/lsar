#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author:    thepoy
# @Email:     thepoy@163.com
# @File Name: douyu.py
# @Created:   2022-01-15 20:51:00
# @Modified:  2022-01-18 11:06:05

import time
import hashlib
import json
import execjs

from typing import List
from urllib import request


def convert_to_32_bit(x: int) -> int:
    x = x & 0xFFFFFFFF  # Keep only 32 bits
    if x >= 0x80000000:
        # Consider it a signed value
        x = -(0x100000000 - x)
    return x


def unsigned_right_shitf(n, i):
    n = n & 0xFFFFFFFF
    return n >> i


def from_char_code(*codes: int) -> str:
    s = ""
    for code in codes:
        s += chr(code)
    return s


DID = "10000000000000000000000000001501"


def create_params(rid: int, get: bool = True):
    # ts = str(int(time.time()))
    ts = "1642439030"
    v = "220120220117" if get else "220120220115"
    mix = str(rid) + DID + ts + v
    mix_md5 = hashlib.md5(mix.encode("utf-8")).hexdigest()
    sign_codes: List[int] = []
    for i in range(len(mix_md5) // 8):
        # sign_codes.append(int(mix_md5[i * 8 : i * 8 + 2], 16))
        idx = i * 8
        num1 = convert_to_32_bit(int(mix_md5[idx : idx + 2], 16) & 255)
        num2 = convert_to_32_bit((int(mix_md5[idx + 2 : idx + 2 + 2], 16) << 8) & 65280)
        num3 = convert_to_32_bit(
            unsigned_right_shitf((int(mix_md5[idx + 4 : idx + 4 + 2], 16) << 24), 8)
        )
        num4 = convert_to_32_bit(int(mix_md5[idx + 6 : idx + 6 + 2], 16) << 24)
        code = convert_to_32_bit(num1 | num2 | num3 | num4)
        sign_codes.append(code)

    if get:
        mix_nums = [0x5F7DD523, 0x2A3656BF, 0xFE440, 0x6BF023C5]
    else:
        mix_nums = [0x5A0E522, 0x2A3656BD, 0x77E180, 0x6BF023C3]

    for i in range(2):
        v0 = sign_codes[i * 2]
        v1 = sign_codes[i * 2 + 1]
        sum = 0
        delta = 0x9E3779B9

        for j in range(32):
            sum += delta
            v0 += convert_to_32_bit(
                convert_to_32_bit(convert_to_32_bit(v1 << 4) + mix_nums[0])
                ^ convert_to_32_bit(v1 + sum)
                ^ convert_to_32_bit(unsigned_right_shitf(v1, 5) + mix_nums[1])
            )
            v1 += convert_to_32_bit(
                convert_to_32_bit(convert_to_32_bit(v0 << 4) + mix_nums[2])
                ^ convert_to_32_bit(v0 + sum)
                ^ convert_to_32_bit(unsigned_right_shitf(v0, 5) + mix_nums[3])
            )
            sign_codes[i * 2] = v0
            sign_codes[i * 2 + 1] = v1

    if get:
        sign_codes[0] = convert_to_32_bit(
            convert_to_32_bit(sign_codes[0] << (mix_nums[0] % 16))
            | unsigned_right_shitf(sign_codes[0], (32 - (mix_nums[0] % 16)))
        )
        sign_codes[0] = convert_to_32_bit(sign_codes[0] ^ mix_nums[2])
        sign_codes[0] = convert_to_32_bit(
            unsigned_right_shitf(sign_codes[0], (mix_nums[2] % 16))
            | convert_to_32_bit(sign_codes[0] << (32 - (mix_nums[2] % 16)))
        )
        sign_codes[1] = convert_to_32_bit(sign_codes[1] - mix_nums[1])
        sign_codes[1] = convert_to_32_bit(
            unsigned_right_shitf(sign_codes[1], (mix_nums[3] % 16))
            | convert_to_32_bit(sign_codes[1] << (32 - (mix_nums[3] % 16)))
        )
        sign_codes[1] = convert_to_32_bit(sign_codes[1] - mix_nums[3])
        sign_codes[1] = convert_to_32_bit(sign_codes[1] + mix_nums[3])
        sign_codes[2] = convert_to_32_bit(
            convert_to_32_bit(sign_codes[2] << (mix_nums[0] % 16))
            | unsigned_right_shitf(sign_codes[2], (32 - (mix_nums[0] % 16)))
        )
        sign_codes[2] = convert_to_32_bit(sign_codes[2] - mix_nums[2])
        sign_codes[2] = convert_to_32_bit(
            convert_to_32_bit(sign_codes[2] << (mix_nums[2] % 16))
            | unsigned_right_shitf(sign_codes[2], (32 - (mix_nums[2] % 16)))
        )
        sign_codes[3] = convert_to_32_bit(sign_codes[3] ^ mix_nums[1])
        sign_codes[3] = convert_to_32_bit(
            unsigned_right_shitf(sign_codes[3], (mix_nums[3] % 16))
            | convert_to_32_bit(sign_codes[3] << (32 - (mix_nums[3] % 16)))
        )
        sign_codes[3] = convert_to_32_bit(sign_codes[3] + mix_nums[3])
        sign_codes[0] = convert_to_32_bit(sign_codes[0] - mix_nums[0])
        sign_codes[0] = convert_to_32_bit(
            convert_to_32_bit(sign_codes[0] << (mix_nums[2] % 16))
            | unsigned_right_shitf(sign_codes[0], (32 - (mix_nums[2] % 16)))
        )
        sign_codes[0] = convert_to_32_bit(sign_codes[0] ^ mix_nums[2])
        sign_codes[1] = convert_to_32_bit(sign_codes[1] - mix_nums[1])
        sign_codes[1] = convert_to_32_bit(
            unsigned_right_shitf(sign_codes[1], (mix_nums[3] % 16))
            | convert_to_32_bit(sign_codes[1] << (32 - (mix_nums[3] % 16)))
        )
        sign_codes[1] = convert_to_32_bit(
            unsigned_right_shitf(sign_codes[1], (mix_nums[1] % 16))
            | convert_to_32_bit(sign_codes[1] << (32 - (mix_nums[1] % 16)))
        )
        sign_codes[1] = convert_to_32_bit(sign_codes[1] ^ mix_nums[3])
        sign_codes[2] = convert_to_32_bit(sign_codes[2] - mix_nums[0])
        sign_codes[2] = convert_to_32_bit(sign_codes[2] + mix_nums[2])
        sign_codes[2] = convert_to_32_bit(sign_codes[2] ^ mix_nums[2])
        sign_codes[3] = convert_to_32_bit(sign_codes[3] + mix_nums[1])
        sign_codes[3] = convert_to_32_bit(
            unsigned_right_shitf(sign_codes[3], (mix_nums[3] % 16))
            | convert_to_32_bit(sign_codes[3] << (32 - (mix_nums[3] % 16)))
        )
        sign_codes[3] = convert_to_32_bit(
            unsigned_right_shitf(sign_codes[3], (mix_nums[1] % 16))
            | convert_to_32_bit(sign_codes[3] << (32 - (mix_nums[1] % 16)))
        )
        sign_codes[3] = convert_to_32_bit(sign_codes[3] + mix_nums[3])
        sign_codes[3] = convert_to_32_bit(sign_codes[3] - mix_nums[3])
    else:
        sign_codes[0] = convert_to_32_bit(sign_codes[0] ^ mix_nums[0])
        sign_codes[0] = convert_to_32_bit(
            convert_to_32_bit(sign_codes[0] << mix_nums[2] % 16)
            | unsigned_right_shitf(sign_codes[0], (32 - (mix_nums[2] % 16)))
        )
        sign_codes[0] = convert_to_32_bit(sign_codes[0] + mix_nums[2])
        sign_codes[1] = convert_to_32_bit(sign_codes[1] - mix_nums[1])
        sign_codes[1] = convert_to_32_bit(
            unsigned_right_shitf(sign_codes[1], mix_nums[3] % 16)
            | convert_to_32_bit(sign_codes[1] << (32 - (mix_nums[3] % 16)))
        )
        sign_codes[1] = convert_to_32_bit(sign_codes[1] ^ mix_nums[3])
        sign_codes[2] = convert_to_32_bit(sign_codes[2] + mix_nums[0])
        sign_codes[2] = convert_to_32_bit(sign_codes[2] ^ mix_nums[2])
        sign_codes[2] = convert_to_32_bit(sign_codes[2] + mix_nums[2])
        sign_codes[3] = convert_to_32_bit(sign_codes[3] ^ mix_nums[1])
        sign_codes[3] = convert_to_32_bit(sign_codes[3] - mix_nums[3])
        sign_codes[3] = convert_to_32_bit(
            convert_to_32_bit((sign_codes[3] << mix_nums[3] % 16))
            | unsigned_right_shitf(sign_codes[3], (32 - (mix_nums[3] % 16)))
        )
        sign_codes[0] = convert_to_32_bit(sign_codes[0] - mix_nums[0])
        sign_codes[0] = convert_to_32_bit(sign_codes[0] + mix_nums[2])
        sign_codes[0] = convert_to_32_bit(sign_codes[0] - mix_nums[2])
        sign_codes[0] = convert_to_32_bit(sign_codes[0] ^ mix_nums[2])
        sign_codes[1] = convert_to_32_bit(
            convert_to_32_bit(sign_codes[1] << mix_nums[1] % 16)
            | unsigned_right_shitf(sign_codes[1], (32 - (mix_nums[1] % 16)))
        )
        sign_codes[1] = convert_to_32_bit(sign_codes[1] ^ mix_nums[3])
        sign_codes[1] = convert_to_32_bit(
            convert_to_32_bit(sign_codes[1] << mix_nums[3] % 16)
            | unsigned_right_shitf(sign_codes[1], (32 - (mix_nums[3] % 16)))
        )
        sign_codes[1] = convert_to_32_bit(
            unsigned_right_shitf(sign_codes[1], mix_nums[3] % 16)
            | convert_to_32_bit(sign_codes[1] << (32 - (mix_nums[3] % 16)))
        )
        sign_codes[2] = convert_to_32_bit(sign_codes[2] - mix_nums[0])
        sign_codes[2] = convert_to_32_bit(sign_codes[2] + mix_nums[2])
        sign_codes[2] = convert_to_32_bit(
            unsigned_right_shitf(sign_codes[2], mix_nums[2] % 16)
            | convert_to_32_bit(sign_codes[2] << (32 - (mix_nums[2] % 16)))
        )
        sign_codes[3] = convert_to_32_bit(sign_codes[3] + mix_nums[1])
        sign_codes[3] = convert_to_32_bit(sign_codes[3] ^ mix_nums[3])
        sign_codes[3] = convert_to_32_bit(sign_codes[3] ^ mix_nums[3])
    print(sign_codes)
    letters = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
    ]
    sign_strings = [""] * len(sign_codes)
    for i in range(len(sign_codes)):
        s = ""
        for j in range(4):
            s += (
                letters[convert_to_32_bit(sign_codes[i] >> (j * 8 + 4)) & 15]
                + letters[convert_to_32_bit(sign_codes[i] >> (j * 8)) & 15]
            )
            sign_strings[i] = s
    sign = "".join(sign_strings)
    body = "v=" + v + "&did=" + DID + "&tt=" + ts + "&sign=" + sign
    return body


def __post(rid: int):
    url = f"https://www.douyu.com/lapi/live/getH5Play/{rid}"
    body = create_params(rid, get=False)
    print(body)
    header = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.62"
    }
    req = request.Request(url, body.encode("utf-8"), header)
    resp = request.urlopen(req).read()
    res = json.loads(resp)
    return res


def __get(rid: int):
    params = create_params(rid)
    url = f"https://playweb.douyu.com/lapi/live/getH5Play/{rid}?{params}"
    header = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.62"
    }
    resp = request.urlopen(url).read()
    res = json.loads(resp)
    return res


def get_live_link(rid: int, get: bool):
    """
    bit 码率，也就是清晰度
        - 900 高清
        - 2000 超清
        - 4000 蓝光 4 M
        - 更高 主播可以自己设置更高的码率，没有固定值，但是可以获取到具体值，使用flv名不加码率时会自动使用最高码率播放
    """
    if get:
        resp = __get(rid)
    else:
        resp = __post(rid)
    link_name = resp["data"]["rtmp_live"].split("?")[0].split(".")[0].split("_")[0]
    flv_link = f"http://dyscdnali1.douyucdn.cn/live/{link_name}.flv"
    print("flv 直播链接：")
    print(flv_link)

    print()

    x_p2p_link = f"http://tx2play1.douyucdn.cn/live/{link_name}.xs"
    print("x-p2p 直播链接：")
    print(x_p2p_link)


if __name__ == "__main__":
    # rid = input("输入房间 id:")
    # yes = input("房间是否为靛号？(y/n)")
    # get = False if yes.lower() == "y" else True
    # get_live_link(int(rid), get)
    # get_live_link(2267291)
    get_live_link(24422, False)
