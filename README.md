# 小程序

## 支持特性


## 开发指南

#### 1. 环境依赖

> node 6
> npm 3.8.x +

#### 2. 工程配置

> 1. 拉取代码库
> `git clone `
> 2. 安装node依赖包
> `npm install`
> 3. 监听改变代码
> `npm run dev`
> 4. 生产小程序代码
> `npm run build`

#### 3. 功能开发

建立新模块
>
> 建立同步加载模块: `npm run new <module-name>:<module-path>@<父文件夹路径>`

不写”@“后面的路径，表示将模板创建在config.pages 里面, 如果有”@“表示创建在@后面的文件夹中
>


