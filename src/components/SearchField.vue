<template>
  <div class="d-flex flex-shrink-1 search-field align-center px-3">
    <v-text-field
      v-model="mainData.search.value"
      @keydown.enter="search(false)"
      @click:clear="search(true)"
      :loading="mainData.search.loading"
      label="Search the VOICE Corpus"
      class="mr-2 mt-0"
      hide-details
      clearable
    />
    <v-btn
      @click="search(false)"
      small
      color="indigo darken-4 white--text"
      :loading="mainData.search.loading"
      :disabled="!mainData.search.value || mainData.search.value.length < 2"
      >Search</v-btn
    >
  </div>
</template>

<script>
export default {
  name: "SearchField",
  props: {
    mainData: Object,
  },
  data: () => ({
    dev: process.env.NODE_ENV === "development",
  }),
  mounted() {},
  methods: {
    search(clear = false) {
      const self = this
      if (clear) {
        this.mainData.search.value = "";
      }
      this.mainData.options.singleView = "search";
      if (
        !this.mainData.search.loading &&
        (this.mainData.search.lastValue !== this.mainData.search.value ||
          this.dev)
      ) {
        this.mainData.search.searched = false
        const highlights = new Map()
        Object.seal(highlights)
        Object.preventExtensions(highlights)
        this.mainData.search.highlights = highlights
        this.mainData.search.foundXmlId = []
        this.mainData.search.lastValue = this.mainData.search.value
        if (
          this.mainData.search.value &&
          this.mainData.search.value.length > 0
        ) {
          this.mainData.search.loading = true;
          this.$http
            .get(this.mainData.apiUrl + "search/", {
              params: { q: this.mainData.search.value },
            })
            .then((response) => {
              if (response.data && response.data.u) {
                // console.log(response)
                response.data.u.forEach((aU, aI) => {
                  const highlights = aU.highlight
                  aU.highlight = new Map()
                  highlights.forEach(key => {aU.highlight.set(key, true)})
                  Object.seal(aU.highlight)
                  Object.preventExtensions(aU.highlight)
                  aU.idx = aI
                })
                self.deepSeal(response.data)
                this.mainData.search.results = response.data;
                if (
                  this.mainData.search.results &&
                  this.mainData.search.results.u &&
                  this.mainData.search.results.u.length > 0
                ) {
                  let highlights = new Map()
                  this.mainData.search.highlights.forEach((v, k) => {highlights.set(k, v)})
                  this.mainData.search.results.u.forEach(aU => {
                    if (aU.highlight) {
                        aU.highlight.forEach((v, k) => {highlights.set(k, v)})
                    }
                    if (this.mainData.search.foundXmlId.indexOf(aU.xmlId) < 0) {
                      this.mainData.search.foundXmlId.push(aU.xmlId);
                    }
                  })
                  Object.seal(highlights)
                  Object.preventExtensions(highlights)
                  this.mainData.search.highlights = highlights
                } else {
                  this.$matomo && this.$matomo.trackSiteSearch(this.mainData.search.value, 'search no response data', 0)
                }
                this.mainData.search.searched = true;
                this.$matomo && this.$matomo.trackSiteSearch(this.mainData.search.value, 'search success', this.mainData.search.results.hits)
              } else {
                this.$matomo && this.$matomo.trackSiteSearch(this.mainData.search.value, 'search no response data', 0)
              }
              this.mainData.search.scrollPos = 0;
              this.mainData.search.loading = false;
              console.log("search", response.data, this.mainData.search);
            })
            .catch((err) => {
              console.log(err);
              this.mainData.search.results = {}
              this.mainData.search.results.xmlStatus = err.body ? err.body.xmlStatus : undefined
              if (this.mainData.search.results.xmlStatus && err.body && err.body.error) {
                this.mainData.search.results.xmlStatus.errors.push(err.body.error)
                this.mainData.search.results.query = this.mainData.search.value
              } 
              this.mainData.search.loading = false;
              this.$matomo && this.$matomo.trackSiteSearch(this.mainData.search.value, 'search error', 0)
            });
        }
      }
    },
    deepSeal(o) {
      const self = this
      Object.seal(o);
      Object.preventExtensions(o);
      if (o === undefined) {
        return o;
      }

      Object.getOwnPropertyNames(o).forEach(function (prop) {
        if (
          o[prop] !== null &&
          (typeof o[prop] === "object" || typeof o[prop] === "function") &&
          !Object.isSealed(o[prop])
        ) {
          self.deepSeal(o[prop]);
        }
      });

      return o;
    },
  },
};
</script>

<style scoped>
.search-field {
  min-width: 310px;
}
</style>
