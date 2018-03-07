<template>
	<div v-bind:class="'vueCloudMusic' + (showMode ? '' : ' mini')">
		<div class="moveBg"></div>
		<div class="container">
			<div class="panelHeader">
				<video autoplay="autoplay"></video>
				<div v-bind:class="'album' + (player.song.album ? '' : ' default') + (!showMode ? ' cursor' : '')" v-bind:title="showMode ? '封面.' : '打开界面'" v-bind:style="player.song.album ? ('background-image: url(' + player.song.album + ');') : ''" v-on:click="showMode = true">
				</div>
				<div class="control" ref="control">
					<div class="info" v-if="player.song.songName || player.song.singer">
						<p class="name" title="歌名">{{ player.song.songName }}</p>
						<p class="singer" title="歌手">{{ player.song.singer }}</p>
					</div>
					<div class="info" v-else>
						<p class="emptyPlayList">当前无歌曲</p>
					</div>
					<div class="controlBtn">
						<a class="prev" title="上一首" v-on:mousedown.stop="prevSong"></a>
						<div>
							<a class="play" title="播放" v-if="!player.status.playStatus" v-on:mousedown="changePlayStatus"></a>
							<a class="pause" title="暂停" v-else v-on:mousedown="changePlayStatus"></a>
						</div>
						<a class="next" title="下一首" v-on:mousedown.stop="nextSong"></a>
					</div>
					<div class="songNameAndSinger">
						<span class="songName" title="歌名">{{player.song.songName}}</span>
						<span class="singer" title="歌手" v-if="player.song.singer"> - {{player.song.singer}}</span>							
					</div>
				</div>
				<div class="btn" ref="btn">
					<a v-bind:class="'playMode' + (player.status.playMode == 0 ? ' random' : (player.status.playMode == 1 ? ' loop' : ' single'))" v-bind:title="player.status.playMode == 0 ? '随机.' : (player.status.playMode == 1 ? '循环' : '单曲.')" v-on:mousedown.stop="changePlayMode"/>
					<a v-bind:class="'enjoy' + (player.song.isEnojy ? ' enable' : '')" v-on:mousedown="enjoyThisSong('')" title="喜欢"/>
					<div class="volume">
						<div class="outer">
							<div class="volumeControl">
								<i class="dot"></i>
								<div class="progress cover" v-on:mousemove.stop="progressDotMove($event)" v-bind:style="'opacity:1;' + (player.status.volume.progressDotMoveEnable ? 'z-index:1;' : 'z-index:0;')" v-on:mouseleave.stop="setProgressDotMoveDisable" v-on:mouseup.stop="setProgressDotMoveDisable"></div>	
								<div class="progress" v-on:mousemove.stop="" v-on:mouseup.stop="setProgressDotMoveDisable" v-on:mousemove.stop="setProgressDotMoveDisable" v-bind:style="'border-left-width:' + player.status.volume.value + 'px;border-right-width:' + (100 - player.status.volume.value) + 'px;'">
									<i class="progressDot" v-bind:style="'left:' + 0 + 'px;'" v-on:mousedown.stop="setProgressDotMoveEnable($event)"></i>
								</div>						
							</div>
							<div class="boxShadow">
								<i class="dot"></i>
							</div>								
						</div>					
					</div>
					<a v-bind:class="'showList' + (player.status.isShowPlayList && !player.status.isShowSearchList ? ' enable' : '')" title="显示列表" v-on:mousedown.stop="showOrHiddenPlayList"/>
					<a v-bind:class="'search' + (!player.status.isShowPlayList && player.status.isShowSearchList? ' enable' : '')" title="搜索" v-on:mousedown.stop="showOrHiddenSearchList"/>
					<span class="close" v-on:mousedown.stop="closeComponent"><i></i><i></i></span>
				</div>
			</div>
			<div class="panelBody ">
				<div v-bind:class="'face' + (player.status.isShowPlayList && !player.status.isShowSearchList ? ' enable' : '') + (player.status.isShowSearchList ? ' flip' : '')">
					<ul class="playList" v-if="playList.length > 0">
						<li v-for="item in playList" v-on:dblclick="playSong(item)">
							<i v-bind:class="'playStatus' + (player.song.hash == item.hash ? ' enable' : '')" title="正在播放"></i>
							<div class="songInfo" title="双击播放">
								<p class="songName">{{item.songname || item.songname_original}}</p>
								<p class="singer">{{item.singername}}</p>							
							</div>
							<div class="btns">
								<i class="play" title="播放" v-on:mousedown.stop="playSong(item)"></i>
								<i class="delete" title="删除" v-on:mousedown.stop="deleteSong(item)"></i>
							</div>
							<i v-bind:class="'enjoy' + (item.isEnojy ? ' enable' : '')" title="喜欢" v-on:mousedown="enjoyThisSong(item.hash)"></i>
						</li>
					</ul>
					<div v-else class="playListIsEmpty">
						<span>未添加任何歌曲<br/>请在搜索列表添加歌曲</span>
					</div>
				</div>
				<div v-bind:class="'back' + (player.status.isShowSearchList && !player.status.isShowPlayList ? ' enable' : '') + (player.status.isShowSearchList ? ' flip' : '')">
					<div class="input">
						<i class="back" title="返回列表" v-on:mousedown="showOrHiddenPlayList">{{queryData.keyWords}}</i>
						<input placeholder="请输入搜索..." v-model="queryData.keyWords" v-on:input.stop="editKeyWords($event)" v-on:keydown="enterKeyToSearch($event)"/>
						<i class="searchBtn" title="搜索" v-on:mousedown="getIdAndImgAndLrc(true)"></i>
					</div>
					<ul class="searchList" v-on:scroll="scrollSearchList">
						<li v-for="item in searchList" v-on:dblclick="playSong(item)">
							<div class="songInfo" title="双击播放">
								<p class="songName">{{item.songname || item.songname_original}}</p>
								<p class="singer"> - {{item.singername}}</p>
							</div>
							<div class="btns">
								<i class="play" title="立即播放" v-on:mousedown.stop="playSong(item)"></i>
								<i class="addToList" title="添加到列表" v-on:mousedown.stop="addToPlayList(item, 'add')"></i>
							</div>
						</li>
					</ul>
				</div>
			</div>	
		</div>
	</div>
