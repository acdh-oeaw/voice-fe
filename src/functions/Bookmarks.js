const localFunctions = {
  editBookmark (vThis, bookmarks, uId, fast = false) {
    if (!fast) {
      bookmarks.edit = uId
    } else {
      if (bookmarks.elements[uId]) {
        this.deleteBookmark(vThis, bookmarks, uId)
      } else {
        this.setBookmark(vThis, bookmarks, uId)
      }
    }
  },
  setBookmark(vThis, bookmarks, uId, added, category, comment) {
    vThis.$set(bookmarks.elements, uId, {
      added: added || Date.now(),
      category: category || '',
      comment: comment || ''
    })
    this.updateBookmarkStore(bookmarks)
  },
  deleteBookmark(vThis, bookmarks, uId) {
    vThis.$delete(bookmarks.elements, uId)
    this.updateBookmarkStore(bookmarks)
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
    if (this.localStorageAvailable()) {
      let data = localStorage.getItem('bookmarks', null)
      if (data) {
        data = JSON.parse(data)
        if (Object.prototype.hasOwnProperty.call(data,'active')) {
          vThis.$set(bookmarks, 'active', data.active)
        }
        if (Object.prototype.hasOwnProperty.call(data, 'localStorage')) {
          vThis.$set(bookmarks, 'localStorage', data.localStorage)
        }
        if (Object.prototype.hasOwnProperty.call(data, 'elements')) {
          vThis.$set(bookmarks, 'elements', data.elements)
        }
        console.log('loadBookmarkStore', Object.prototype.hasOwnProperty.call(data, 'active'), data, bookmarks)
      }
    }
  },
  localStorageAvailable() {
    var storage
    try {
      storage = window['localStorage']
      var x = '__storage_test__'
      storage.setItem(x, x)
      storage.removeItem(x)
      return true
    }
    catch(e) {
      return e instanceof DOMException && (
        e.code === 22 ||
        e.code === 1014 ||
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        (storage && storage.length !== 0)
    }
  }
}

export default localFunctions