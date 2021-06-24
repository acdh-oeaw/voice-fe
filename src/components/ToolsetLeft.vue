<template>
  <v-card class="fill-height d-flex flex-column">
    <v-tabs v-model="cTab" grow class="flex-shrink-1 fx-bb">
      <v-tab href="#tree">
        Tree
        <v-icon :class="'tree-icon' + (mainData.filter.manualSelection.length > 0 ? '' : ' fx-icon-red') + ' tree-icon-tree'" v-if="mainData.filter.active && mainData.filter.manualSelect">mdi-check-bold</v-icon>
      </v-tab>
      <v-tab href="#filter">
        Filter
        <v-icon class="tree-icon" v-if="mainData.app.filterActive" title="Filters currently active.">mdi-exclamation-thick</v-icon>
      </v-tab>
      <v-tab href="#bookmarks">Bookmarks</v-tab>
    </v-tabs>
    <v-tabs-items v-model="cTab" class="flex-grow-1 fill-height">
      <v-tab-item value="tree">
        <ToolsetLeftTree :mainData="mainData" />
      </v-tab-item>
      <v-tab-item value="filter">
        <ToolsetLeftFilter @treeview="cTab = '#tree'" :mainData="mainData" />
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
    if (this.mainData.bookmarks.import.urlData) {
      this.cTab = 'bookmarks'
    }
  },
  methods: {
  },
  computed: {
  },
  watch: {
    'mainData.bookmarks.import.urlData' () {
      if (this.mainData.bookmarks.import.urlData) {
        this.cTab = 'bookmarks'
      }
    }
  },
  components: {
    ToolsetLeftFilter,
    ToolsetLeftBookmarks,
    ToolsetLeftTree
  }
}
</script>

<style scoped>
#tree, #filter, #bookmarks {
  height: 100%;
}
.tree-icon {
  position: absolute;
  right: 2px;
  top: 2px;
  background: #08690c;
  color: #fff!important;
  border-radius: 100%;
  font-size: 13px;
  padding: 2px;
}
.tree-icon-tree {
  background: #1976d2;
}
</style>
