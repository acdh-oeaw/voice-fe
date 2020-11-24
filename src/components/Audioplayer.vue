<template>
  <div class="audio-frm">
    <div v-bind:class="{ 'audioplayer': true, loading: !loaded, paused: paused, playing: playing }">
      <div class="d-flex">
        <div class="audiobtn d-flex mx-2">
          <button @click="backward" class="mx-1"><v-icon>mdi-rewind</v-icon></button>
          <button @click="togglePlayPause" class="mx-1"><v-icon>{{ 'mdi-' + ((paused) ? 'play' : 'pause') }}</v-icon></button>
          <button @click="forward" class="mx-1"><v-icon>mdi-fast-forward</v-icon></button>
        </div>
        <v-progress-linear
          :value="aPosProz"
          color="indigo darken-4"
          height="25"
          v-on:click="setAudioPos"
        >
          <template v-slot:default>
            <div class="white--text mx-2">{{ starttime }}</div>
            <div class="white--text flex-grow-1 text-center">{{ akttime }}</div>
            <div class="white--text mx-2">{{ enditme }}</div>
          </template>
        </v-progress-linear>
      </div>
    </div>
    <audio><source :src="audiourl" type="audio/mp3"></audio>
  </div>
</template>

<script>
export default {
  name: 'Audioplayer',
  props: {
    'audiourl': String
  },
  data: () => ({
    audio: undefined,
    audioInterval: undefined,
    loaded: false,
    lPos: -1,
    aPosRel: 0,
    aPosProz: 0,
    paused: true,
    playing: false,
    audioPosition: 0,
    audioDuration: 0
  }),
  mounted () {
    console.log('Audioplayer', this.audiourl)
    this.$nextTick(() => {
      this.audio = this.$el.querySelectorAll('audio')[0]
      this.audio.addEventListener('loadeddata', this.audioLoaded)
      this.audio.addEventListener('pause', this.audioPlayPause)
      this.audio.addEventListener('play', this.audioPlayPause)
      this.audioInterval = setInterval(this.audioPlayingUI, 100)
    })
  },
  beforeDestroy () {
    this.pause()
    clearInterval(this.audioInterval)
    this.audio.removeEventListener('loadeddata', this.audioLoaded)
    this.audio.removeEventListener('pause', this.audioPlayPause)
    this.audio.removeEventListener('play', this.audioPlayPause)
  },
  computed: {
    starttime () {
      return this.secondsToDuration(0)
    },
    akttime () {
      return this.secondsToDuration(this.audioPosition)
    },
    enditme () {
      return this.secondsToDuration(this.audioDuration)
    }
  },
  methods: {
    play () {
      if ((this.playing && !this.paused) || !this.loaded) return
      this.paused = false
      this.playing = true
      this.audio.play()
    },
    pause () {
      if ((!this.playing && this.paused) || !this.loaded) return
      this.paused = true
      this.playing = false
      this.audio.pause()
    },
    togglePlayPause () {
      if (this.paused) {
        this.play()
      } else {
        this.pause()
      }
    },
    setAudioPos (e) {
      var pos = e.target.getBoundingClientRect()
      var seekPos = (e.clientX - pos.left) / pos.width
      this.audio.currentTime = this.audioDuration * seekPos
    },
    forward () {
      if (!this.loaded) return
      this.audio.currentTime = this.audio.currentTime + 10
    },
    backward () {
      if (!this.loaded) return
      this.audio.currentTime = this.audio.currentTime - 10
    },
    audioPlayPause (e) {
      if (e.type === 'pause') {
        this.paused = true
        this.playing = false
      }
    },
    audioPlayingUI () {
      if (this.loaded) {
        this.audioPosition = this.audio.currentTime
        if (this.audioPosition !== this.lPos) {
          this.aPosRel = this.audioPosition / this.audioDuration
          this.aPosProz = this.aPosRel * 100
          this.lPos = this.audioPosition
        }
      }
    },
    audioLoaded () {
      if (this.audio.readyState >= 2) {
        this.loaded = true
        this.audioDuration = this.audio.duration
      } else {
        this.playing = false
        this.paused = true
        this.loaded = false
        throw new Error('Audiodatei konnte nicht geladen werden!')
      }
    },
    secondsToDuration: function (sec) {
      var v = ''
      if (sec < 0) { sec = -sec; v = '-' }
      var h = parseInt(sec / 3600)
      sec %= 3600
      var m = parseInt(sec / 60)
      var s = sec % 60
      return v + ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2) + ':' + ('0' + parseInt(s)).slice(-(2))
    }
  }
}
</script>

<style scoped>
  .audio-frm {
    background: #eee;
  }
  audio {
    display: block;
    width: 1px;
    height: 1px;
  }
  .audiobtn > button:hover, .audiobtn > button:focus {
    outline: none;
    background-color: #d9e3e8;
  }
  .v-progress-linear >>> .v-progress-linear__content {
    pointer-events: none;
  }
</style>
