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
          <v-switch v-model="mainData.bookmarks.localStorage" dense hide-details class="mt-0" :label="mainData.bookmarks.localStorage ? 'On' : 'Off'" :disabled="localStorageDisabeld"></v-switch>
        </div>
      </v-card>
      <v-alert dense outlined type="info" v-if="!mainData.bookmarks.active">
        Activate bookmarks to show the icon to add bookmarks.
      </v-alert>
      <v-alert dense outlined type="warning" v-if="!mainData.bookmarks.localStorage && !localStorageDisabeld">
        <b>Local storage is deactivated</b>
        <div class="sm-font">If you leave or reload this site all Bookmarks are lost.</div>
      </v-alert>
      <v-alert dense outlined type="warning" v-if="localStorageDisabeld">
        <b>Local storage not available</b>
        <div class="sm-font">If you leave or reload this site all Bookmarks are lost.</div>
      </v-alert>
      <v-alert dense outlined type="info" v-if="Object.keys(mainData.bookmarks.elements).length < 1">
        No bookmarks have been added yet.
      </v-alert>
      <div v-else>
        <div v-for="(sBookmarks, bIdx) in sortedBookmarks" :key="bIdx">
          <div v-for="(element, uId) in sBookmarks.elements" :key="uId" class="d-flex">
            <div class="flex-grow-1">{{ uId.split('_')[0] + ':' + uId.split('_')[2] }}</div>
            <div>
              <v-tooltip top max-width="300" v-if="element.comment">
                <template v-slot:activator="{ on, attrs }"><button v-bind="attrs" v-on="on" class="ml-1 comment-btn"></button></template>
                <div class="py-1">
                  <div v-if="element.category"><i><b>{{ element.category }}</b></i></div>
                  <div v-html="element.comment.replace(/(?:\r\n|\r|\n)/g, '<br />')" />
                </div>
              </v-tooltip>
              <button @click="goToUtterance(uId)" class="ml-1 jump-btn"></button>
              <button @click="editBookmark(uId)" :class="'ml-1 ' + (shiftKeyDown ? 'trash-icon' : 'edit-icon')"></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import bookmarks from '../functions/Bookmarks'

export default {
  name: 'ToolsetLeftBookmarks',
  props: {
    'mainData': Object,
  },
  data: () => ({
    shiftKeyDown: false,
    localStorageDisabeld: true
  }),
  created () {
    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.keyDown)
    window.removeEventListener('keyup', this.keyUp)
  },
  mounted () {
    console.log('ToolsetLeftBookmarks', this.mainData)
    if (bookmarks.localStorageAvailable()) {
      this.localStorageDisabeld = false
    } else {
      this.mainData.bookmarks.localStorage = false
    }
  },
  computed: {
    sortedBookmarks () {
      return [
        {
          category: null,
          elements: this.mainData.bookmarks.elements
        }
      ]
    }
  },
  methods: {
    editBookmark (uId) {
      bookmarks.editBookmark(this, this.mainData.bookmarks, uId, this.shiftKeyDown)
    },
    keyDown (e) {
      if (e.key === 'Shift') {
        this.shiftKeyDown = true
      }
    },
    keyUp (e) {
      if (e.key === 'Shift') {
        this.shiftKeyDown = false
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
    'mainData.bookmarks.active' () {
      bookmarks.updateBookmarkStore(this.mainData.bookmarks)
    },
    'mainData.bookmarks.localStorage' () {
      bookmarks.updateBookmarkStore(this.mainData.bookmarks)
    }
  }
}
</script>

<style scoped>
  button {
    outline: none;
  }
</style>