</template>
<script>
	export default {
		name: 'vueCloudMusic',
		data: function () {
			return {
				render: true,
				// 显示模式，true为完整，false为mini模式
				showMode: true,
				// 播放器的相关信息
				componentsBody: null,
				// 播放器对象
				player: {
					// 当前播放的歌曲
					song: {
						isEnojy: false,
						hash: 0
					},
					// audio标签信息
					video: null,
					// 记录播放器组件的一些状态
					status: {
						// 音量大小
						volume: {
							value: 50,
							progressDotMoveEnable: false
						},
						// 播放的模式，0,1,2分别表示随机，循环，单曲
						playMode: 0,
						// 是否显示搜索列表
						isShowSearchList: false,
						// 是否显示播放列表
						isShowPlayList: false,
						// 播放的状态false和true分别表示暂停和播放
						playStatus: false
					}
				},
				// 播放列表
				playList: [],
				// 搜索结果列表
				searchList: [],
				// 组件拖动的时候，记录组件位置的相关信息
				componentPosition: {
					isEnable: false
				},
				// 搜索音乐的时候，请求所需要的一些字段
				queryData: {
					keyWords: '',
					pageNum: 1,
					size: 20,
				},
				// 歌曲总数
				total: 0
			}
		},
		methods:{
			// 搜索歌曲列表
			getIdAndImgAndLrc: function (again) {
				if (!this.queryData.keyWords.trim()) {
					alert('搜索关键词不能为空！');
					return;
				}
				if (again) {
					this.queryData.pageNum = 1;
					this.queryData.size = 20;
				}
				var url = 'http://zoone.cc:8080/phpServer/queryMusicList.php?keyword=' + this.queryData.keyWords + '&callback=searchMusicCallback&page_size=' + (this.queryData.size || 20) + '&page_no=' + (this.queryData.pageNum || 0);
				var script = document.createElement("script"), _this = this;
				window.searchMusicCallback = function(data){
					if (!data.errcode) {
						var list = data.data.info;
						for (var i = 0; i < list.length; i++) {
							list[i].isEnojy = false;
						}
						if (again) {
							_this.searchList = [];
						}
						_this.searchList = _this.searchList.concat(list);
						_this.total = data.data.total;
					}
					document.body.removeChild(script);
				}
				script.setAttribute('src', url);
				document.body.append(script);
			},
			// 获取歌曲资源
			getSource: function (songObj){
				this.player.video.stop && this.player.video.stop();
				var url = 'http://www.kugou.com/yy/index.php?r=play/getdata&hash=' + songObj.hash + '&callback=getMusicInfo';
				var script = document.createElement("script"), _this = this;
				window.getMusicInfo = function(data){
					_this.player.song.album = data.data.img;
					_this.player.musicUrl = data.data.play_url
					_this.player.status.playStatus = true;
					_this.player.song.songName = data.data.song_name;
					_this.player.song.singer = data.data.author_name;
					_this.player.song.isEnojy = songObj.isEnojy;
					/*若当前没有播放任何歌曲,获取资源播放歌曲的时候，我们将歌曲添加到播放列表（addToPlayList方法会判断列表里面是否已经存在该歌曲）*/
					if (!_this.player.song.hash) {
						_this.addToPlayList(songObj);
					}
					/*若当前有播放歌曲，并且当前播放歌曲，和我们现在所要播放的不同，也将歌曲添加到播放列表（addToPlayList方法会判断列表里面是否已经存在该歌曲）*/
					else if (_this.player.song.hash && _this.player.song.hash != songObj.hash) {
						_this.addToPlayList(songObj);
					}
					/*除此之外什么也不干*/
					else {
						console.log("正在播放" + songObj.song_name);
					}
					_this.player.video.setAttribute('src', _this.player.musicUrl);
					_this.player.song.hash = data.data.hash;
					_this.player.video.play();
					_this.player.video.onload = function(){
						_this.player.video.play();
					};
					document.body.removeChild(script);
				}				
				script.setAttribute('src', url);
				document.body.append(script);
			},
			// 显示或隐藏播放列表
			showOrHiddenPlayList: function () {
				this.player.status.isShowSearchList = false;
				this.player.status.isShowPlayList = !this.player.status.isShowPlayList;
			},
			// 显示或隐藏搜索列表
			showOrHiddenSearchList: function () {
				this.player.status.isShowPlayList = false;
				this.player.status.isShowSearchList = !this.player.status.isShowSearchList;
			},
			// 编辑搜索关键字
			editKeyWords: function (event) {
				this.queryData.keyWords = event.target.value;
			},
			// 播放歌曲
			playSong: function (songObj) {
				this.getSource(songObj);
			},
			// 添加到播放列表
			addToPlayList: function (songObj, type) {
				for (var i = 0; i < this.playList.length; i++) {
					if (this.playList[i].hash == songObj.hash) {
						if (type == 'add') {
							alert('该歌曲已经添加到列表！');
						}
						return;
					}
				}
				this.playList.push(songObj);
				if (type == 'add') {
					alert('添加成功');
				}
			},
			// 标记为喜爱
			enjoyThisSong: function (id) {
				if (!id) {
					for (var i = 0; i < this.playList.length; i++) {
						if(this.playList[i].hash == this.player.song.hash){
							this.playList[i].isEnojy = !this.playList[i].isEnojy;
							this.$set(this.player.song, 'isEnojy', this.playList[i].isEnojy);
							return;
						}
					}
				} else {
					for (var i = 0; i < this.playList.length; i++) {
						if (this.playList[i].hash == id) {
							this.playList[i].isEnojy = !this.playList[i].isEnojy;
							if (id == this.player.song.hash) {
								this.$set(this.player.song, 'isEnojy', this.playList[i].isEnojy);
							}
							return;
						}
					}					
				}
			},
			// 删除歌曲
			deleteSong: function (item) {
				for (var i = 0; i < this.playList.length; i++) {
					if (item.hash == this.playList[i].hash) {
						this.playList.splice(i, 1);
					}
				}
			},
			// 改变播放模式
			changePlayMode: function () {
				this.player.status.playMode = (this.player.status.playMode + 1) % 3;
				this.player.video.loop = this.player.status.playMode == 2;
			},
			// 设置音量移动可用
			setProgressDotMoveEnable: function (event) {
				this.player.status.volume.progressDotMoveEnable = true;
				this.player.status.volume.offsetX = event.offsetX;
				this.player.status.volume.offsetY = event.offsetY;
			},
			// 音量移动方法
			progressDotMove: function (event) {
				if (this.player.status.volume.progressDotMoveEnable) {
					this.player.status.volume.value = event.offsetX;
					this.player.video.volume = this.player.status.volume.value / 100;
				}
			},
			// 设置音量移动不可用
			setProgressDotMoveDisable: function () {
				this.player.status.volume.progressDotMoveEnable = false;
			},
			// 改变播放状态
			changePlayStatus: function () {
				if (!this.player.status.playStatus) {
					if(this.playList.length <= 0) {
						alert('请先添加歌曲！');
						return;						
					} else {
						if (!this.player.song.hash) {
							this.playSong(this.playList[0]);
						}
					}
				}
				if (this.player.status.playStatus) {
					this.player.video.pause();
				} else {
					this.player.video.play();
				}
				this.player.status.playStatus = !this.player.status.playStatus;
			},
			// 下一首歌
			nextSong: function (type) {
				if (this.playList.length <= 0) {
					alert('请先添加歌曲！');
					return;
				}
				if (!this.player.song.hash) {
					this.playSong(this.playList[0]);
				} else {
					if (this.playList.length <= 1) {
						this.playSong(this.playList[0]);
						return;
					} else {
						this.playSong(this.getNextOrPrevSongItem('next'));
					}
				}
			},
			// 上一首歌
			prevSong: function () {
				if (this.playList.length <= 0) {
					alert('请先添加歌曲！');
					return;
				}		
				if (!this.player.song.hash) {
					this.playSong(this.playList[0]);
				} else {
					if (this.playList.length <= 1) {
						this.playSong(this.playList[0]);
						return;
					} else {
						this.playSong(this.getNextOrPrevSongItem('prev'));
					}
				}
			},
			// 根据当前歌曲的id(hash)计算下一首歌或者上一首歌
			getNextOrPrevSongItem: function (type) {
				for (var index = 0; index < this.playList.length; index++) {
					if (this.playList[index].hash == this.player.song.hash) {
						break;
					}
				}
				if (this.player.status.playMode == 0) {
					var len = this.playList.length,
						randomIndex = parseInt(Math.random() * len);
					while (randomIndex == index && len > 1){
						randomIndex = parseInt(Math.random() * len);
					}
					return this.playList[randomIndex];
				} else {
					if (type == 'prev') {
						return this.playList[(index + (this.playList.length - 1)) % this.playList.length];
					} else {
						return this.playList[(index + 1) % this.playList.length];
					}
				}
			},
			// 移除组件（这里只是让他不现实）
			closeComponent: function () {
				// document.querySelector('.vueCloudMusic').style.display = 'none';
				this.showMode = false
			},
			// 设置可以移动组件
			setComponentMoveEnable: function (event) {
				this.componentPosition.isEnable = true;
				this.componentPosition.offsetX = event.offsetX;
				this.componentPosition.offsetY = event.offsetY;
			},
			// 设置不能移动组件
			setComponentMoveDisable: function() {
				this.componentPosition.isEnable = false;
			},
			// 组件移动方法
			componentMove: function (event) {
				if (this.componentPosition.isEnable) {
					this.componentsBody.style.left = event.clientX-this.componentPosition.offsetX + 'px';
					this.componentsBody.style.top = event.clientY-this.componentPosition.offsetY + 'px';
				}
			},
			// 滚动到底部的时候搜索歌曲
			scrollSearchList: function () {
				var scrollTop = document.querySelector('.searchList').scrollTop,
					containerHeight = document.querySelector('.back>.searchList').offsetHeight;
				if (this.searchList.length * 28 - containerHeight < scrollTop) {
					this.queryData.pageNum++;
					this.getIdAndImgAndLrc(false);
				}
			},
			// 回车键搜索歌曲
			enterKeyToSearch: function (event) {
				event.keyCode == 13 && this.getIdAndImgAndLrc(true);
			}
		},
		watch: {
			showMode: function (newVal) {}
		},
		computed: {},
		mounted: function() {
			var _this = this;
			this.player.video = document.querySelector('video');
			this.player.video.addEventListener('ended', function() {
				_this.nextSong('playFinish');
			});
			this.componentsBody = document.querySelector('.vueCloudMusic');
		}
	}
