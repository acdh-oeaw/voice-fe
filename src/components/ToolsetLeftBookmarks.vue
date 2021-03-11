<template>
  <div class="py-2">
    ToolsetLeftBookmarks
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
