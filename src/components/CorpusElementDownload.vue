<template>
  <v-dialog v-model="open" persistent width="300">
    <v-card color="primary" dark>
      <v-card-text class="py-3">
        Rendering {{ view.type.toUpperCase() }} style for {{ type.txt }} ...
        <v-progress-linear
          v-model="rProgress"
          color="white"
          style="background-color: #005eb6 !important;"
          class="mt-3"
        ></v-progress-linear>
        <v-btn @click="open = false" color="accent" class="w-100 mt-3">Cancel</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import exporter from '../functions/Exporter'
import htmlCss from '!!raw-loader!../assets/css/RenderLine.css'
import htmlTemplate from '!!raw-loader!../assets/html/HtmlTemplate.html'

export default {
  name: 'CorpusElementDownload',
  props: {
    'mainData': Object,
    'type': Object,
    'view': Object,
    'element': Object
  },
  data: () => ({
    status: 0,
    open: true,
    rProgress: 0
  }),
  mounted () {
    console.log('CorpusElementDownload', this.mainData, this.view, this.element)
    this.$nextTick(() => {
      exporter.saveSearchResult(
        this.element.bodyObj.xmlObj.uList.map((aU, i) => {
          let uObj = {
            loading: true,
            obj: {},
            list: []
          }
          this.mainData.corpus.saxParserFunc.parseIt(aU.xml, null, null, uObj)
          return {
            uId: aU.attributes['xml:id'],
            xml: aU.xml,
            uObj,
            voice: null,
            plain: null,
            pos: null
          }
        }),
        null,
        this.view,
        this.type,
        {
          version: 'Versions: FE ' + this.mainData.version + ' - API: ' + this.mainData.apiVersion,
          addText: this.element.id,
          fileFx: this.element.id
        },
        null,
        (p) => { this.rProgress = p },
        this.saveFile,
        htmlCss,
        htmlTemplate,
        document
      )
    })
  },
  computed: {
  },
  methods: {
    saveFile (data, mimeType, fileExtension, filename) {
      if (data) {
        let blob = new Blob([data], {type: mimeType})
        const a = document.createElement('a')
        a.href= URL.createObjectURL(blob)
        a.download = filename + '.' + fileExtension
        a.click()
      }
      this.open = false
    }
  },
  watch: {
    open () {
      if (!this.open) {
        setTimeout(() => { this.$emit('close') }, 200)
      }
    }
  },
  components: {
  }
}
</script>

<style scoped>
</style>
