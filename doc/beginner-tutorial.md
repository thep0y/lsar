# 新手教程

本教程适用于零 node 基础的新手。

## 1 准备环境

运行本软件需要 node 运行环境，可通下以下链接下载：

- [Windows x64](https://nodejs.org/dist/v18.14.2/node-v18.14.2-x64.msi)
- [macOS](https://nodejs.org/dist/v18.14.2/node-v18.14.2.pkg)
- Linux x64 就不放了，用的 Linux 的人，怎么会是小白？

下载好后双击安装即可，安装过程可以参考：https://www.runoob.com/nodejs/nodejs-install-setup.html。

安装完成后打开终端检查一下，Windows 上的终端为 **PowerShell** 或 **CMD** ，macOS 上的终端就叫**终端**。

```bash
node -v
```

正常的话应该会显示：

```
v18.14.2
```

## 2 配置包管理器

### 2.1 npm（新手优先使用）

node 内置的包管理是 npm，如果你只是一个新手，使用 npm 足矣。

npm 使用的仓库地址在国外，国内访问会很慢，在终端中输入：

```bash
npm config set registry https://registry.npmmirror.com
```

### 2.2 （可选）其他包管理器

第三方包管理器主要用来对项目的依赖进行管理，能够节省硬盘空间，对小白用户来说没什么用，但是如果你想体验一下也未常不可。

**不可跳过 2.1 节中的配置。**

#### 2.2.1 pnpm

安装：

```bash
npm i -g pnpm
```

#### 2.2.2 yarn

```bash
npm i -g yarn
```

## 3 安装本软件

现在就可以使用你想用的包管理器来安装了。

```bash
npm i -g lsar
# 或
pnpm i -g lsar
# 或
yarn add global lsar
```

需要注意的是，第一次使用 pnpm 安装时需要在安装后再执行一句：

```bash
pnpm setup
```

然后关闭终端，再打开新的终端才能调用`lsar`命令。
