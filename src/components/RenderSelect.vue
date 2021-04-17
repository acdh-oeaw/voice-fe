<template>
  <div class="voice-switches-frm">
    <div
      v-for="(o, i) in aViews[aType]" :key="'o' + i"
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
    'mainData': Object,
    'views': Object,
    'type': String
  },
  data: () => ({
  }),
  mounted () {
  },
  computed: {
    aViews () {
      return this.views || this.mainData.views
    },
    aType () {
      return this.type || 'voice'
    }
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
  margin: 0 1.5px;
  text-align: center;
}
.voice-switches-frm > div:first-child {
  margin-left: 0;
}
.voice-switches-frm > div:last-child {
  margin-right: 0;
}
.voice-switches-frm > div.off {
  color: #bbb!important;
}
.voice-switches-frm > div:hover {
  background: #ddd;
}
</style>
