<template>
  <div>
    <v-container class="home-width">
      <div class="py-5">
        <h1 class="text-subtitle-1 font-weight-bold">A computer corpus of English as a lingua franca</h1>
        <p>The most wide-spread contemporary use of English throughout the world is that of <i>English as a lingua franca (ELF)</i>, i.e. English used as a common means of communication among speakers from different first-language backgrounds. <b>VOICE</b>, the <b>V</b>ienna-<b>O</b>xford <b>I</b>nternational <b>C</b>orpus of <b>E</b>nglish, is a collection of language data, the first computer-readable corpus capturing spoken ELF interactions of this kind.</p>
      </div>
    </v-container>
    <div class="text-center py-10 indigo lighten-5">
      <h3 class="text-h5 font-weight-bold">Explore VOICE</h3>
      <div class="d-flex align-center search-frm mt-4">
        <v-text-field @keyup.enter.native="search" v-model="mainData.search.value" label="Search the VOICE Corpus" class="mr-3"></v-text-field>
        <v-btn @click="search" color="indigo darken-4 white--text">Search</v-btn>
      </div>
      or
      <div class="mt-4">
        <v-btn to="/tool" color="indigo darken-4 white--text">Browse</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  props: {
    'mainData': Object
  },
  data: () => ({
    publicPath: process.env.BASE_URL
  }),
  mounted () {
  },
  methods: {
    search () {
      this.$router.push('/tool')
      this.mainData.search.now = true
    }
  },
}
</script>

<style scoped>
  .search-frm {
    margin-left: auto;
    margin-right: auto;
    max-width: 400px;
  }
</style>
