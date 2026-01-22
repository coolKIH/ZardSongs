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
                songLink: '',
                playStatus: 'Loading..',
                loadedDataHandler: null,
                endedHandler: null
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
                this.$http.get('./data/'+filename)
                    .catch(function (err) {
                        // Fallback to alternative relative path
                        return self.$http.get('data/'+filename);
                    })
                    .then(function (lrcItems) {
                        return lrcItems.json();
                    })
                    .then(function (lrcItems) {
                        self.lrcItems = self.lrcItems.concat(lrcItems);
                    });

            },
            splitLines: function (str) {
                var reg = /\r\n|\n|\r/;
                var m = str.match(reg);
                if (!m) return '<span>'+str+'</span>';
                return '<span>' + str.slice(0, m.index) + '</span>' + this.splitLines(str.slice(m.index + m[0].length));
            },
            playMusic: function (songTitle, songLink) {
                if (!songLink) {
                    return;
                }
                var me = this;
                this.playStatus = 'Loading..';
                var mp = this.$refs.musicPlayer;
                mp.pause();
                
                // Remove old event listeners if they exist
                if (this.loadedDataHandler) {
                    mp.removeEventListener('loadeddata', this.loadedDataHandler);
                }
                if (this.endedHandler) {
                    mp.removeEventListener('ended', this.endedHandler);
                }
                
                mp.src = songLink;
                this.playingMusic = true;
                this.songTitle = songTitle;
                
                // Create new event handlers and store references
                this.loadedDataHandler = function () {
                    me.playStatus = 'Enjoying..'
                };
                this.endedHandler = function () {
                    me.playingMusic = false;
                };
                
                // Add event listeners
                mp.addEventListener('loadeddata', this.loadedDataHandler);
                mp.addEventListener('ended', this.endedHandler);
                
                mp.load();
                mp.play();
            },
            stopMusic: function () {
                this.playingMusic = false;
                this.$refs.musicPlayer.pause();
            },
            loadMore: function () {
                this.displayNum += 6;
            }
        }
    });
    new Vue({
        el: '#app'
    })
})(window.Vue);
