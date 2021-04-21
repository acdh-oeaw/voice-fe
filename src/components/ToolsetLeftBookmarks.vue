<template>
  <div class="py-2">
    <v-alert dense outlined type="info" class="ma-3">
      Coming in summer 2021.
    </v-alert>
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
  },
  watch: {
  }
}
</script>

<style scoped>
</style>
