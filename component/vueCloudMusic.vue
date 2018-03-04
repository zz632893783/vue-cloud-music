<template>
	<div class="vueCloudMusic">
		<div class="moveBg"></div>
		<div class="container">
			<div class="panelHeader">
				<audio v-bind:src="player.song.musicUrl" autoplay="autoplay"></audio>
				<div v-bind:class="'album' + (player.song.album ? '' : ' default')" title="封面." v-bind:style="player.song.album ? ('background-image: url(' + player.song.album + ');') : ''"></div>
				<div class="control">
					<div class="info" v-if="player.song.songName || player.song.singer || player.song.singer2">
						<p class="name" title="歌名.">{{ player.song.songName }}</p>
						<p class="singer" title="歌手.">{{ player.song.singer }}{{ player.song.singer2 ? (" 、" + player.song.singer2) : ''}}</p>
					</div>
					<div class="info" v-else>
						<p class="emptyPlayList">当前无歌曲</p>
					</div>
					<div class="controlBtn">
						<a class="prev" title="上一首." v-on:mousedown.stop="prevSong"></a>
						<div>
							<a class="play" title="播放." v-if="!player.status.playStatus" v-on:mousedown="changePlayStatus"></a>
							<a class="pause" title="暂停." v-else v-on:mousedown="changePlayStatus"></a>
						</div>
						<a class="next" title="下一首." v-on:mousedown.stop="nextSong"></a>
					</div>
					<div class="songNameAndSinger">
						<span class="songName" title="歌名.">{{player.song.songName && player.song.songName.replace(/&#\d+;/g, '')}}</span>
						<span class="singer" title="歌手." v-if="player.song.singer || player.song.singer2"> - {{player.song.singer}}{{player.song.singer2 ? (" 、" + player.song.singer2) : ""}}</span>							
					</div>
				</div>
				<div class="btn">
					<a v-bind:class="'playMode' + (player.status.playMode == 0 ? ' random' : (player.status.playMode == 1 ? ' loop' : ' single'))" v-bind:title="player.status.playMode == 0 ? '随机.' : (player.status.playMode == 1 ? '循环.' : '单曲.')" v-on:mousedown.stop="changePlayMode"/>
					<a v-bind:class="'enjoy' + (player.song.isEnojy ? ' enable' : '')" v-on:mousedown="enjoyThisSong('')" title="喜欢."/>
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
					<a v-bind:class="'showList' + (player.status.isShowPlayList && !player.status.isShowSearchList ? ' enable' : '')" title="显示列表." v-on:mousedown.stop="showOrHiddenPlayList"/>
					<a v-bind:class="'search' + (!player.status.isShowPlayList && player.status.isShowSearchList? ' enable' : '')" title="搜索." v-on:mousedown.stop="showOrHiddenSearchList"/>
					<span class="close" v-on:mousedown.stop="removeComponent"><i></i><i></i></span>
				</div>
			</div>
			<div class="panelBody ">
				<div v-bind:class="'face' + (player.status.isShowPlayList && !player.status.isShowSearchList ? ' enable' : '') + (player.status.isShowSearchList ? ' flip' : '')">
					<ul class="playList" v-if="playList.length > 0">
						<li v-for="item in playList" v-on:dblclick="playSong(item)">
							<i v-bind:class="'playStatus' + (player.song.id == item.id ? ' enable' : '')" title="正在播放."></i>
							<div class="songInfo" title="双击播放.">
								<p class="songName">{{item.fsong && item.fsong.replace(/&#\d+;/g, '')}}</p>
								<p class="singer">{{item.fsinger}}{{item.fsinger2 ? (" 、" + item.fsinger2) : ''}}</p>							
							</div>
							<!-- <i v-bind:class="'enjoy'+(item.isEnojy?' enable':'')" title="喜欢." v-on:mousedown="enjoyThisSong(item.id)"></i> -->
							<div class="btns">
								<i class="play" title="播放." v-on:mousedown.stop="playSong(item)"></i>
								<i class="delete" title="删除." v-on:mousedown.stop="deleteSong(item)"></i>
							</div>
							<i v-bind:class="'enjoy' + (item.isEnojy ? ' enable' : '')" title="喜欢." v-on:mousedown="enjoyThisSong(item.id)"></i>
						</li>
					</ul>
					<div v-else class="playListIsEmpty">
						<span>未添加任何歌曲<br/>请在搜索列表添加歌曲</span>
					</div>
				</div>
				<div v-bind:class="'back' + (player.status.isShowSearchList && !player.status.isShowPlayList ? ' enable' : '') + (player.status.isShowSearchList ? ' flip' : '')">
					<div class="input">
						<i class="back" title="返回列表." v-on:mousedown="showOrHiddenPlayList">{{queryData.keyWords}}</i>
						<input placeholder="请输入搜索..." v-model="queryData.keyWords" v-on:input.stop="editKeyWords($event)" v-on:keydown="enterKeyToSearch($event)"/>
						<i class="searchBtn" title="搜索." v-on:mousedown="getIdAndImgAndLrc(true)"></i>
					</div>
					<ul class="searchList" v-on:scroll="scrollSearchList">
						<li v-for="item in searchList" v-on:dblclick="playSong(item)">
							<div class="songInfo" title="双击播放">
								<p class="songName">{{item.songname}}{{item.lyric}}</p>
								<p class="singer"> - {{item.singer && item.singer[0].name}}</p>
							</div>
							<div class="btns">
								<i class="play" title="立即播放." v-on:mousedown.stop="playSong(item)"></i>
								<i class="addToList" title="添加到列表." v-on:mousedown.stop="addToPlayList(item, 'add')"></i>
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
				/*播放器的相关信息*/
				componentsBody: null,
				guid: '',
				player: {
					/*当前播放的歌曲*/
					song: {
						isEnojy: false,
						id: 0
					},
					/*audio标签信息*/
					audio: null,
					/*记录播放器组件的一些状态*/
					status: {
						/*音量大小*/
						volume: {
							value: 50,
							progressDotMoveEnable: false
						},
						/*播放的模式，0,1,2分别表示随机，循环，单曲*/
						playMode: 0,
						/*是否显示搜索列表*/
						isShowSearchList: false,
						/*是否显示播放列表*/
						isShowPlayList: false,
						/*播放的状态false和true分别表示暂停和播放*/
						playStatus: false
					}
				},
				/*播放列表*/
				playList: [],
				/*搜索结果列表*/
				searchList: [],
				/*组件拖动的时候，记录组件位置的相关信息*/
				componentPosition: {
					isEnable: false
				},
				/*搜索音乐的时候，请求所需要的一些字段*/
				queryData: {
					keyWords: '',
					pageNum: 1,
					size: 20,
				}
			}
		},
		methods:{
			getIdAndImgAndLrc: function(again) {
				if (!this.queryData.keyWords.trim()) {
					alert('搜索关键词不能为空！');
					return;
				}
				var url = 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp?p=' + (this.queryData.pageNum || 0) + '&n=' + (this.queryData.pageSize || 20) + '&w=' + (this.queryData.keyWords) + '&jsonpCallback=searchMusicCallback&format=jsonp&inCharset=utf8&outCharset=utf-8';
				// var	url = 'http://s.music.qq.com/fcgi-bin/music_search_new_platform?t=0&n=' +  + '&aggr=1&cr=1&loginUin=0&format=jsonp&inCharset=GB2312&outCharset=utf-8&notice=0&platform=jqminiframe.json&needNewCode=0&p=' + (this.queryData.pageNum || 0) + '&catZhida=0&remoteplace=sizer.newclient.next_song&w=' + (this.queryData.keyWords) + '&callback=callback';
				var script = document.createElement("script"), _this = this;
				window.searchMusicCallback = function(data){
					var list = data.data.song.list;
					for (var i = 0; i < list.length; i++) {
						// list[i].id = list[i].f.split("|")[20];
						list[i].id = list[i].media_mid;
						// list[i].img = list[i].f.split("|")[22];
						// list[i].lrc = list[i].f.split("|")[0];
						list[i].isEnojy = false;
					}
					if (again) {
						_this.searchList = [];
					}
					_this.searchList = _this.searchList.concat(list);
					document.body.removeChild(script);
				}
				script.setAttribute('src', url);
				document.body.append(script);
			},
			getKey: function(QQNumber, songObj){
				// var url = 'http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?json=3&loginUin=' + (QQNumber ? QQNumber : 0) + '&format=jsonp&inCharset=GB2312&outCharset=GB2312&notice=0&platform=yqq&needNewCode=0&callback=jsonCallback';
				var url = 'http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?json=3&guid=' + this.guid +'&loginUin=' + QQNumber + '&format=jsonp&inCharset=GB2312&outCharset=GB2312%C2%ACice=0&platform=yqq&jsonpCallback=jsonpCallback&needNewCode=0';
				// var url = 'http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?json=3&loginUin=' + (QQNumber ? QQNumber : 0) + '&format=jsonp&inCharset=GB2312&outCharset=GB2312&notice=0&platform=yqq&needNewCode=0&callback=jsonCallback';

				var script = document.createElement("script"), _this = this;
				window.jsonCallback = function(data){
					console.log(data);
					_this.queryData.key = data.key;
					_this.getSource(songObj);
					document.body.removeChild(script);
				}				
				script.setAttribute('src', url);
				document.body.append(script);
			},
			getSource: function(songObj){
				this.player.audio.stop && this.player.audio.stop();
				this.player.song.musicUrl = '';
				this.player.song.musicUrl = 'http://dl.stream.qqmusic.qq.com/C400' + songObj.id + '.m4a?vkey=' + this.queryData.key + '&guid=' + this.guid + '&uin=632893783&fromtag=66';
				console.log(this.player.song.musicUrl);
				// this.player.song.album = 'http://imgcache.qq.com/music/photo/mid_album_90/' + songObj.img[songObj.img.length - 2] + '/' + songObj.img[songObj.img.length - 1] + '/' + songObj.img + '.jpg';
				// this.player.song.lrcUrl = 'http://music.qq.com/miniportal/static/lyric/' + parseInt(songObj.lrc) % 100 + '/' + songObj.lrc + '.xml';
				// this.player.song.songName = songObj.fsong;
				// this.player.song.singer = songObj.fsinger;
				// this.player.song.singer2 = songObj.fsinger2;
				this.player.song.isEnojy = songObj.isEnojy;
				/*若当前没有播放任何歌曲,获取资源播放歌曲的时候，我们将歌曲添加到播放列表（addToPlayList方法会判断列表里面是否已经存在该歌曲）*/
				if (!this.player.song.id) {
					this.addToPlayList(songObj);
				}
				/*若当前有播放歌曲，并且当前播放歌曲，和我们现在所要播放的不同，也将歌曲添加到播放列表（addToPlayList方法会判断列表里面是否已经存在该歌曲）*/
				else if (this.player.song.id && this.player.song.id != songObj.id) {
					this.addToPlayList(songObj);
				}
				/*除此之外什么也不干*/
				else {
					console.log("正在播放" + songObj.fsong);
				}
				this.player.song.id = songObj.id;
				var _this = this;
				_this.player.status.playStatus = true;
				// _this.player.audio.play();
				this.player.audio.onload = function(){
					_this.player.audio.play();
				};
			},
			showOrHiddenPlayList: function() {
				this.player.status.isShowSearchList = false;
				this.player.status.isShowPlayList = !this.player.status.isShowPlayList;
			},
			showOrHiddenSearchList: function() {
				this.player.status.isShowPlayList = false;
				this.player.status.isShowSearchList = !this.player.status.isShowSearchList;
			},
			editKeyWords: function(event) {
				this.queryData.keyWords = event.target.value;
			},
			playSong: function(songObj) {
				var guid = Math.round(2147483647 * Math.random()) * (new Date).getUTCMilliseconds() % 1e10;
				document.cookie = "pgv_pvid=" + guid + "; Expires=Sun, 18 Jan 2038 00:00:00 GMT; PATH=/; DOMAIN=qq.com;";
				console.log(document.cookie);
				this.guid = guid;
				this.getKey(632893783, songObj);
			},
			addToPlayList: function(songObj,type) {
				for (var i = 0; i < this.playList.length; i++) {
					if (this.playList[i].id == songObj.id) {
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
			enjoyThisSong: function(id) {
				if (!id) {
					for (var i = 0; i < this.playList.length; i++) {
						if(this.playList[i].id == this.player.song.id){
							this.playList[i].isEnojy = !this.playList[i].isEnojy;
							this.$set(this.player.song, 'isEnojy', this.playList[i].isEnojy);
							return;
						}
					}
				} else {
					for (var i = 0; i < this.playList.length; i++) {
						if (this.playList[i].id == id) {
							this.playList[i].isEnojy = !this.playList[i].isEnojy;
							if (id == this.player.song.id) {
								this.$set(this.player.song, 'isEnojy', this.playList[i].isEnojy);
							}
							return;
						}
					}					
				}
			},
			deleteSong: function(item) {
				for (var i = 0; i < this.playList.length; i++) {
					if (item.id == this.playList[i].id) {
						this.playList.splice(i, 1);
					}
				}
			},
			changePlayMode: function() {
				this.player.status.playMode = (this.player.status.playMode + 1) % 3;
				this.player.audio.loop = this.player.status.playMode == 2;
			},
			setProgressDotMoveEnable: function(event) {
				this.player.status.volume.progressDotMoveEnable = true;
				this.player.status.volume.offsetX = event.offsetX;
				this.player.status.volume.offsetY = event.offsetY;
			},
			progressDotMove: function(event) {
				if (this.player.status.volume.progressDotMoveEnable) {
					this.player.status.volume.value = event.offsetX;
					this.player.audio.volume = this.player.status.volume.value / 100;
				}
			},
			setProgressDotMoveDisable: function() {
				this.player.status.volume.progressDotMoveEnable = false;
			},
			changePlayStatus: function() {
				if (!this.player.status.playStatus) {
					if(this.playList.length <= 0) {
						alert('请先添加歌曲！');
						return;						
					} else {
						if (!this.player.song.id) {
							this.playSong(this.playList[0]);
						}
					}
				}
				if (this.player.status.playStatus) {
					this.player.audio.pause();
				} else {
					this.player.audio.play();
				}
				this.player.status.playStatus = !this.player.status.playStatus;
			},
			nextSong: function(type) {
				if (this.playList.length <= 0) {
					alert('请先添加歌曲！');
					return;
				}
				if (!this.player.song.id) {
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
			prevSong: function() {
				if (this.playList.length <= 0) {
					alert('请先添加歌曲！');
					return;
				}		
				if (!this.player.song.id) {
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
			/*根据当前歌曲的id计算下一首歌或者上一首歌*/
			getNextOrPrevSongItem: function(type) {
				for (var index = 0; index < this.playList.length; index++) {
					if (this.playList[index].id == this.player.song.id) {
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
			removeComponent: function() {
				document.querySelector('.vueCloudMusic').style.display = 'none';
			},
			setComponentMoveEnable: function(event) {
				this.componentPosition.isEnable = true;
				this.componentPosition.offsetX = event.offsetX;
				this.componentPosition.offsetY = event.offsetY;
			},
			setComponentMoveDisable: function() {
				this.componentPosition.isEnable = false;
			},
			componentMove: function(event){
				if (this.componentPosition.isEnable) {
					this.componentsBody.style.left = event.clientX-this.componentPosition.offsetX + 'px';
					this.componentsBody.style.top = event.clientY-this.componentPosition.offsetY + 'px';
				}
			},
			scrollSearchList: function(){
				var scrollTop = document.querySelector('.searchList').scrollTop,
					containerHeight = document.querySelector('.back>.searchList').offsetHeight;
				if (this.searchList.length * 28 - containerHeight < scrollTop){
					this.queryData.pageNum++;
					this.getIdAndImgAndLrc(false);
				}
			},
			enterKeyToSearch: function(event) {
				event.keyCode == 13 && this.getIdAndImgAndLrc(true);
			}
		},
		watch: {},
		computed: {},
		mounted: function() {
			var _this = this;
			this.player.audio = document.querySelector('audio');
			this.player.audio.addEventListener('ended', function() {
				_this.nextSong('playFinish');
			});
			this.componentsBody = document.querySelector('.vueCloudMusic');
		}
	}
</script>
<style lang="stylus" scoped>
	icon = 'http://zoone.cc/vue/src/imgs/qqMusicPlayer/icon.png'
	*
		box-sizing border-box
		margin 0
		padding 0
		border 0
		font-size 100%
		vertical-align baseline
	ul, li
		list-styl none
	.vueCloudMusic
		position fixed
		z-index 11
		right 100px
		top 100px
		width 320px
		// width 303px
		// height 329px
		height 70px
		.moveBg
			width 100%
			height 100%
			cursor move
			min-height 50px
		.container
			position absolute
			left 50%
			top 50%
			transform translate(-50%,-50%)
			.panelHeader
				width 297px
				height 42px
				margin 0 auto
				font-size 0
				box-shadow 0 3px 10px rgba(0,0,0,0.2)
				position relative
				background-color white
				z-index 1
				audio
					display none
				.album
					display inline-block
					width 42px
					height 42px
					background-position 50% 50%
					vertical-align middle
					position relative
					z-index 1
					background-color white
					// box-shadow 0 0 3px 3px rgba(0,0,0,0.05)
					&:not(.default)
						background-size cover
					&.default
						background-image url(icon)
						background-position -120px -120px
				.control
					display inline-block
					width 110px
					height 42px
					margin-left 5px
					vertical-align middle
					position relative
					z-index 0
					.info
						background-color white
						position absolute
						width 110px
						height 42px
						left 0
						top 0
						z-index 1
						opacity 1
						transition opacity 0.5s
						p
							line-height 21px
							font-size 12px
							overflow hidden
							text-overflow ellipsis
							white-space nowrap
							text-align center
							&.name
								color rgb(52,52,52)
							&.singer
								color rgb(102,102,102)
							&.emptyPlayList
								position absolute
								left 50%
								top 50%
								transform translate(-50%,-50%)
								line-height 16px
								color rgb(102,102,102)
					.controlBtn
						width 110px
						height 42px
						line-height 42px
						text-align center
						background-color white
						position absolute
						left 0
						top 0
						z-index 0
						opacity 0
						transition opacity 0.5s
						a
						>div
							display inline-block
							vertical-align middle
						a
							width 22px
							height 22px
							cursor pointer
							background-image url(icon)
							&.prev
								background-position 0 -90px
								&:hover
									background-position -30px -90px
							&.next
								background-position -60px -90px
								&:hover
									background-position -90px -90px
						>div
							width 26px
							height 26px
							position relative
							margin 0 10px
							a
								width 26px
								height 26px
								position absolute
								left 50%
								top 50%
								transform translate(-50%,-50%)
								&.play
									background-position -60px -60px
									&:hover
										background-position -90px -60px
								&.pause
									background-position -120px -60px
									&:hover
										background-position -150px -60px
					.songNameAndSinger
						position absolute
						top 42px
						left -45px
						width 293px
						background-color rgba(255,255,255,0.79)
						overflow hidden
						line-height 23px
						height 0
						transition height 0.5s
						text-overflow ellipsis
						white-space nowrap
						text-align center
						box-shadow 0 3px 10px rgba(0,0,0,0.2)
						span
							display inline-block
							font-size 12px
							&.songName
								color rgb(52,52,52)
							&.singer
								color rgb(102,102,102)
					&:hover
						.info
							z-index 0
							opacity 0
						.controlBtn
							z-index 1
							opacity 1
						.songNameAndSinger
							height 23px
				.btn
					position absolute
					top 0
					right 0
					line-height 42px
					z-index 1
					background-color white
					>a
					.volume
					.search
					.close
						display inline-block
						vertical-align middle
						margin 0 4px
					>a
						background-image url(icon)
						cursor pointer
						&.playMode
							margin-left 0
							&.random
								width 15px
								height 13px
								background-position -60px -30px
								&:hover
									background-position -90px -30px
							&.single
								width 15px
								height 15px
								background-position 0 -60px
								&:hover
									background-position -30px -60px
							&.loop
								width 15px
								height 15px	
								background-position -120px -30px
								&:hover
									background-position -150px -30px
						&.enjoy
							width 15px
							height 13px
							background-position 0 0
							&:hover
								background-position -30px 0
							&.enable
								background-position -30px 0
						&.showList
							width 13px
							height 11px
							background-position -120px 0
							&:hover
								background-position -150px 0
							&.enable
								background-position -150px 0
					.volume
						width 15px
						height 13px
						background-image url(icon)
						cursor pointer
						background-position 0 -30px
						position relative
						&:hover
							background-position -30px -30px
							.outer
								display block
						.outer
							display none
							height 46px
							width 100%
							position absolute
							left 50%
							top 0
							transform translate(-50%,-100%)
							.volumeControl
							.boxShadow
								position absolute
								width 114px
								height 32px
								background-color white
								left 50%
								top 0
								transform translate(-50%,0)
								border-radius 2px
								>.dot
									position absolute
									left 50%
									bottom 6px
									transform translate(-50%,100%) rotate(-135deg)
									border-top 10px solid white
									border-right 10px solid transparent
									border-bottom 0 solid
									border-left 0 solid
							.volumeControl
								z-index 1
								text-align center
								line-height 32px
								cursor default
								.progress
									display inline-block
									height 8px
									border-radius 4px
									width 100px
									border-left-color rgb(104,104,104)
									border-right-color rgb(141,141,141)
									// border-left-width 50px
									// border-right-width 50px
									border-style solid
									position absolute
									left 50%
									top 50%
									transform translate(-50%,-50%)
									cursor pointer
									vertical-align middle
									z-index 0
									&.cover
										border none
										width 100px
										height 12px
									.progressDot
										position absolute
										width 12px
										height 12px
										box-shadow 0 0 5px 3px rgba(0,0,0,0.1)
										border-radius 50%
										top 50%
										transform translate(-50%,-50%)
										background-color white
										&:after
											content " "
											font-size 0
											left 50%
											top 50%
											transform translate(-50%,-50%)
											width 4px
											height 4px
											border-radius 50%
											background-color rgb(104,104,104)
											position absolute
							.boxShadow
								z-index 0
								box-shadow 0 0 5px 3px rgba(0,0,0,0.1)
								>.dot
									box-shadow 0 0 5px 3px rgba(0,0,0,0.1)
					.close
						display inline-block
						width 16px
						height @width
						position relative
						cursor pointer
						i
							position absolute
							left 50%
							top 50%
							background-color rgb(132,132,132)
							&:nth-child(1)
								transform translate(-50%,-50%) rotate(45deg)
								width 100%
								height 1px
							&:nth-child(2)
								transform translate(-50%,-50%) rotate(45deg)
								height 100%
								width 1px
						&:hover
							i
								background-color rgb(199,48,48)
					.search
						background-image url(icon)
						cursor pointer
						display inline-block
						width 15px
						height 15px
						background-position -60px 0
						&:hover
							background-position -90px 0
						&.enable
							background-position -90px 0
			.panelBody
				width 294px
				margin 0 auto
				position relative
				perspective 800
				-webkit-perspective 800
				height 0
				.face
					backface-visibility hidden
					transform rotateY(0)
					position absolute
					width 100%
					// height 280px
					transition transform 0.5s,height 0.5s
					overflow hidden
					box-shadow 0 3px 10px rgba(0,0,0,0.1)
					height 0
					background-color rgba(255,255,255,0.9)
					&.enable
						height 280px
					&.flip
						transform rotateY(180deg)
					>.playList
						height 280px
						overflow-y auto
						box-shadow 0 3px 10px rgba(0,0,0,0.1)
						&:-webkit-scrollbar
							background-color transparent
							width 8px
						&::-webkit-scrollbar
							background-color transparent
							width 8px
						&:-webkit-scrollbar-thumb
							background-color rgba(0,0,0,0.1)
							-webkit-border-radius 4px
							opacity 0
							width 8px
						&::-webkit-scrollbar-thumb
							background-color rgba(0,0,0,0.1)
							-webkit-border-radius 4px
							opacity 0
							width 8px
						li
							position relative
							cursor default
							&:nth-child(2n+1)
								background-color rgba(255,255,255,0.95)
								&:hover
									background-color rgba(243,243,244,0.95)
									.btns
										display block
									>.enjoy
										display block
								&.current
									background-color rgba(232,232,234,0.95)
							&:nth-child(2n)
								background-color rgba(250,250,251,0.95)
								&:hover
									background-color rgba(243,243,244,0.95)
									.btns
										display block
									>.enjoy
										display block
								&.current
									background-color rgba(232,232,234,0.95)
							i
								display inline-block
								vertical-align middle
								&.playStatus
									width 15px
									height 28px
									position relative
									&.enable
										&:after
											content " "
											font-size 0
											border-top 5px solid transparent
											border-left 0 solid
											border-bottom 5px solid transparent
											border-left 7px solid rgb(199,48,48)
											left 50%
											top 50%
											position absolute
											transform translate(-50%,-50%)
							.songInfo
								display inline-block
								width 200px
								margin-left 5px
								vertical-align middle
								overflow hidden
								text-overflow ellipsis
								white-space nowrap
								font-size 13px
								p
									display inline-block
								.songName
									color rgb(55,55,55)
								.singer
									color rgb(103,103,103)
							>.enjoy
								width 14px
								height 13px
								background-image url(icon)
								background-position 0 -120px
								display inline-block
								vertical-align middle
								cursor pointer
								margin-left 5px
								position absolute
								right 10px
								transform translate(0,-50%)
								top 50%
								display none
								&:hover
									background-position -30px -120px
								&.enable
									background-position -30px -120px
									display block						
							.btns
								position absolute
								top 50%
								right 30px
								transform translate(0,-50%)
								font-size 0
								display none
								i
									display inline-block
									vertical-align middle
									cursor pointer
									margin-left 5px
									&.play
										position relative
										width 7px
										height 10px
										margin-left 7px
										&:after
											content ""
											position absolute
											left 50%
											top 50%
											transform translate(-50%,-50%)
											width 0
											height 0
											border-top 5px solid transparent
											border-right 0 solid
											border-bottom 5px solid transparent
											border-left 7px solid rgb(132,132,132)
										&:hover
											&:after
												content ""
												position absolute
												left 50%
												top 50%
												transform translate(-50%,-50%)
												width 0
												height 0
												border-top 5px solid transparent
												border-right 0 solid
												border-bottom 5px solid transparent
												border-left 7px solid rgb(199,48,48)
									// &.enjoy
									// 	width 14px
									// 	height 13px
									// 	background-image url(icon)
									// 	background-position 0 -120px
									// 	&:hover
									// 		background-position -30px -120px
									// 	&.enable
									// 		background-position -30px -120px
									&.delete
										width 13px
										height 14px
										background-image url(icon)
										background-position -120px -90px
										margin-left 9px
										&:hover
											background-position -150px -90px
					.playListIsEmpty
						position relative
						height 100%
						span
							position absolute
							left 50%
							top 50%
							transform translate(-50%,-50%)
							width 80%
							text-align center
							line-height 18px
							font-size 12px
							color rgb(200,200,200)
				>.back
					height 280px
					width 100%
					position absolute
					left 0
					top 0
					box-shadow 0 3px 10px rgba(0,0,0,0.1)
					backface-visibility hidden
					transform rotateY(180deg)
					overflow hidden
					transition transform 0.5s,height 0.5s
					height 0
					cursor default
					&.enable
						height 280px					
					&.flip
						transform rotateY(0)
					.input
						line-height 28px
						font-size 0
						text-align center
						// background-color rgba(0,0,0,0.1)
						background-color rgba(240,240,240,0.9)
						i
							display inline-block
							cursor pointer
							vertical-align middle
							background-image url(icon)
							&.back
								width 13px
								height 14px
								background-position -60px -120px
								&:hover
									background-position -90px -120px
							&.searchBtn
								width 15px
								height 15px
								background-position -60px 0
								&:hover
									background-position -90px 0
						input
							margin 0 8px
							vertical-align middle
							width 230px
							border none
							height 20px
							line-height 20px
							text-indent 5px
							border-radius 2px
							background-color rgba(255,255,255,0.9)
							font-size 12px
							cursor text
					.searchList
						height 252px
						overflow-y auto
						background-color rgba(255,255,255,0.9)
						&:-webkit-scrollbar
							background-color transparent
							width 8px
						&::-webkit-scrollbar
							background-color transparent
							width 8px
						&:-webkit-scrollbar-thumb
							background-color rgba(0,0,0,0.1)
							-webkit-border-radius 4px
							opacity 0
							width 8px
						&::-webkit-scrollbar-thumb
							background-color rgba(0,0,0,0.1)
							-webkit-border-radius 4px
							opacity 0
							width 8px
						li
							position relative
							height 28px
							line-height 28px
							&:nth-child(2n+1)
								background-color rgba(255,255,255,0.95)
								&:hover
									background-color rgba(243,243,244,0.95)
									.btns
										display block
								&.current
									background-color rgba(232,232,234,0.95)
							&:nth-child(2n)
								background-color rgba(250,250,251,0.95)
								&:hover
									background-color rgba(243,243,244,0.95)
									.btns
										display block									
								&.current
									background-color rgba(232,232,234,0.95)
							.songInfo
								display inline-block
								width 220px
								margin-left 5px
								vertical-align middle
								overflow hidden
								text-overflow ellipsis
								white-space nowrap
								font-size 12px
								margin-left 15px
								p
									display inline-block
								.songName
									color rgb(55,55,55)
								.singer
									color rgb(103,103,103)
							.btns
								position absolute
								top 50%
								right 10px
								transform translate(0,-50%)
								font-size 0
								display none
								i
									display inline-block
									vertical-align middle
									cursor pointer
									margin-left 5px
									&.play
										position relative
										width 7px
										height 10px
										margin-left 7px
										&:after
											content ""
											position absolute
											left 50%
											top 50%
											transform translate(-50%,-50%)
											width 0
											height 0
											border-top 5px solid transparent
											border-right 0 solid
											border-bottom 5px solid transparent
											border-left 7px solid rgb(132,132,132)
										&:hover
											&:after
												content ""
												position absolute
												left 50%
												top 50%
												transform translate(-50%,-50%)
												width 0
												height 0
												border-top 5px solid transparent
												border-right 0 solid
												border-bottom 5px solid transparent
												border-left 7px solid rgb(199,48,48)
									&.addToList
										position relative
										width 16px
										height 16px
										&:before
											content " "
											position absolute
											left 50%
											top 50%
											transform translate(-50%,-50%)
											width 70%
											height 1px
											background-color rgb(132,132,132)
											font-size 0
										&:after
											content " "
											position absolute
											left 50%
											top 50%
											transform translate(-50%,-50%)
											height 70%
											width 1px
											background-color rgb(132,132,132)
											font-size 0
										&:hover
											&:before
												background-color rgb(199,48,48)
											&:after
												background-color rgb(199,48,48)
</style>
