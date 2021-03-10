<template>
  <div class="py-2">
    <div class="fx-bb mb-3">
      <v-card class="mx-2 mb-2 px-1" flat>
        <div class="d-flex">
          <v-switch v-model="mainData.options.treeShowSpet" dense hide-details class="mt-0 mr-3" label="spet"></v-switch>
        </div>
      </v-card>
    </div>
    <v-treeview
      dense selected-color="primary"
      :items="mainData.options.treeShowSpet ? mainData.corpus.listSpet : mainData.corpus.list" item-text="id"
      :selectable="mainData.filter.manualSelect"
      open-on-click
      activatable :active.sync="active"
      class="ctree"
      v-model="mainData.filter.manualSelection"
    >
      <template v-slot:prepend="{ item, open }" v-if="!mainData.filter.manualSelect">
        <v-icon>
          {{ item.children ? (open ? 'mdi-folder-open-outline' : 'mdi-folder-outline') : 'mdi-text-box-outline' }}
        </v-icon>
      </template>
      <template v-slot:label="{ item }">
        <div :class="{
          'underline': item.open,
          'found': mainData.search.foundXmlId.indexOf(item.id) > -1
        }" :title="item.title">{{ item.children ? item.label : item.id }}</div>
      </template>
      <template v-slot:append="{ item }">
        <v-icon v-if="item.audioAvailable">mdi-volume-high</v-icon>
      </template>
    </v-treeview>
    <v-btn @click="mainData.corpus.selectedElement = null" small elevation="0" class="ma-3">VOICE Header</v-btn>
  </div>
</template>

<script>
export default {
  name: 'ToolsetLeftTree',
  props: {
    'mainData': Object,
  },
  data: () => ({
    active: []
  }),
  mounted () {
    console.log('ToolsetLeftTree', this.mainData)
  },
  methods: {
  },
  watch: {
    active (nVal) {
      this.mainData.corpus.selectedElement = nVal[0]
      if (nVal[0]) {
        this.mainData.options.singleView = 'corpus'
        if (this.mainData.corpus.elements.filter(e => e.id === nVal[0]).length === 0) {
          if (this.mainData.corpus.obj[nVal[0]]) {
            this.$set(this.mainData.corpus.obj[nVal[0]], 'open', true)
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
  .ctree >>> .found {
    font-weight: bold;
  }
</style>
