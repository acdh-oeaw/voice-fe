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
              <v-alert dense outlined type="error" v-if="decodeError"><b>Decoding error:</b> {{ decodeError }}</v-alert>
              <template v-else-if="decodedObj">
                <v-alert dense outlined type="info"><b>Bookmarks:</b> {{ Object.keys(decodedObj).length }}</v-alert>
                <div class="d-flex flex-wrap mt-3">
                  <!-- <v-btn @click="saveBookmarksFile" :disabled="!xxx" class="mx-2 mb-2 flex-grow-1">Save as text file</v-btn> -->
                  <!-- <v-btn @click="copyBookmarksUrl" :disabled="!xxx" class="mx-2 mb-2 flex-grow-1">Copy to clipboard</v-btn> -->
                </div>
              </template>
              <v-alert dense outlined type="warning" v-else><b>Please insert url or open text file</b></v-alert>
            </v-tab-item>
          </v-tabs-items>
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
  },
  methods: {
    updateData () {
      this.decompressUrlData()
    },
    decompressUrlData () {
      if (this.mainData.bookmarks.import.urlData) {
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
      } else {
        this.decodedObj = null
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