</script>
<style scoped>
    * {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: 0;
        font-size: 100%;
        vertical-align: baseline;
    }
    ul,
    li {
        list-styl: none;
    }
    .vueCloudMusic {
        position: relative;
        width: 320px;
        height: 42px;
    }
    .vueCloudMusic .moveBg {
        width: 100%;
        height: 100%;
    }
    .vueCloudMusic .container {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
    .vueCloudMusic .container .panelHeader {
        width: 297px;
        height: 42px;
        margin: 0 auto;
        font-size: 0;
        -webkit-box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        position: relative;
        background-color: #fff;
        z-index: 1;
        text-align: left;
        -webkit-transition: width speed, height speed;
        -khtml-transition: width speed, height speed;
        -moz-transition: width speed, height speed;
        -o-transition: width speed, height speed;
        -ms-transition: width speed, height speed;
        transition: width speed, height speed;
    }
    .vueCloudMusic .container .panelHeader video {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: none;
    }
    .vueCloudMusic .container .panelHeader .album {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        width: 42px;
        height: 42px;
        background-position: 50% 50%;
        vertical-align: middle;
        position: relative;
        z-index: 1;
        background-color: #fff;
    }
    .vueCloudMusic .container .panelHeader .album.cursor {
        cursor: pointer;
    }
    .vueCloudMusic .container .panelHeader .album:not(.default) {
        -webkit-background-size: cover;
        -moz-background-size: cover;
        background-size: cover;
    }
    .vueCloudMusic .container .panelHeader .album.default {
        background-image: url("../src/icon.png");
        background-position: -120px -120px;
    }
    .vueCloudMusic .container .panelHeader .control {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        width: 110px;
        height: 42px;
        margin-left: 5px;
        vertical-align: middle;
        position: relative;
        z-index: 0;
        -webkit-transition: opacity speed;
        -khtml-transition: opacity speed;
        -moz-transition: opacity speed;
        -o-transition: opacity speed;
        -ms-transition: opacity speed;
        transition: opacity speed;
    }
    .vueCloudMusic .container .panelHeader .control .info {
        background-color: #fff;
        position: absolute;
        width: 110px;
        height: 42px;
        left: 0;
        top: 0;
        z-index: 1;
        -webkit-opacity: 1;
        -moz-opacity: 1;
        opacity: 1;
        -ms-filter: none;
        filter: none;
        -webkit-transition: opacity 0.5s;
        -khtml-transition: opacity 0.5s;
        -moz-transition: opacity 0.5s;
        -o-transition: opacity 0.5s;
        -ms-transition: opacity 0.5s;
        transition: opacity 0.5s;
    }
    .vueCloudMusic .container .panelHeader .control .info p {
        line-height: 21px;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
    }
    .vueCloudMusic .container .panelHeader .control .info p.name {
        color: #343434;
    }
    .vueCloudMusic .container .panelHeader .control .info p.singer {
        color: #666;
    }
    .vueCloudMusic .container .panelHeader .control .info p.emptyPlayList {
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        line-height: 16px;
        color: #666;
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn {
        width: 110px;
        height: 42px;
        line-height: 42px;
        text-align: center;
        background-color: #fff;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 0;
        -webkit-opacity: 0;
        -moz-opacity: 0;
        opacity: 0;
        filter: alpha(opacity=0);
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
        -webkit-transition: opacity 0.5s;
        -khtml-transition: opacity 0.5s;
        -moz-transition: opacity 0.5s;
        -o-transition: opacity 0.5s;
        -ms-transition: opacity 0.5s;
        transition: opacity 0.5s;
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn a,
    .vueCloudMusic .container .panelHeader .control .controlBtn >div {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        vertical-align: middle;
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn a {
        width: 22px;
        height: 22px;
        cursor: pointer;
        background-image: url("../src/icon.png");
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn a.prev {
        background-position: 0 -90px;
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn a.prev:hover {
        background-position: -30px -90px;
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn a.next {
        background-position: -60px -90px;
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn a.next:hover {
        background-position: -90px -90px;
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn >div {
        width: 26px;
        height: 26px;
        position: relative;
        margin: 0 10px;
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn >div a {
        width: 26px;
        height: 26px;
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn >div a.play {
        background-position: -60px -60px;
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn >div a.play:hover {
        background-position: -90px -60px;
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn >div a.pause {
        background-position: -120px -60px;
    }
    .vueCloudMusic .container .panelHeader .control .controlBtn >div a.pause:hover {
        background-position: -150px -60px;
    }
    .vueCloudMusic .container .panelHeader .control .songNameAndSinger {
        position: absolute;
        top: 42px;
        left: -45px;
        width: 293px;
        background-color: rgba(255,255,255,0.79);
        overflow: hidden;
        line-height: 23px;
        height: 0;
        -webkit-transition: height 0.5s;
        -khtml-transition: height 0.5s;
        -moz-transition: height 0.5s;
        -o-transition: height 0.5s;
        -ms-transition: height 0.5s;
        transition: height 0.5s;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        -webkit-box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    }
    .vueCloudMusic .container .panelHeader .control .songNameAndSinger span {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        font-size: 12px;
    }
    .vueCloudMusic .container .panelHeader .control .songNameAndSinger span.songName {
        color: #343434;
    }
    .vueCloudMusic .container .panelHeader .control .songNameAndSinger span.singer {
        color: #666;
    }
    .vueCloudMusic .container .panelHeader .control:hover .info {
        z-index: 0;
        -webkit-opacity: 0;
        -moz-opacity: 0;
        opacity: 0;
        filter: alpha(opacity=0);
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
    }
    .vueCloudMusic .container .panelHeader .control:hover .controlBtn {
        z-index: 1;
        -webkit-opacity: 1;
        -moz-opacity: 1;
        opacity: 1;
        -ms-filter: none;
        filter: none;
    }
    .vueCloudMusic .container .panelHeader .control:hover .songNameAndSinger {
        height: 23px;
    }
    .vueCloudMusic .container .panelHeader .btn {
        position: absolute;
        top: 0;
        right: 0;
        line-height: 42px;
        z-index: 1;
        background-color: #fff;
    }
    .vueCloudMusic .container .panelHeader .btn >a,
    .vueCloudMusic .container .panelHeader .btn .volume,
    .vueCloudMusic .container .panelHeader .btn .search,
    .vueCloudMusic .container .panelHeader .btn .close {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        vertical-align: middle;
        margin: 0 4px;
    }
    .vueCloudMusic .container .panelHeader .btn >a {
        background-image: url("../src/icon.png");
        cursor: pointer;
    }
    .vueCloudMusic .container .panelHeader .btn >a.playMode {
        margin-left: 0;
    }
    .vueCloudMusic .container .panelHeader .btn >a.playMode.random {
        width: 15px;
        height: 13px;
        background-position: -60px -30px;
    }
    .vueCloudMusic .container .panelHeader .btn >a.playMode.random:hover {
        background-position: -90px -30px;
    }
    .vueCloudMusic .container .panelHeader .btn >a.playMode.single {
        width: 15px;
        height: 15px;
        background-position: 0 -60px;
    }
    .vueCloudMusic .container .panelHeader .btn >a.playMode.single:hover {
        background-position: -30px -60px;
    }
    .vueCloudMusic .container .panelHeader .btn >a.playMode.loop {
        width: 15px;
        height: 15px;
        background-position: -120px -30px;
    }
    .vueCloudMusic .container .panelHeader .btn >a.playMode.loop:hover {
        background-position: -150px -30px;
    }
    .vueCloudMusic .container .panelHeader .btn >a.enjoy {
        width: 15px;
        height: 13px;
        background-position: 0 0;
    }
    .vueCloudMusic .container .panelHeader .btn >a.enjoy:hover {
        background-position: -30px 0;
    }
    .vueCloudMusic .container .panelHeader .btn >a.enjoy.enable {
        background-position: -30px 0;
    }
    .vueCloudMusic .container .panelHeader .btn >a.showList {
        width: 13px;
        height: 11px;
        background-position: -120px 0;
    }
    .vueCloudMusic .container .panelHeader .btn >a.showList:hover {
        background-position: -150px 0;
    }
    .vueCloudMusic .container .panelHeader .btn >a.showList.enable {
        background-position: -150px 0;
    }
    .vueCloudMusic .container .panelHeader .btn .volume {
        width: 15px;
        height: 13px;
        background-image: url("../src/icon.png");
        cursor: pointer;
        background-position: 0 -30px;
        position: relative;
    }
    .vueCloudMusic .container .panelHeader .btn .volume:hover {
        background-position: -30px -30px;
    }
    .vueCloudMusic .container .panelHeader .btn .volume:hover .outer {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: block;
    }
    .vueCloudMusic .container .panelHeader .btn .volume .outer {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: none;
        height: 46px;
        width: 100%;
        position: absolute;
        left: 50%;
        top: 0;
        -webkit-transform: translate(-50%, -100%);
        -khtml-transform: translate(-50%, -100%);
        -moz-transform: translate(-50%, -100%);
        -o-transform: translate(-50%, -100%);
        -ms-transform: translate(-50%, -100%);
        transform: translate(-50%, -100%);
    }
    .vueCloudMusic .container .panelHeader .btn .volume .outer .volumeControl,
    .vueCloudMusic .container .panelHeader .btn .volume .outer .boxShadow {
        position: absolute;
        width: 114px;
        height: 32px;
        background-color: #fff;
        left: 50%;
        top: 0;
        -webkit-transform: translate(-50%, 0);
        -khtml-transform: translate(-50%, 0);
        -moz-transform: translate(-50%, 0);
        -o-transform: translate(-50%, 0);
        -ms-transform: translate(-50%, 0);
        transform: translate(-50%, 0);
        -webkit-border-radius: 2px;
        border-radius: 2px;
    }
    .vueCloudMusic .container .panelHeader .btn .volume .outer .volumeControl >.dot,
    .vueCloudMusic .container .panelHeader .btn .volume .outer .boxShadow >.dot {
        position: absolute;
        left: 50%;
        bottom: 6px;
        -webkit-transform: translate(-50%, 100%) rotate(-135deg);
        -khtml-transform: translate(-50%, 100%) rotate(-135deg);
        -moz-transform: translate(-50%, 100%) rotate(-135deg);
        -o-transform: translate(-50%, 100%) rotate(-135deg);
        -ms-transform: translate(-50%, 100%) rotate(-135deg);
        transform: translate(-50%, 100%) rotate(-135deg);
        border-top: 10px solid #fff;
        border-right: 10px solid transparent;
        border-bottom: 0 solid;
        border-left: 0 solid;
    }
    .vueCloudMusic .container .panelHeader .btn .volume .outer .volumeControl {
        z-index: 1;
        text-align: center;
        line-height: 32px;
        cursor: default;
    }
    .vueCloudMusic .container .panelHeader .btn .volume .outer .volumeControl .progress {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        height: 8px;
        -webkit-border-radius: 4px;
        border-radius: 4px;
        width: 100px;
        border-left-color: #686868;
        border-right-color: #8d8d8d;
        border-style: solid;
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        cursor: pointer;
        vertical-align: middle;
        z-index: 0;
    }
    .vueCloudMusic .container .panelHeader .btn .volume .outer .volumeControl .progress.cover {
        border: none;
        width: 100px;
        height: 12px;
    }
    .vueCloudMusic .container .panelHeader .btn .volume .outer .volumeControl .progress .progressDot {
        position: absolute;
        width: 12px;
        height: 12px;
        -webkit-box-shadow: 0 0 5px 3px rgba(0,0,0,0.1);
        box-shadow: 0 0 5px 3px rgba(0,0,0,0.1);
        -webkit-border-radius: 50%;
        border-radius: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        background-color: #fff;
    }
    .vueCloudMusic .container .panelHeader .btn .volume .outer .volumeControl .progress .progressDot:after {
        content: " ";
        font-size: 0;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        width: 4px;
        height: 4px;
        -webkit-border-radius: 50%;
        border-radius: 50%;
        background-color: #686868;
        position: absolute;
    }
    .vueCloudMusic .container .panelHeader .btn .volume .outer .boxShadow {
        z-index: 0;
        -webkit-box-shadow: 0 0 5px 3px rgba(0,0,0,0.1);
        box-shadow: 0 0 5px 3px rgba(0,0,0,0.1);
    }
    .vueCloudMusic .container .panelHeader .btn .volume .outer .boxShadow >.dot {
        -webkit-box-shadow: 0 0 5px 3px rgba(0,0,0,0.1);
        box-shadow: 0 0 5px 3px rgba(0,0,0,0.1);
    }
    .vueCloudMusic .container .panelHeader .btn .close {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        width: 16px;
        height: 16px;
        position: relative;
        cursor: pointer;
    }
    .vueCloudMusic .container .panelHeader .btn .close i {
        position: absolute;
        left: 50%;
        top: 50%;
        background-color: #848484;
    }
    .vueCloudMusic .container .panelHeader .btn .close i:nth-child(1) {
        -webkit-transform: translate(-50%, -50%) rotate(45deg);
        -khtml-transform: translate(-50%, -50%) rotate(45deg);
        -moz-transform: translate(-50%, -50%) rotate(45deg);
        -o-transform: translate(-50%, -50%) rotate(45deg);
        -ms-transform: translate(-50%, -50%) rotate(45deg);
        transform: translate(-50%, -50%) rotate(45deg);
        width: 100%;
        height: 1px;
    }
    .vueCloudMusic .container .panelHeader .btn .close i:nth-child(2) {
        -webkit-transform: translate(-50%, -50%) rotate(45deg);
        -khtml-transform: translate(-50%, -50%) rotate(45deg);
        -moz-transform: translate(-50%, -50%) rotate(45deg);
        -o-transform: translate(-50%, -50%) rotate(45deg);
        -ms-transform: translate(-50%, -50%) rotate(45deg);
        transform: translate(-50%, -50%) rotate(45deg);
        height: 100%;
        width: 1px;
    }
    .vueCloudMusic .container .panelHeader .btn .close:hover i {
        background-color: #c73030;
    }
    .vueCloudMusic .container .panelHeader .btn .search {
        background-image: url("../src/icon.png");
        cursor: pointer;
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        width: 15px;
        height: 15px;
        background-position: -60px 0;
    }
    .vueCloudMusic .container .panelHeader .btn .search:hover {
        background-position: -90px 0;
    }
    .vueCloudMusic .container .panelHeader .btn .search.enable {
        background-position: -90px 0;
    }
    .vueCloudMusic .container .panelBody {
        width: 294px;
        margin: 0 auto;
        position: relative;
        perspective: 800;
        -webkit-perspective: 800;
        height: 0;
    }
    .vueCloudMusic .container .panelBody .face {
        -webkit-backface-visibility: hidden;
        -moz-backface-visibility: hidden;
        -ms-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-transform: rotateY(0);
        -khtml-transform: rotateY(0);
        -moz-transform: rotateY(0);
        -o-transform: rotateY(0);
        -ms-transform: rotateY(0);
        transform: rotateY(0);
        position: absolute;
        width: 100%;
        -webkit-transition: transform 0.5s, height 0.5s;
        -khtml-transition: transform 0.5s, height 0.5s;
        -moz-transition: transform 0.5s, height 0.5s;
        -o-transition: transform 0.5s, height 0.5s;
        -ms-transition: transform 0.5s, height 0.5s;
        transition: transform 0.5s, height 0.5s;
        overflow: hidden;
        -webkit-box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        height: 0;
        background-color: rgba(255,255,255,0.9);
        text-align: left;
    }
    .vueCloudMusic .container .panelBody .face.enable {
        height: 280px;
    }
    .vueCloudMusic .container .panelBody .face.flip {
        -webkit-transform: rotateY(180deg);
        -khtml-transform: rotateY(180deg);
        -moz-transform: rotateY(180deg);
        -o-transform: rotateY(180deg);
        -ms-transform: rotateY(180deg);
        transform: rotateY(180deg);
    }
    .vueCloudMusic .container .panelBody .face >.playList {
        height: 280px;
        overflow-y: auto;
        -webkit-box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    }
    .vueCloudMusic .container .panelBody .face >.playList:-webkit-scrollbar {
        background-color: transparent;
        width: 8px;
    }
    .vueCloudMusic .container .panelBody .face >.playList::-webkit-scrollbar {
        background-color: transparent;
        width: 8px;
    }
    .vueCloudMusic .container .panelBody .face >.playList:-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,0.1);
        -webkit-border-radius: 4px;
        -webkit-opacity: 0;
        -moz-opacity: 0;
        opacity: 0;
        filter: alpha(opacity=0);
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
        width: 8px;
    }
    .vueCloudMusic .container .panelBody .face >.playList::-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,0.1);
        -webkit-border-radius: 4px;
        -webkit-opacity: 0;
        -moz-opacity: 0;
        opacity: 0;
        filter: alpha(opacity=0);
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
        width: 8px;
    }
    .vueCloudMusic .container .panelBody .face >.playList li {
        position: relative;
        cursor: default;
    }
    .vueCloudMusic .container .panelBody .face >.playList li:nth-child(2n+1) {
        background-color: rgba(255,255,255,0.95);
    }
    .vueCloudMusic .container .panelBody .face >.playList li:nth-child(2n+1):hover {
        background-color: rgba(243,243,244,0.95);
    }
    .vueCloudMusic .container .panelBody .face >.playList li:nth-child(2n+1):hover .btns {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: block;
    }
    .vueCloudMusic .container .panelBody .face >.playList li:nth-child(2n+1):hover >.enjoy {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: block;
    }
    .vueCloudMusic .container .panelBody .face >.playList li:nth-child(2n+1).current {
        background-color: rgba(232,232,234,0.95);
    }
    .vueCloudMusic .container .panelBody .face >.playList li:nth-child(2n) {
        background-color: rgba(250,250,251,0.95);
    }
    .vueCloudMusic .container .panelBody .face >.playList li:nth-child(2n):hover {
        background-color: rgba(243,243,244,0.95);
    }
    .vueCloudMusic .container .panelBody .face >.playList li:nth-child(2n):hover .btns {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: block;
    }
    .vueCloudMusic .container .panelBody .face >.playList li:nth-child(2n):hover >.enjoy {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: block;
    }
    .vueCloudMusic .container .panelBody .face >.playList li:nth-child(2n).current {
        background-color: rgba(232,232,234,0.95);
    }
    .vueCloudMusic .container .panelBody .face >.playList li i {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        vertical-align: middle;
    }
    .vueCloudMusic .container .panelBody .face >.playList li i.playStatus {
        width: 15px;
        height: 28px;
        position: relative;
    }
    .vueCloudMusic .container .panelBody .face >.playList li i.playStatus.enable:after {
        content: " ";
        font-size: 0;
        border-top: 5px solid transparent;
        border-left: 0 solid;
        border-bottom: 5px solid transparent;
        border-left: 7px solid #c73030;
        left: 50%;
        top: 50%;
        position: absolute;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
    .vueCloudMusic .container .panelBody .face >.playList li .songInfo {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        width: 200px;
        margin-left: 5px;
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
    }
    .vueCloudMusic .container .panelBody .face >.playList li .songInfo p {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
    }
    .vueCloudMusic .container .panelBody .face >.playList li .songInfo .songName {
        color: #373737;
    }
    .vueCloudMusic .container .panelBody .face >.playList li .songInfo .singer {
        color: #676767;
    }
    .vueCloudMusic .container .panelBody .face >.playList li >.enjoy {
        width: 14px;
        height: 13px;
        background-image: url("../src/icon.png");
        background-position: 0 -120px;
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        margin-left: 5px;
        position: absolute;
        right: 10px;
        -webkit-transform: translate(0, -50%);
        -khtml-transform: translate(0, -50%);
        -moz-transform: translate(0, -50%);
        -o-transform: translate(0, -50%);
        -ms-transform: translate(0, -50%);
        transform: translate(0, -50%);
        top: 50%;
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: none;
    }
    .vueCloudMusic .container .panelBody .face >.playList li >.enjoy:hover {
        background-position: -30px -120px;
    }
    .vueCloudMusic .container .panelBody .face >.playList li >.enjoy.enable {
        background-position: -30px -120px;
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: block;
    }
    .vueCloudMusic .container .panelBody .face >.playList li .btns {
        position: absolute;
        top: 50%;
        right: 30px;
        -webkit-transform: translate(0, -50%);
        -khtml-transform: translate(0, -50%);
        -moz-transform: translate(0, -50%);
        -o-transform: translate(0, -50%);
        -ms-transform: translate(0, -50%);
        transform: translate(0, -50%);
        font-size: 0;
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: none;
    }
    .vueCloudMusic .container .panelBody .face >.playList li .btns i {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        margin-left: 5px;
    }
    .vueCloudMusic .container .panelBody .face >.playList li .btns i.play {
        position: relative;
        width: 7px;
        height: 10px;
        margin-left: 7px;
    }
    .vueCloudMusic .container .panelBody .face >.playList li .btns i.play:after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        width: 0;
        height: 0;
        border-top: 5px solid transparent;
        border-right: 0 solid;
        border-bottom: 5px solid transparent;
        border-left: 7px solid #848484;
    }
    .vueCloudMusic .container .panelBody .face >.playList li .btns i.play:hover:after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        width: 0;
        height: 0;
        border-top: 5px solid transparent;
        border-right: 0 solid;
        border-bottom: 5px solid transparent;
        border-left: 7px solid #c73030;
    }
    .vueCloudMusic .container .panelBody .face >.playList li .btns i.delete {
        width: 13px;
        height: 14px;
        background-image: url("../src/icon.png");
        background-position: -120px -90px;
        margin-left: 9px;
    }
    .vueCloudMusic .container .panelBody .face >.playList li .btns i.delete:hover {
        background-position: -150px -90px;
    }
    .vueCloudMusic .container .panelBody .face .playListIsEmpty {
        position: relative;
        height: 100%;
    }
    .vueCloudMusic .container .panelBody .face .playListIsEmpty span {
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        width: 80%;
        text-align: center;
        line-height: 18px;
        font-size: 12px;
        color: #c8c8c8;
    }
    .vueCloudMusic .container .panelBody >.back {
        height: 280px;
        width: 100%;
        position: absolute;
        left: 0;
        top: 0;
        -webkit-box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        -webkit-backface-visibility: hidden;
        -moz-backface-visibility: hidden;
        -ms-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-transform: rotateY(180deg);
        -khtml-transform: rotateY(180deg);
        -moz-transform: rotateY(180deg);
        -o-transform: rotateY(180deg);
        -ms-transform: rotateY(180deg);
        transform: rotateY(180deg);
        overflow: hidden;
        -webkit-transition: transform 0.5s, height 0.5s;
        -khtml-transition: transform 0.5s, height 0.5s;
        -moz-transition: transform 0.5s, height 0.5s;
        -o-transition: transform 0.5s, height 0.5s;
        -ms-transition: transform 0.5s, height 0.5s;
        transition: transform 0.5s, height 0.5s;
        height: 0;
        cursor: default;
    }
    .vueCloudMusic .container .panelBody >.back.enable {
        height: 280px;
    }
    .vueCloudMusic .container .panelBody >.back.flip {
        -webkit-transform: rotateY(0);
        -khtml-transform: rotateY(0);
        -moz-transform: rotateY(0);
        -o-transform: rotateY(0);
        -ms-transform: rotateY(0);
        transform: rotateY(0);
    }
    .vueCloudMusic .container .panelBody >.back .input {
        line-height: 28px;
        font-size: 0;
        text-align: center;
        background-color: rgba(240,240,240,0.9);
    }
    .vueCloudMusic .container .panelBody >.back .input i {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        cursor: pointer;
        vertical-align: middle;
        background-image: url("../src/icon.png");
    }
    .vueCloudMusic .container .panelBody >.back .input i.back {
        width: 13px;
        height: 14px;
        background-position: -60px -120px;
    }
    .vueCloudMusic .container .panelBody >.back .input i.back:hover {
        background-position: -90px -120px;
    }
    .vueCloudMusic .container .panelBody >.back .input i.searchBtn {
        width: 15px;
        height: 15px;
        background-position: -60px 0;
    }
    .vueCloudMusic .container .panelBody >.back .input i.searchBtn:hover {
        background-position: -90px 0;
    }
    .vueCloudMusic .container .panelBody >.back .input input {
        margin: 0 8px;
        vertical-align: middle;
        width: 230px;
        border: none;
        height: 20px;
        line-height: 20px;
        text-indent: 5px;
        -webkit-border-radius: 2px;
        border-radius: 2px;
        background-color: rgba(255,255,255,0.9);
        font-size: 12px;
        cursor: text;
    }
    .vueCloudMusic .container .panelBody >.back .searchList {
        height: 252px;
        overflow-y: auto;
        background-color: rgba(255,255,255,0.9);
        text-align: left;
    }
    .vueCloudMusic .container .panelBody >.back .searchList:-webkit-scrollbar {
        background-color: transparent;
        width: 8px;
    }
    .vueCloudMusic .container .panelBody >.back .searchList::-webkit-scrollbar {
        background-color: transparent;
        width: 8px;
    }
    .vueCloudMusic .container .panelBody >.back .searchList:-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,0.1);
        -webkit-border-radius: 4px;
        -webkit-opacity: 0;
        -moz-opacity: 0;
        opacity: 0;
        filter: alpha(opacity=0);
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
        width: 8px;
    }
    .vueCloudMusic .container .panelBody >.back .searchList::-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,0.1);
        -webkit-border-radius: 4px;
        -webkit-opacity: 0;
        -moz-opacity: 0;
        opacity: 0;
        filter: alpha(opacity=0);
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
        width: 8px;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li {
        position: relative;
        height: 28px;
        line-height: 28px;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li:nth-child(2n+1) {
        background-color: rgba(255,255,255,0.95);
    }
    .vueCloudMusic .container .panelBody >.back .searchList li:nth-child(2n+1):hover {
        background-color: rgba(243,243,244,0.95);
    }
    .vueCloudMusic .container .panelBody >.back .searchList li:nth-child(2n+1):hover .btns {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: block;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li:nth-child(2n+1).current {
        background-color: rgba(232,232,234,0.95);
    }
    .vueCloudMusic .container .panelBody >.back .searchList li:nth-child(2n) {
        background-color: rgba(250,250,251,0.95);
    }
    .vueCloudMusic .container .panelBody >.back .searchList li:nth-child(2n):hover {
        background-color: rgba(243,243,244,0.95);
    }
    .vueCloudMusic .container .panelBody >.back .searchList li:nth-child(2n):hover .btns {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: block;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li:nth-child(2n).current {
        background-color: rgba(232,232,234,0.95);
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .songInfo {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        width: 220px;
        margin-left: 5px;
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        margin-left: 15px;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .songInfo p {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .songInfo .songName {
        color: #373737;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .songInfo .singer {
        color: #676767;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .btns {
        position: absolute;
        top: 50%;
        right: 10px;
        -webkit-transform: translate(0, -50%);
        -khtml-transform: translate(0, -50%);
        -moz-transform: translate(0, -50%);
        -o-transform: translate(0, -50%);
        -ms-transform: translate(0, -50%);
        transform: translate(0, -50%);
        font-size: 0;
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: none;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .btns i {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        margin-left: 5px;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .btns i.play {
        position: relative;
        width: 7px;
        height: 10px;
        margin-left: 7px;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .btns i.play:after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        width: 0;
        height: 0;
        border-top: 5px solid transparent;
        border-right: 0 solid;
        border-bottom: 5px solid transparent;
        border-left: 7px solid #848484;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .btns i.play:hover:after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        width: 0;
        height: 0;
        border-top: 5px solid transparent;
        border-right: 0 solid;
        border-bottom: 5px solid transparent;
        border-left: 7px solid #c73030;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .btns i.addToList {
        position: relative;
        width: 16px;
        height: 16px;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .btns i.addToList:before {
        content: " ";
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        width: 70%;
        height: 1px;
        background-color: #848484;
        font-size: 0;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .btns i.addToList:after {
        content: " ";
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        -khtml-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        height: 70%;
        width: 1px;
        background-color: #848484;
        font-size: 0;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .btns i.addToList:hover:before {
        background-color: #c73030;
    }
    .vueCloudMusic .container .panelBody >.back .searchList li .btns i.addToList:hover:after {
        background-color: #c73030;
    }
    .vueCloudMusic.mini {
        width: 66px;
        height: 42px;
    }
    .vueCloudMusic.mini .container {
        width: 42px;
        height: 42px;
    }
    .vueCloudMusic.mini .container .panelHeader {
        width: 42px;
        height: 42px;
    }
    .vueCloudMusic.mini .container .panelHeader .control {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: none;
    }
    .vueCloudMusic.mini .container .panelHeader .btn {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: none;
    }
    .vueCloudMusic.mini .container .panelBody {
        display: -webkit-box /* OLD - iOS 6-, Safari 3.1-6 */;
        display: -moz-box /* OLD - Firefox 19- (buggy but mostly works) */;
        display: none;
    }
</style>
