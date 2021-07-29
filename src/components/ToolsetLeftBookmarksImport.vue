<template>
  <v-dialog v-model="mainData.bookmarks.import.show" width="550">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" class="mx-2 mb-2 flex-grow-1">Import</v-btn>
    </template>
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">Import Bookmarks</v-card-title>
      <v-card-text>
        <div class="pt-4">
          <v-textarea
            label="Encoded Bookmarks (url)"
            v-model="mainData.bookmarks.import.urlData"
            counter
            no-resize
            class="lba"
            :disabled="mainData.bookmarks.import.external || isTable"
            v-if="!isTable"
          ></v-textarea>
          <div class="d-flex flex-wrap my-3" v-if="!mainData.bookmarks.import.external">
            <v-btn @click="closeFile" class="mx-2 mb-2 flex-grow-1" v-if="isTable">Close File</v-btn>
            <v-btn @click="loadFile" class="mx-2 mb-2 flex-grow-1" v-else>Load file</v-btn>
          </div>
          <input type="file" ref="txtFile" @change="selectTxtFile" accept=".txt,.xlsx" style="display:none">
          <v-alert dense outlined type="error" v-if="decodeError"><b>Decoding error:</b> {{ decodeError }}</v-alert>
          <v-alert dense outlined type="warning" v-else-if="!decodedObj"><b>Please insert url or open file</b></v-alert>
          <template v-if="decodedObj">
            <v-alert dense outlined type="info">
              <b>Bookmarks:</b> {{ countBookmarks }}<br>
              <b>New Bookmarks:</b> {{ newBookmarks }}<br>
              <b>Changed Bookmarks:</b> {{ changedBookmarks }}<br>
            </v-alert>
            <v-alert dense outlined type="error" v-if="countBookmarks === 0">No Bookmarks in file!</v-alert>
            <v-alert dense outlined type="success" v-else-if="newBookmarks === 0 && changedBookmarks === 0">Loaded bookmarks correspond to the existing ones.</v-alert>
            <template v-else>
              <div class="d-flex flex-wrap mt-3">
                <v-switch v-model="delBookmarks" label="Delete all existing Bookmarks" v-if="Object.keys(this.mainData.bookmarks.elements).length > 0"></v-switch>
                <v-switch v-model="overwriteBookmarks" label="Overwrite existing Bookmarks" v-if="!delBookmarks && changedBookmarks > 0 && newBookmarks > 0"></v-switch>
                <v-alert dense outlined type="warning" v-if="!delBookmarks && changedBookmarks > 0 && newBookmarks === 0" class="w-100"><b>Exisiting bookmarks will be overwritten</b></v-alert>
              </div>
              <div class="d-flex flex-wrap mt-3">
                <v-btn @click="importBookmarks" class="mx-2 mb-2 flex-grow-1">Import Bookmarks</v-btn>
              </div>
            </template>
          </template>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import bookmarks from '../functions/Bookmarks'
const ExcelJS = require('exceljs');

export default {
  name: 'ToolsetLeftBookmarksImport',
  props: {
    'mainData': Object,
  },
  data: () => ({
    decodeError: null,
    decodedObj: null,
    delBookmarks: false,
    overwriteBookmarks: false,
    isTable: false
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
    closeDialog () {
      this.mainData.bookmarks.import.external = false
      this.mainData.bookmarks.import.show = false
      this.mainData.bookmarks.import.urlData = null
    },
    importBookmarks () {
      console.log(this.decodedObj, this.mainData.bookmarks.elements)
      if (this.delBookmarks || Object.keys(this.mainData.bookmarks.elements).length === 0 ) {
        if (Object.keys(this.mainData.bookmarks.elements).length === 0 || confirm('All existing Bookmarks will be deleted!')) {
          this.$set(this.mainData.bookmarks, 'elements', JSON.parse(JSON.stringify(this.decodedObj)))
        }
      } else {
        let overwrite = this.overwriteBookmarks || (this.changedBookmarks > 0 && this.newBookmarks === 0)
        Object.keys(this.decodedObj).forEach(b => {
          if (!this.mainData.bookmarks.elements[b] || overwrite) {
            this.$set(this.mainData.bookmarks.elements, b, JSON.parse(JSON.stringify(this.decodedObj[b])))
          }
        })
      }
      bookmarks.updateBookmarkStore(this.mainData.bookmarks)
      this.closeDialog()
    },
    updateData () {
      this.decodedObj = null
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
      }
    },
    loadFile () {
      this.$refs.txtFile.click()
    },
    closeFile () {
      this.isTable = false
      this.decodedObj = null
      this.decodeError = null
    },
    selectTxtFile () {
      if (this.$refs.txtFile && this.$refs.txtFile.files) {
        console.log(this.$refs.txtFile.files[0])
        this.isTable = false
        let file = this.$refs.txtFile.files[0]
        if (file) {
          let aFileExt = file.name.split('.').slice(-1)[0]
          if (aFileExt === 'txt') {
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
          } else if (aFileExt === 'xlsx') {
            // console.log('xlsx')
            this.isTable = true
            this.mainData.bookmarks.import.urlData = null
            this.decodedObj = null
            this.decodeError = null
            this.$nextTick(() => {
              const wb = new ExcelJS.Workbook()
              if (aFileExt === 'xlsx') {
                wb.xlsx.load(file).then(() => {
                  // console.log('wb', this.isTable, wb)
                  if (wb.creator === 'VOICE 3.0' && wb.subject === 'Bookmarks') {
                    let ws = wb.getWorksheet()
                    let rows = ws.getSheetValues()
                    if (rows) {
                      let dataRows = {}
                      rows.forEach(row => {
                        if (row, row[3] && row[3].indexOf('_u_') > -1) {
                          dataRows[row[3].trim()] = {
                            added: typeof row[4] === 'string' ? new Date(row[4].trim()).getTime() : Date.now(), // 7/29/2021, 8:49:20 AM
                            category: typeof row[2] === 'string' ? row[2].trim() : '',
                            comment: typeof row[5] === 'string' ? row[5].trim() : ''
                          }
                        }
                      })
                      // console.log(dataRows)
                      if (dataRows && Object.keys(dataRows).length > 0) {
                        this.decodedObj = dataRows
                      } else {
                        alert('No bookmarks found!')
                        this.decodeError = 'No bookmarks found!'
                        this.isTable = false
                      }
                    } else {
                      alert('No rows found!')
                      this.decodeError = 'No rows found!'
                      this.isTable = false
                    }
                  } else {
                    alert('File is invalid!')
                    this.decodeError = 'File is invalid!'
                    this.isTable = false
                  }
                })
              }
            })
          } else {
            alert('File type is invalid!')
          }
        }
      }
    }
  },
  watch: {
    'mainData.bookmarks.import.show' () {
      if (this.mainData.bookmarks.import.show) {
        this.delBookmarks = false
        this.overwriteBookmarks = false
        this.isTable = false
        this.decodedObj = null
        this.decodeError = null
      }
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
