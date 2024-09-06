# LSAR

考虑到用户多为小白，无任何 node 环境搭建及 npm 使用经验，故在本项目基础上创建一同名的另一个图形化项目 https://github.com/alley-rs/lsar，本项目不再维护。

## 介绍

Live Source Address Resolution.

斗鱼、B 站、虎牙直播源链接解析工具。

为什么叫这个名？因为之前起的名都 npm 上都是重名的包了，只能随便取一个。

## 安装

### 0 新手

新手小白点击[新手教程](doc/beginner-tutorial.md)。

### 1 包管理器

```bash
npm i -g lsar
yarn add global lsar
pnpm i -g lsar
```

### 2 源码

**安装依赖**

克隆

```bash
git clone https://gitee.com/thepoy/lsar
# 或者
git clone https://github.com/thep0y/lsar
```

并进入项目目录后

```bash
yarn
# 或
pnpm install
```

**编译安装**

node 的编译叫打包更合适，打包命令：

```bash
yarn build
# 或
pnpm build
```

然后再创建全局命令快捷方式以便全局调用：

```bash
npm link -g
pnpm link -g
yarn link
```

**windows 中需注意**

如果你在用 yarn，yarn 的命令目录可能不在 Path 中，也就是说编译安装后无法调用`lsar`命令，需要将 yarn 的 Scripts 目录放在用户环境变量的 Path 中。
yarn 的 bin 目录路径请用下面的命令查看：

```bash
yarn global bin
```

将输出的目录添加到环境变量后重新打开`powershell`或`cmd`就可以执行`lsar`了。

#### 使用说明

各直播平台的命令见下面示例。

- 斗鱼
  ```bash
  lasr douyu 100
  ```
- 虎牙。
  使用链接`-u`时一定要用**英文**单引号或双引号将链接包裹住，否则可能报错。
  ```bash
  lsar huya -r 100
  lsar huya -u 'https://www.huya.com/06016sask?&curpage=%E9%BB%91%E7%A5%9E%E8%AF%9D%EF%BC%9A%E6%82%9F%E7%A9%BA%E5%93%81%E7%B1%BB%E9%A1%B5&curlocation=%E5%85%A8%E9%83%A8%2F1'
  ```
- B 站
  使入 cookie 和使用链接`-u`时一定要用**英文**单引号或双引号将链接包裹住，否则可能报错。
  ```bash
  lsar bili -r 100 'buvid3=9E0E75DA-AB78-00DC-B72A-9D56282337A829879infoc; b_nut=1723464629; ... theme_style=light'
  lsar bili -u 'https://live.bilibili.com/30632872?session_id=44ed74815a4f65086b14a6472566c873_DBCADB56-218B-4E43-872D-39ECFCF95BAD&launch_id=1000216&live_from=71001' 'buvid3=9E0E75DA-AB78-00DC-B72A-9D56282337A829879infoc; b_nut=1723464629; ... theme_style=light'
  ```
- 抖音
  ```bash
  lsar douyin 100
  ```

## 问题反馈

建议使用[mpv](https://mpv.io)播放视频，出现错误时可方便地上传日志。

反馈问题时必需上传任何播放器的错误日志，无日志者若无充足理由将直接作为无效 issue 关闭。
