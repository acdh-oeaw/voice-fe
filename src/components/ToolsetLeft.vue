<template>
  <v-card class="fill-height d-flex flex-column">
    <v-tabs v-model="cTab" grow class="flex-shrink-1 fx-bb">
      <v-tab href="#tree">Tree</v-tab>
      <v-tab href="#filter">Filter</v-tab>
      <v-tab href="#bookmarks">Bookmarks</v-tab>
    </v-tabs>
    <v-tabs-items v-model="cTab" class="flex-grow-1 fill-height" style="overflow-y: scroll;">
      <v-tab-item value="tree">
        <ToolsetLeftTree :mainData="mainData" />
      </v-tab-item>
      <v-tab-item value="filter">
        <ToolsetLeftFilter :mainData="mainData" />
      </v-tab-item>
      <v-tab-item value="bookmarks">
        <ToolsetLeftBookmarks :mainData="mainData" />
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import ToolsetLeftFilter from './ToolsetLeftFilter';
import ToolsetLeftBookmarks from './ToolsetLeftBookmarks';
import ToolsetLeftTree from './ToolsetLeftTree';

export default {
  name: 'ToolsetLeft',
  props: {
    'mainData': Object,
  },
  data: () => ({
    cTab: 0
  }),
  mounted () {
    console.log('ToolsetLeft', this.mainData)
  },
  methods: {
  },
  watch: {
  },
  components: {
    ToolsetLeftFilter,
    ToolsetLeftBookmarks,
    ToolsetLeftTree
  }
}
</script>

<style scoped>
</style>
