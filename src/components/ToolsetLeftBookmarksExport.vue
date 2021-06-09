<template>
  <v-dialog v-model="show" width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" :disabled="Object.keys(mainData.bookmarks.elements).length < 1">Export</v-btn>
    </template>
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">Export Bookmarks</v-card-title>
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
                label="Encoded Bookmarks"
                :value="origin + '/#/tool?bookmarks=' + bookmarksCompressed"
                @focus="copyBookmarksUrl"
                ref="encBookmarksUrl"
                counter
                no-resize
                readonly
                :loading="!bookmarksCompressed"
                class="lba"
              ></v-textarea>
              <div class="d-flex flex-wrap mt-3">
                <v-btn @click="saveBookmarksFile" :disabled="!bookmarksCompressed" class="mx-2 mb-2 flex-grow-1">Save as text file</v-btn>
                <v-btn @click="copyBookmarksUrl" :disabled="!bookmarksCompressed" class="mx-2 mb-2 flex-grow-1">Copy to clipboard</v-btn>
              </div>
            </v-tab-item>
          </v-tabs-items>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="show = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ToolsetLeftBookmarksExport',
  props: {
    'mainData': Object,
  },
  data: () => ({
    show: false,
    tab: null,
    origin: window.location.origin,
    bookmarksCompressed: null
  }),
  mounted () {
  },
  computed: {
  },
  methods: {
    saveBookmarksFile () {
      if (this.bookmarksCompressed) {
        var blob = new Blob([this.origin + '/#/tool?bookmarks=' + this.bookmarksCompressed], { type: "text/plain;charset=utf-8" })
        const a = document.createElement('a')
        a.href= URL.createObjectURL(blob)
        a.download = 'bookmarks.txt'
        a.click()
      }
    },
    copyBookmarksUrl () {
      if (this.bookmarksCompressed && this.$refs.encBookmarksUrl && this.$refs.encBookmarksUrl.$el) {
        let ta = this.$refs.encBookmarksUrl.$el.querySelector('textarea')
        if (ta) {
          ta.focus()
          ta.select()
          ta.setSelectionRange(0, 999999)
          document.execCommand("copy")
        }
      }
    },
    updateBookmarkCompression () {
      this.bookmarksCompressed = null
      var codec = require('json-url')('lzma')
      codec.compress(this.mainData.bookmarks.elements).then(result => {
        this.bookmarksCompressed = result
        // codec.decompress(result).then(json => console.log(json))
      })
    },
  },
  watch: {
    show () {
      if (this.show) {
        this.updateBookmarkCompression()
      }
    }
  }
}
</script>

<style scoped>
  .lba {
    line-break: anywhere;
  }
</style>
