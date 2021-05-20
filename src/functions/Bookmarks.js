const localFunctions = {
  editBookmark (vThis, bookmarks, uId, fast = false) {
    if (!fast) {
      bookmarks.edit = uId
    } else {
      if (bookmarks.elements[uId]) {
        vThis.$delete(bookmarks.elements, uId)
      } else {
        vThis.$set(bookmarks.elements, uId, {
          added: Date.now(),
          category: '',
          comment: ''
        })
      }
      this.updateBookmarkStore(bookmarks)
    }
  },
  updateBookmarkStore (bookmarks) {
    if (bookmarks.localStorage) {
      // save
      let data = JSON.parse(JSON.stringify(bookmarks))
      delete data.edit
      console.log('updateBookmarkStore', data)
    } else {
      // delete
    }
  }
}

export default localFunctions