<template>
  <v-dialog v-model="show" width="550">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" :disabled="Object.keys(mainData.bookmarks.elements).length < 1" class="mx-2 mb-2 flex-grow-1">Export</v-btn>
    </template>
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">Export Bookmarks</v-card-title>
      <v-card-text>
        <div class="pt-4">
          <v-textarea
            label="Encoded Bookmarks (url)"
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
            <v-btn @click="copyBookmarksUrl" :disabled="!bookmarksCompressed" class="mx-2 mb-2 flex-grow-1">Copy URL to clipboard</v-btn>
            <v-btn @click="saveBookmarksFile" :disabled="!bookmarksCompressed" class="mx-2 mb-2 flex-grow-1">Save URL as text file</v-btn>
          </div>
          <div class="d-flex flex-wrap mt-3">
            <v-btn @click="saveBookmarksTable('xlsx')" class="mx-2 mb-2 flex-grow-1"><v-icon class="mr-2">mdi-microsoft-excel</v-icon>Save as XLSX file</v-btn>
            <!-- <v-btn @click="saveBookmarksTable('csv')" class="mx-2 mb-2 flex-grow-1"><v-icon class="mr-2">mdi-file-delimited-outline</v-icon>Save as CSV file</v-btn> -->
          </div>
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
const ExcelJS = require('exceljs')

export default {
  name: 'ToolsetLeftBookmarksExport',
  props: {
    'mainData': Object,
  },
  data: () => ({
    show: false,
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
        a.download = this.getFilename() + '.txt'
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
    getFilename () {
      let aTime = new Date()
      return 'voice-bookmarks_' + aTime.getFullYear() + '-' + ('0' + (aTime.getMonth()+1)).slice(-2) + '-' + ('0' + aTime.getDate()).slice(-2) + '_' + ('0' + aTime.getHours()).slice(-2) + '-' + ('0' + aTime.getMinutes()).slice(-2) + '-' + ('0' + aTime.getSeconds()).slice(-2)
    },
    saveBookmarksTable (fileType) {
      console.log('saveBookmarksTable', fileType, this.mainData.bookmarks.elements)
      var aFileType = fileType === 'csv' ? 'csv' : 'xlsx'
      let aTime = new Date()
      let aDateTime = aTime.toLocaleString('en-US')
      const wb = new ExcelJS.Workbook()
      wb.title = 'VOICE 3.0'
      wb.subject = 'Bookmarks'
      wb.creator = 'VOICE 3.0'
      wb.created = aTime
      var ws
      ws = wb.addWorksheet('Bookmarks')
      ws.addRow(['VOICE 3.0 - Bookmarks'])
      ws.addRow(['Versions: FE ' + this.mainData.version + ' - API: ' + this.mainData.apiVersion])
      ws.addRow([aDateTime])
      ws.addRow()
      let aRow = ws.addRow(['nr', 'category', 'uId', 'added', 'comment'])
      ws.columns = [
        { key: 'nr', width: 5 },
        { key: 'category', width: 20 },
        { key: 'uId', width: 20 },
        { key: 'added', width: 20 },
        { key: 'comment', width: 260 }
      ]
      aRow.style = { font: { bold: true } }
      aRow.border = { bottom: { style: 'medium' } }
      aRow.eachCell(c => {
        c.style = { font: { bold: true } }
        c.border = { bottom: { style: 'medium' } }
      })
      let dg = 0
      Object.keys(this.mainData.bookmarks.elements).map(e => {
        return {
          id: e,
          category: this.mainData.bookmarks.elements[e].category,
          added: this.mainData.bookmarks.elements[e].added,
          comment: this.mainData.bookmarks.elements[e].comment
        }
      }).sort((a, b) => {
        if (a.category === 'None') {
          return -1
        }
        if (b.category === 'None') {
          return 1
        }
        return a.category.toLowerCase().localeCompare(b.category.toLowerCase())
      }).forEach(e => {
        ws.addRow([dg + 1, e.category, e.id, (new Date(e.added)).toLocaleString('en-US'), e.comment])
        dg++
      })
      // console.log(uList)
      if (aFileType === 'xlsx') {
        wb.xlsx.writeBuffer().then(this.saveFile.bind(null, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', aFileType, this.getFilename()))
      } else if (aFileType === 'csv') {
        let out = ''
        wb.eachSheet(s => {
          s.eachRow(r => {
            let cOut = []
            r.eachCell(c => {
              let cVal = c
              if (cVal instanceof Date) {
                cVal = cVal.toLocaleString('en-US')
              }
              cVal = cVal === null || cVal === undefined ? '' : cVal.toString()
              cVal = cVal.replace(/"/g, '""')
              if (cVal.search(/("|;|\n)/g) >= 0) {
                cVal = '"' + cVal + '"'
              }
              cOut.push(cVal)
            })
            out += cOut.join(';') + '\n'
          })
          out += '\n'
        })
        this.saveFile('text/csv;charset=utf-8', aFileType, this.getFilename(), out)
      }
    },
    saveFile (mimeType, aFileType, aFilename, buffer) {
      if (buffer) {
        // console.log(buffer)
        if (buffer) {
          let blob = new Blob([buffer], {type: mimeType})
          const a = document.createElement('a')
          a.href= URL.createObjectURL(blob)
          a.download = aFilename + '.' + aFileType
          a.click()
        }
      } else {
        alert('Error on creating file!')
      }
    }
  },
  watch: {
    show () {
      if (this.show) {
        this.updateBookmarkCompression()
      }
    },
    'mainData.bookmarks.import.show' () {
      if (this.mainData.bookmarks.import.show) {
        this.show = false
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
