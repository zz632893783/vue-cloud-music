# vue-cloud-music

 一个基于vue的音乐播放器插件，ui风格参考网易云音乐

## 安装

```bash
$ npm install vue-cloud-music --save-dev
```
 组件使用stylus预编译样式，项目中需要安装stylus与stylus-loader，file-loader用于解析文件
```bash
$ npm install stylus stylus-loader file-loader --save-dev
```
## 使用方法

 import引入之后，在vue中注册组件即可 

### 示例

```bash
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
<style lang="styl"></style>
```

## demo运行方法
 将项目下载到本地之后，npm install安装node模块，在cmd中输入
```bash
 $ webpack-dev-server
```
 之后在浏览器中输入http://localhost:8080预览
