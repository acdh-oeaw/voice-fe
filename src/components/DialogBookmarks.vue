<template>
  <v-dialog v-model="open" width="600">
    <v-card>
      <v-card-title class="headline grey lighten-2">
        {{ isNew ? 'Add' : 'Edit' }} bookmark: {{ id }}
      </v-card-title>
      <v-card-text class="py-4">
        <v-autocomplete
          label="Category"
          clearable
          auto-select-first
          v-model="category"
          :items="categorySelect"
          :search-input.sync="categorySearch"
          ref="category"
          @blur="categoryChange"
          @keyup.enter="focusComment"
          @keydown.tab.prevent="focusComment"
        >
          <template v-slot:no-data>
            <div class="px-2">Type to create new category</div>
          </template>
        </v-autocomplete>
        <v-textarea
          label="Comment"
          auto-grow
          rows="1"
          ref="comment"
          v-model="comment"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        Created: {{ (new Date(added)).toLocaleString('en-US') }}
        <v-spacer />
        <v-btn color="error" @click="deleteBookmark" v-if="!isNew">Delete</v-btn>
        <v-btn color="warning" @click="open = false">Close/Abort</v-btn>
        <v-btn color="primary" @click="saveBookmark">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import bookmarks from '../functions/Bookmarks'
var _ = require('lodash')

export default {
  name: 'DialogBookmarks',
  props: {
    'mainData': Object,
  },
  data: () => ({
    open: false,
    id: '',
    added: Date.now(),
    category: '',
    comment: '',
    isNew: false,
    categorySearch: '',
    categoryNewVal: null
  }),
  mounted () {
    console.log('DialogBookmarks', this.mainData)
  },
  computed: {
    categorySelect () {
      let cList = []
      Object.keys(this.mainData.bookmarks.elements).forEach(e => {
        if (cList.indexOf(this.mainData.bookmarks.elements[e].category) < 0) {
          cList.push(this.mainData.bookmarks.elements[e].category)
        }
      })
      if (this.categoryNewVal && this.categoryNewVal.length > 0) {
        cList.push(this.categoryNewVal)
      }
      return cList.filter(v => v.length > 0).sort((a, b) => { return a.toLowerCase().localeCompare(b.toLowerCase()) })
    }
  },
  methods: {
    saveBookmark () {
      bookmarks.setBookmark(this, this.mainData.bookmarks, this.id, this.added, this.category, this.comment)
      this.open = false
    },
    deleteBookmark () {
      if(confirm('Delete Bookmark "' + this.id + '"?')) {
        if (this.mainData.bookmarks.elements[this.id]) {
          bookmarks.deleteBookmark(this, this.mainData.bookmarks, this.id)
          this.open = false
        }
      }
    },
    focusComment (e) {
      this.$refs.category.blur()
      _.debounce(() => {
        this.$refs.comment.focus()
      }, 100)()
    },
    categoryChange () {
      // console.log('categoryChange', this.categorySearch, this.category.toLowerCase().indexOf(this.categorySearch.toLowerCase()))
      if (this.categorySearch && this.categorySearch.trim().length > 0 && this.category.toLowerCase().indexOf(this.categorySearch.toLowerCase()) < 0) {
        console.log('newCategory', this.categorySearch)
        this.categoryNewVal = this.categorySearch
        this.category = this.categoryNewVal.trim()
      }
    }
  },
  watch: {
    open () {
      if (!this.open) {
        this.mainData.bookmarks.edit = null
      }
    },
    'mainData.bookmarks.edit' () {
      if (this.mainData.bookmarks.edit) {
        this.open = true
        this.categoryNewVal = ''
        this.id = this.mainData.bookmarks.edit
        if (this.mainData.bookmarks.elements[this.id]) {
          this.added = this.mainData.bookmarks.elements[this.id].added || Date.now()
          this.category = this.mainData.bookmarks.elements[this.id].category || ''
          this.comment = this.mainData.bookmarks.elements[this.id].comment || ''
          this.isNew = false
        } else {
          this.added = Date.now()
          this.category = ''
          this.comment = ''
          this.isNew = true
        }
      }
    }
  }
}
</script>

<style scoped>
</style>
