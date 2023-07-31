# LSAR

## 介绍
Live Source Address Resolution.

斗鱼、B站直播源链接解析工具。

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

```bash
yarn build
# 或
pnpm build
```

**windows 中需注意**
如果你在用 yarn，yarn 的命令目录可能不在 Path 中，也就是说编译安装后无法调用`lsar`命令，需要将 yarn 的 Scripts 目录放在用户环境变量的 Path 中。
yarn 的 bin 目录路径请用下面的命令查看：

```bash
yarn global bin
```

将输出的目录添加到环境变量后重新打开`powershell`或`cmd`就可以执行`lsar`了。

#### 使用说明

当前只完成了斗鱼直播源的获取，因为我偶尔用斗鱼看看直播，其他平台暂无需求，留待以后更新。

编译安装后在 npm 的全局 bin 目录中会有一个`lsar`命令，传入房间号即可解析出直播源：

![截屏2023-07-31 11.37.55](https://i.imgtg.com/2023/07/31/Oi3fnp.png)

## 问题反馈

建议使用[mpv](https://mpv.io)播放视频，出现错误时可方便地上传日志。

反馈问题时必需上传任何播放器的错误日志，无日志者若无充足理由将直接作为无效 issue 关闭。
