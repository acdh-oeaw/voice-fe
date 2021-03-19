<template>
  <div class="fill-height d-flex flex-column">
    <div class="py-2 flex-grow-1" style="overflow-y: scroll;">
      <div class="fx-bb mb-3">
        <v-card class="mx-2 mb-2 px-1" flat>
          <div class="d-flex">
            <v-switch v-model="mainData.options.treeShowSpet" dense hide-details class="mt-0 mr-1" label="spet"></v-switch>
            <v-tooltip top max-width="300">
              <template v-slot:activator="{ on, attrs }"><v-icon v-bind="attrs" v-on="on" class="mr-3">mdi-information-outline</v-icon></template>
              <span>Display sub-categorisation into speech event types.</span>
            </v-tooltip>
            <v-switch v-model="mainData.options.treeShowFiltered" dense hide-details class="mt-0 mr-3 s-small-font"
              label="Hide filtered Speech Events"
              v-if="mainData.app.filteredSeIds"
            ></v-switch>
          </div>
        </v-card>
      </div>
      <v-treeview
        dense selected-color="primary"
        :items="tree" item-text="id"
        :selectable="mainData.filter.active && mainData.filter.manualSelect"
        open-on-click
        activatable :active.sync="active"
        class="ctree"
        v-model="mainData.filter.manualSelection"
      >
        <template v-slot:prepend="{ item, open }" v-if="!mainData.filter.active || !mainData.filter.manualSelect">
          <v-icon>
            {{ item.children ? (open ? 'mdi-folder-open-outline' : 'mdi-folder-outline') : 'mdi-text-box-outline' }}
          </v-icon>
        </template>
        <template v-slot:label="{ item }">
          <div :class="{
              'underline': item.open,
              'found': mainData.search.foundXmlId.indexOf(item.id) > -1,
              'filtered': !item.children && mainData.app.filteredSeIds && mainData.app.filteredSeIds.indexOf(item.id) < 0,
            }"
            :title="item.title"
            v-html="itemLabel(item)"
          />
        </template>
        <template v-slot:append="{ item }">
          <v-icon v-if="item.audioAvailable">mdi-volume-high</v-icon>
        </template>
      </v-treeview>
      <v-btn @click="mainData.corpus.selectedElement = null" small elevation="0" class="ma-3">VOICE Header</v-btn>
    </div>
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
    itemLabel (item) {
      if (item.children) {
        if (this.mainData.app.filteredSeIds) {
          let getChildCount = (el) => {
            let c = 0
            if (el.children) {
              el.children.forEach(e => {
                c += getChildCount(e)
              })
            } else {
              c += this.mainData.app.filteredSeIds.indexOf(el.id) > -1 ? 1 : 0
            }
            return c
          }
          return item.label + ' <span style="font-size: 14px;">(' + getChildCount(item) + ')</span>'
        } else {
          return item.label
        }
      } else {
        return item.id
      }
    }
  },
  computed: {
    tree () {
      let aList = this.mainData.options.treeShowSpet ? this.mainData.corpus.listSpet : this.mainData.corpus.list
      if (this.mainData.options.treeShowFiltered && this.mainData.app.filteredSeIds) {
        let aFilter = (aList) => {
          let al = []
          aList.forEach(l => {
            if (l.children) {
              let c = aFilter(l.children)
              if (c.length > 0) {
                al.push({
                  id: l.id,
                  label: l.label,
                  children: c
                })
              }
            } else {
              if (this.mainData.app.filteredSeIds.indexOf(l.id) > -1) {
                al.push(l)
              }
            }
          })
          return al
        }
        aList = aFilter(aList)
      }
      // console.log(aList)
      return aList
    }
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
  .ctree >>> .filtered {
    color: #aaa;
  }
  .s-small-font {
    max-width: 135px;
  }
  .s-small-font >>> label {
    font-size: 12px;
    line-height: 12px;
  }
</style>
