<template>
  <v-dialog v-model="mainData.bookmarks.import.show" width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" class="mx-2 mb-2 flex-grow-1">Import</v-btn>
    </template>
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">Import Bookmarks</v-card-title>
      <v-card-text>
        <v-tabs
          v-model="tab"
          centered
        >
          <v-tab>
            URL/Text
          </v-tab>
        </v-tabs>
        <div class="pt-4">
          <v-tabs-items v-model="tab">
            <v-tab-item>
              <v-textarea
                label="Encoded Bookmarks (url)"
                v-model="mainData.bookmarks.import.urlData"
                counter
                no-resize
                class="lba"
              ></v-textarea>
              <div class="d-flex flex-wrap my-3">
                <v-btn @click="loadTextFile" class="mx-2 mb-2 flex-grow-1">Load text file</v-btn>
              </div>
              <input type="file" ref="txtFile" @change="selectTxtFile" accept=".txt" style="display:none">
              <v-alert dense outlined type="error" v-if="decodeError"><b>Decoding error:</b> {{ decodeError }}</v-alert>
              <v-alert dense outlined type="warning" v-else-if="!decodedObj"><b>Please insert url or open text file</b></v-alert>
            </v-tab-item>
          </v-tabs-items>
          <template v-if="decodedObj">
            <v-alert dense outlined type="info">
              <b>Bookmarks:</b> {{ countBookmarks }}<br>
              <b>New Bookmarks:</b> {{ newBookmarks }}<br>
              <b>Changed Bookmarks:</b> {{ changedBookmarks }}<br>
            </v-alert>
            <v-alert dense outlined type="error" v-if="countBookmarks === 0">No Bookmarks in file!</v-alert>
            <v-alert dense outlined type="success" v-else-if="newBookmarks === 0 && changedBookmarks === 0">Loaded bookmarks correspond to the existing ones.</v-alert>
            <div class="d-flex flex-wrap mt-3">
              <!-- <v-btn @click="loadTextFile" class="mx-2 mb-2 flex-grow-1">Load text file</v-btn> -->
              <!-- <v-btn @click="copyBookmarksUrl" :disabled="!xxx" class="mx-2 mb-2 flex-grow-1">Copy to clipboard</v-btn> -->
            </div>
          </template>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="mainData.bookmarks.import.show = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ToolsetLeftBookmarksImport',
  props: {
    'mainData': Object,
  },
  data: () => ({
    tab: null,
    decodeError: null,
    decodedObj: null
  }),
  mounted () {
    this.updateData()
  },
  computed: {
    countBookmarks () {
      return this.decodedObj ? Object.keys(this.decodedObj).length : 0
    },
    newBookmarks () {
      return this.decodedObj ? Object.keys(this.decodedObj).filter(b => !this.mainData.bookmarks.elements[b]).length : 0
    },
    changedBookmarks () {
      return this.decodedObj ? Object.keys(this.decodedObj).filter(b => this.mainData.bookmarks.elements[b] && JSON.stringify(this.decodedObj[b]) !== JSON.stringify(this.mainData.bookmarks.elements[b])).length : 0
    }
  },
  methods: {
    updateData () {
      this.decodedObj = null
      this.decompressUrlData()
    },
    decompressUrlData () {
      if (this.tab === 0 && this.mainData.bookmarks.import.urlData) {
        var codec = require('json-url')('lzma')
        let cData = this.mainData.bookmarks.import.urlData
        if (cData.indexOf('bookmarks=') > -1) {
          let cdM = cData.match(/bookmarks=([^&]+)/i)
          if (cdM && cdM[1]) {
            cData = cdM[1]
          }
        }
        codec.decompress(cData).then(json => {
          this.decodedObj = json
          console.log('bookmarks from url', json)
          this.decodeError = null
        }).catch((err) => {
          console.log(err)
          this.decodeError = 'corrupted input'
          this.decodedObj = null
        })
      }
    },
    loadTextFile () {
      this.$refs.txtFile.click()
    },
    selectTxtFile () {
      if (this.$refs.txtFile && this.$refs.txtFile.files) {
        console.log(this.$refs.txtFile.files[0]);
        let file = this.$refs.txtFile.files[0]
        if (file) {
          if (file.type === 'text/plain') {
            let reader = new FileReader()
            reader.readAsText(file, 'UTF-8')
            reader.onload =  evt => {
              let cData = evt.target.result
              if (cData.indexOf('bookmarks=') > -1) {
                let cdM = cData.match(/bookmarks=([^&]+)/i)
                if (cdM && cdM[1]) {
                  cData = cdM[1]
                }
              }
              this.mainData.bookmarks.import.urlData = cData
              this.$refs.txtFile.value = ''
            }
            reader.onerror = evt => {
              console.error(evt)
            }
          } else {
            alert('File type is not "text/plain"!')
          }
        }
      }
    }
  },
  watch: {
    'mainData.bookmarks.import.show' () {
      this.updateData()
    },
    'mainData.bookmarks.import.urlData' () {
      this.updateData()
    }
  }
}
</script>

<style scoped>
  .lba {
    line-break: anywhere;
  }
</style>
