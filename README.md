# vue-cloud-music

 一个基于vue的音乐播放器插件，ui风格参考网易云音乐
 demo地址 [点我点我](http://zoone.cc:8080/webproject/vue_components_demo/vue-cloud-music)

## 安装

```bash
$ npm install vue-cloud-music --save-dev
```
 v1.0.3及之前版本组件使用stylus预编译样式，项目中需要安装stylus与stylus-loader，file-loader或者url-loader用于解析文件，css-loader解析样式

```bash
$ npm install stylus stylus-loader file-loader css-loader --save-dev
```
 组件含引入图片，所以安装完之后，请设置file-loader或url-loader用以解析文件

 由于stylus并不常用，v1.0.4以及之后版本样式已经编译为普通css文件了，省去项目安装stylus的步骤

## 使用方法

 import引入之后，在vue中注册组件即可 

### 示例

```vue
<template>
    <div>
        <vue-cloud-music></vue-cloud-music>
    </div>
</template>
<script>
    import vueCloudMusic from 'vue-cloud-music';
    export default {
        data: function () {
            return {
                msg: 'text'
            }
        },
        components: {
            'vue-cloud-music': vueCloudMusic
        }
    }
</script>
<style scoped></style>
```

## demo运行方法
 将项目下载到本地之后，
```bash
 $ npm install
```
 安装node模块，在cmd中输入
```bash
 $ webpack-dev-server
```
 之后在浏览器中输入http://localhost:8080
