<template>
  <div class="fill-height d-flex flex-column">
    <div class="pa-2 flex-grow-1" style="overflow-y: auto;">
      <v-card class="mb-4 px-2 pb-1 inset-card-shadow d-flex flex-wrap">
        <div class="mw-50">
          <div class="m-title">Active</div>
          <v-switch v-model="mainData.bookmarks.active" dense hide-details class="mt-0" :label="mainData.bookmarks.active ? 'On' : 'Off'"></v-switch>
        </div>
        <div class="mw-50">
          <div class="m-title">local storage</div>
          <v-switch v-model="mainData.bookmarks.localStorage" dense hide-details class="mt-0" :label="mainData.bookmarks.localStorage ? 'On' : 'Off'"></v-switch>
        </div>
      </v-card>
      <v-alert dense outlined type="info" v-if="!mainData.bookmarks.active">
        Activate bookmarks to show the icon to add bookmarks.
      </v-alert>
      <v-alert dense outlined type="warning" v-if="!mainData.bookmarks.localStorage">
        <b>Local storage is deactivated</b>
        <div class="sm-font">If you leave or reload this site all Bookmarks are lost.</div>
      </v-alert>
      <v-alert dense outlined type="info" v-if="mainData.bookmarks.elements.length < 1">
        No bookmarks have been added yet.
      </v-alert>
      <div v-else>
        <div v-for="element in mainData.bookmarks.elements" :key="element" class="d-flex">
          <div class="flex-grow-1">{{ element.split('_')[0] + ':' + element.split('_')[2] }}</div>
          <div>
            <button @click="goToUtterance(element)" class="ml-1 jump-btn"></button>
            <button @click="removeBookmark(element)" class="ml-1 trash-icon"></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToolsetLeftBookmarks',
  props: {
    'mainData': Object,
  },
  data: () => ({
  }),
  mounted () {
    console.log('ToolsetLeftBookmarks', this.mainData)
  },
  methods: {
    removeBookmark (uId) {
      console.log(uId)
      if (this.mainData.bookmarks.elements.indexOf(uId) > -1) {
        this.mainData.bookmarks.elements.splice(this.mainData.bookmarks.elements.indexOf(uId), 1)
      }
    },
    goToUtterance (u) {
      let xmlId = u.split('_')[0]
      this.openDocument(xmlId, u)
    },
    openDocument (xmlId, uId = null) {
      console.log('openDocument', xmlId, uId)
      this.mainData.corpus.selectedElement = xmlId
      this.mainData.corpus.goToUtterance = uId
      if (xmlId) {
        this.mainData.options.singleView = 'corpus'
        if (this.mainData.corpus.elements.filter(e => e.id === xmlId).length === 0) {
          if (this.mainData.corpus.obj[xmlId]) {
            this.$set(this.mainData.corpus.obj[xmlId], 'open', true)
            this.mainData.corpus.elements.unshift(this.mainData.corpus.obj[xmlId])
          }
        }
      }
    },
  },
  watch: {
  }
}
</script>

<style scoped>
</style>
