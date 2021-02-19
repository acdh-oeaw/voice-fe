<template>
  <div class="voice-switches-frm">
    <div
      v-for="(o, i) in mainData.views.voice" :key="'o' + i"
      @click="o.val = !o.val"
      :class="'vs-' + i.toLowerCase() + (o.val ? '' : ' off')"
      :title="o.title"
      :style="o.style"
      v-text="o.text"
    />
  </div>
</template>

<script>
export default {
  name: 'RenderSelect',
  props: {
    'mainData': Object
  },
  data: () => ({
  }),
  mounted () {
  },
  computed: {
  },
  methods: {
  },
  watch: {
  },
  components: {
  }
}
</script>

<style scoped>
.voice-switches-frm > div {
  cursor: pointer;
  user-select: none;
  min-width: 20px;
  padding: 0 2px;
  text-align: center;
}
.voice-switches-frm > div.off {
  color: #bbb!important;
}
.voice-switches-frm > div:hover {
  background: #ddd;
}
</style>
