# Live Stream

#### 介绍
斗鱼直播源链接


#### 安装教程

1. **安装依赖**

   克隆

   ```bash
   git clone https://gitee.com/thepoy/live-stream
   ```

   并进入项目目录后

   ```bash
   yarn
   ```

2. **编译安装**

   ```bash
   yarn build
   ```
   
3. **windows 中需注意**
   yarn 的命令目录可能不在 Path 中，也就是说编译安装后无法调用`live`命令，需要将 yarn 的 Scripts 目录放在用户环境变量的 Path 中。
   yarn 的 bin 目录路径请用下面的命令查看：

   ```bash
   yarn global bin
   ```

   将输出的目录添加到环境变量后重新打开`powershell`或`cmd`就可以执行`live`了。

#### 使用说明

当前只完成了斗鱼直播源的获取，因为我偶尔用斗鱼看看直播，其他平台暂无需求，留待以后更新。

编译安装后在 yarn 的全局 bin 目录中会有一个`live`命令，传入房间号即可解析出直播源：

![image-20220118232002490](https://s4.ax1x.com/2022/01/18/7BoYyn.png)

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request
