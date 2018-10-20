(function (Vue) {
    Vue.component('lrc', {
        template: '#lrc-covers',
        data: function () {
            return {
                lrcItems: [],
                displayNum: 6,
                searchKey: '',
                playingMusic: false,
                songTitle: '',
                songLink: 'https://haoyellow.cn/static/songs/ZARD - 二人の夏.mp3',
                everLoadMore: false,
                playStatus: 'Waiting..'
            }
        },
        computed: {
            displayItems: function () {
                if (this.searchKey) {
                    var self = this;
                    return this.lrcItems.filter(function (item) {
                        return !!item.title.match(new RegExp(self.searchKey.replace(/\s/g, '\\s'), 'i'))
                    })
                }
                return this.lrcItems.slice(0, this.displayNum);
            },
            hasMore: function () {
                if (this.searchKey) {
                    return false;
                }
                return this.displayNum < this.lrcItems.length;
            }
        },
        mounted: function () {
            this.fetchLrcData('zard_lrc.json');
        },
        methods: {
            fetchLrcData: function (filename) {
                var self = this;
                this.$http.get('/zardsongs/data/'+filename)
                    .catch(function (err) {
                        return self.$http.get('../data/'+filename);
                    })
                    .then(function (lrcItems) {
                        return lrcItems.json();
                    })
                    .then(function (lrcItems) {
                        this.lrcItems = this.lrcItems.concat(lrcItems);
                    });

            },
            splitLines: function (str) {
                var reg = /\r\n|\n|\r/;
                var m = str.match(reg);
                if (!m) return '<span>'+str+'</span>';
                return '<span>' + str.slice(0, m.index) + '</span>' + this.splitLines(str.slice(m.index + m[0].length));
            },
            playMusic: function (songTitle, songLink) {
                var me = this;
                this.playStatus = 'Waiting..';
                var mp = this.$refs.musicPlayer;
                this.playingMusic = true;
                this.songTitle = songTitle;
                if (songLink) {
                    mp.src = songLink;
                } else {
                    mp.src = 'https://haoyellow.cn/static/songs/ZARD - 二人の夏.mp3';
                }
                mp.pause();
                mp.load();
                mp.play();
                mp.addEventListener('loadeddata', function () {
                    me.playStatus = 'Enjoying..'
                });
                mp.addEventListener('ended', function () {
                   me.playingMusic = false;
                });
            },
            stopMusic: function () {
                this.playingMusic = false;
                this.$refs.musicPlayer.pause();
            },
            loadMore: function () {
                this.displayNum += 6;
                if (!this.everLoadMore) {
                    this.fetchLrcData('zard_lrc_1.json');
                    this.everLoadMore = true;
                }
            }
        }
    });
    new Vue({
        el: '#app'
    })
})(window.Vue);
