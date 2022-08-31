# Live Stream

#### 介绍
斗鱼、B站直播源链接解析工具。


#### 安装教程

1. **安装依赖**

   克隆

   ```bash
   git clone https://gitee.com/thepoy/live-stream
   ```

   并进入项目目录后

   ```bash
   yarn
   # 或
   pnpm install
   ```

2. **编译安装**

   ```bash
   yarn build
   # 或
   pnpm build
   ```
   
3. **windows 中需注意**
   如果你在用 yarn，yarn 的命令目录可能不在 Path 中，也就是说编译安装后无法调用`live`命令，需要将 yarn 的 Scripts 目录放在用户环境变量的 Path 中。
   yarn 的 bin 目录路径请用下面的命令查看：

   ```bash
   yarn global bin
   ```

   将输出的目录添加到环境变量后重新打开`powershell`或`cmd`就可以执行`live`了。

#### 使用说明

当前只完成了斗鱼直播源的获取，因为我偶尔用斗鱼看看直播，其他平台暂无需求，留待以后更新。

编译安装后在 npm 的全局 bin 目录中会有一个`live`命令，传入房间号即可解析出直播源：

![1111.png](https://s2.loli.net/2022/08/31/x2DLSFG8B4wjmN1.png)
