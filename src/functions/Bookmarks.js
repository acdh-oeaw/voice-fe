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
      // console.log('updateBookmarkStore', JSON.stringify(data))
      localStorage.setItem('bookmarks', JSON.stringify(data))
    } else {
      localStorage.removeItem('bookmarks')
    }
  },
  loadBookmarkStore (vThis, bookmarks) {
    let data = localStorage.getItem('bookmarks', null)
    if (data) {
      data = JSON.parse(data)
      if (data.hasOwnProperty('active')) {
        vThis.$set(bookmarks, 'active', data.active)
      }
      if (data.hasOwnProperty('localStorage')) {
        vThis.$set(bookmarks, 'localStorage', data.localStorage)
      }
      if (data.hasOwnProperty('elements')) {
        vThis.$set(bookmarks, 'elements', data.elements)
      }
      console.log('loadBookmarkStore', data.hasOwnProperty('active'), data, bookmarks)
    }
  }
}

export default localFunctions