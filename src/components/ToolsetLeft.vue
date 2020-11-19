<template>
  <v-card class="fill-height d-flex flex-column">
    <v-tabs v-model="cTab" grow class="flex-shrink-1 fx-bb">
      <v-tab href="#tree">Tree</v-tab>
      <v-tab href="#filter">Filter</v-tab>
      <v-tab href="#bookmarks">Bookmarks</v-tab>
    </v-tabs>
    <v-tabs-items v-model="cTab" class="flex-grow-1 fill-height py-2" style="overflow-y: scroll;">
      <v-tab-item value="tree">
        <v-treeview
          selectable dense selected-color="primary"
          :items="mainData.corpus.list" item-text="id"
          open-on-click
          activatable :active.sync="active"
        >
          <template v-slot:label="{ item }">
            <div :class="{
              'underline': item.loaded
            }" :title="item.title">{{ item.id }}</div>
          </template>
          <template v-slot:append="{ item }">
            <v-icon v-if="item.audioAvailable">mdi-volume-high</v-icon>
          </template>
        </v-treeview>
      </v-tab-item>
      <v-tab-item value="filter">
        ToolsetLeft - Filter
      </v-tab-item>
      <v-tab-item value="bookmarks">
        ToolsetLeft - Bookmarks
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
export default {
  name: 'ToolsetLeft',
  props: {
    'mainData': Object,
  },
  data: () => ({
    publicPath: process.env.BASE_URL,
    cTab: 0,
    active: []
  }),
  mounted () {
    console.log('ToolsetLeft', this.mainData)
  },
  methods: {
    test (x) {
      console.log(x)
    }
  },
  watch: {
    active (nVal) {
      this.mainData.corpus.selectedElement = nVal[0]
      if (nVal[0]) {
        this.mainData.options.singleView = 'corpus'
        if (this.mainData.corpus.elements.filter(e => e.id === nVal[0]).length === 0) {
          if (this.mainData.corpus.obj[nVal[0]]) {
            this.$set(this.mainData.corpus.obj[nVal[0]], 'loaded', true)
            this.mainData.corpus.elements.unshift(this.mainData.corpus.obj[nVal[0]])
          }
        }
      }
    },
    'mainData.corpus.selectedElement' (nVal) {
      if (!this.active || this.active[0] !== nVal) {
        this.active = [nVal]
      }
    }
  }
}
</script>

<style scoped>
  .v-treeview--dense >>> .v-treeview-node__root {
    min-height: 25px!important;
  }
  .v-treeview--dense >>> .v-icon.v-icon::after {
    -webkit-transform: scale(1.0);
    transform: scale(1.0);
  }
</style>
