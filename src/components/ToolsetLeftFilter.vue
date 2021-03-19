<template>
  <div class="fill-height d-flex flex-column">
    <div class="pa-2 flex-grow-1" style="overflow-y: auto;">
      <v-card class="mb-2 px-2 pb-1 inset-card-shadow">
        <div class="m-title">All Filters</div>
        <v-switch v-model="mainData.filter.active" dense hide-details class="mt-0" :label="mainData.filter.active ? 'On' : 'Off'"></v-switch>
      </v-card>
      <v-card class="mb-2 px-2 pb-1 inset-card-shadow">
        <div class="m-title">Manual selection</div>
        <v-switch v-model="mainData.filter.manualSelect" @change="mainData.filter.active = true" dense hide-details class="mt-0" :label="mainData.filter.manualSelect ? 'On: ' + (mainData.filter.manualSelection.length > 0 ? mainData.filter.manualSelection.length + ' element' + (mainData.filter.manualSelection.length > 1 ? 's' : '') + ' selected' : 'No element selected') : 'Off'"></v-switch>
        <div v-if="mainData.filter.manualSelect">
          <v-icon :class="'fx-tree-icon' + (mainData.filter.manualSelection.length > 0 ? '' : ' fx-icon-red') + ' mr-2'" v-if="mainData.filter.manualSelect">mdi-check-bold</v-icon>
          <span class="m-hint">Elements are selectable in <a @click="$emit('treeview')">Tree View</a>.</span>
        </div>
      </v-card>
      <div class="my-3">
        Simple filter
        <v-tooltip top max-width="300">
          <template v-slot:activator="{ on, attrs }"><v-icon v-bind="attrs" v-on="on">mdi-information-outline</v-icon></template>
          <div class="py-1">
            <p class="mb-0"><b>Simple filter:</b> Choose corpus texts according to meta-data categories.</p>
            <!-- <p class="mt-1 mb-0"><b>Expert filter:</b> This feature allows to combine different filters. Note of caution: Some combinations may drastically reduce the number of corpus texts selected.</p> -->
          </div>
        </v-tooltip>
      </div>
      <v-card class="my-2 px-2 pb-1 inset-card-shadow">
        <div class="d-flex">
          <v-select
            :items="itemsDomain"
            item-text="title"
            item-value="val"
            label="Domain"
            class="mb-3 mr-2"
            hide-details
            @change="mainData.filter.active = true"
            v-model="mainData.filter.domain"
          >
          </v-select>
          <v-select
            :items="itemsSpet"
            item-text="title"
            item-value="val"
            label="Spet"
            class="mb-3 ml-2"
            hide-details
            @change="mainData.filter.active = true"
            v-model="mainData.filter.spet"
          >
          </v-select>
        </div>
        <v-select
          :items="itemsInteractants"
          item-text="title"
          item-value="val"
          label="No of interactants"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.interactants"
        >
          <template v-slot:append-outer>
            <v-tooltip top max-width="300">
              <template v-slot:activator="{ on, attrs }"><v-icon v-bind="attrs" v-on="on">mdi-information-outline</v-icon></template>
              <div class="py-1">All speakers except for researchers and non-participants.</div>
            </v-tooltip>
          </template>
        </v-select>
        <v-select
          :items="itemsSpeakers"
          item-text="title"
          item-value="val"
          label="No of speakers"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.speakers"
        >
          <template v-slot:append-outer>
            <v-tooltip top max-width="300">
              <template v-slot:activator="{ on, attrs }"><v-icon v-bind="attrs" v-on="on">mdi-information-outline</v-icon></template>
              <div class="py-1">All persons who say something in the course of a speech event. The number of speakers thus equals the number of identified speakers in the transcript.</div>
            </v-tooltip>
          </template>
        </v-select>
        <v-select
          :items="itemsAcquaintedness"
          item-text="title"
          item-value="val"
          label="Acquaintedness"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.acquaintedness"
        >
          <template v-slot:append-outer>
            <v-tooltip top max-width="300">
              <template v-slot:activator="{ on, attrs }"><v-icon v-bind="attrs" v-on="on">mdi-information-outline</v-icon></template>
              <div class="py-1">Acquaintedness indicates whether participants (excluding non-participants and researchers) have met before (at least once).</div>
            </v-tooltip>
          </template>
        </v-select>
        <v-select
          :items="itemsPowerRelations"
          item-text="title"
          item-value="val"
          label="Power relations"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.powerRelations"
        >
          <template v-slot:append-outer>
            <v-tooltip top max-width="300">
              <template v-slot:activator="{ on, attrs }"><v-icon v-bind="attrs" v-on="on">mdi-information-outline</v-icon></template>
              <div class="py-1">Power relations is an approximate classification indicating the span of social/hierarchical status among participants in any given speech event. This classification does not apply to non-participants and researchers.</div>
            </v-tooltip>
          </template>
        </v-select>
        <v-select
          :items="itemsDurationOfSpeechEvent"
          item-text="title"
          item-value="val"
          label="Duration of speech event"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.durationOfSpeechEvent"
        >
        </v-select>
        <v-select
          :items="itemsWords"
          item-text="title"
          item-value="val"
          label="No of words"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.words"
        >
        </v-select>
        <div class="m-title">With Audio File</div>
        <v-switch v-model="mainData.filter.onlyWithAudio" @change="mainData.filter.active = true" dense hide-details class="mt-0" :label="mainData.filter.onlyWithAudio ? 'On' : 'Off'"></v-switch>
      </v-card>
    </div>
    <div>
      <div :class="'filter-results' + (mainData.app.filteredSeIds && mainData.app.filteredSeIds.length < 1 ? ' warning' : '') + (mainData.app.filteredSeIds ? '' : ' no-filters')">
        <div v-if="mainData.app.filteredSeIds">
          Speech Events: <b>{{ mainData.app.filteredSeIds.length }}</b>
        </div>
        <div v-else>
          No active filters
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToolsetLeftFilter',
  props: {
    'mainData': Object
  },
  data: () => ({
    itemsInteractants: [
      { val: null, title: 'Off' },
      { val: {f: 2, t: 2}, title: '2' },
      { val: {f: 3, t: 4}, title: '3 to 4' },
      { val: {f: 5, t: 6}, title: '5 to 6' },
      { val: {f: 7, t: 10}, title: '7 to 10' },
      { val: {f: 11, t: 14}, title: '11 to 14' },
      { val: {f: 15, t: Infinity}, title: '15 and more' }
    ],
    itemsSpeakers: [
      { val: null, title: 'Off' },
      { val: {f: 2, t: 2}, title: '2' },
      { val: {f: 3, t: 4}, title: '3 to 4' },
      { val: {f: 5, t: 6}, title: '5 to 6' },
      { val: {f: 7, t: 10}, title: '7 to 10' },
      { val: {f: 11, t: 14}, title: '11 to 14' },
      { val: {f: 15, t: Infinity}, title: '15 and more' }
    ],
    itemsDomain: [
      { val: null, title: 'Off' },
      { val: 'ED', title: 'ED' },
      { val: 'LE', title: 'LE' },
      { val: 'PB', title: 'PB' },
      { val: 'PO', title: 'PO' },
      { val: 'PR', title: 'PR' },
    ],
    itemsSpet: [
      { val: null, title: 'Off' },
      { val: 'con', title: 'con' },
      { val: 'int', title: 'int' },
      { val: 'sed', title: 'sed' },
      { val: 'sve', title: 'sve' },
      { val: 'wgd', title: 'wgd' },
      { val: 'wsd', title: 'wsd' },
      { val: 'mtg', title: 'mtg' },
      { val: 'pan', title: 'pan' },
      { val: 'qas', title: 'qas' },
      { val: 'prc', title: 'prc' },
    ],
    itemsAcquaintedness: [
      { val: null, title: 'Off' },
      { val: 'acquainted', title: 'acquainted' },
      { val: 'predominantly_unacquainted', title: 'predominantly unacquainted' },
      { val: 'predominantly_acquainted', title: 'predominantly acquainted' },
      { val: 'unacquainted', title: 'unacquainted' },
      { val: 'acquaintedness_unknown', title: 'acquaintedness unknown' }
    ],
    itemsPowerRelations: [
      { val: null, title: 'Off' },
      { val: 'fairly_symmetrical', title: 'fairly symmetrical' },
      { val: 'fairly_asymmetrical', title: 'fairly asymmetrical' },
      { val: 'power_relations_unknown', title: 'power relations unknown' }
    ],
    itemsDurationOfSpeechEvent: [
      { val: null, title: 'Off' },
      { val: {f: 0, t: 29 * 60}, title: '0 to 29 min' },
      { val: {f: 30 * 60, t: 60 * 60}, title: '30 to 59 min' },
      { val: {f: 60 * 60, t: 120 * 60}, title: '1 hour to 1 hour 59 min' },
      { val: {f: 120 * 60, t: Infinity}, title: '2 hours and more' }
    ],
    itemsWords: [
      { val: null, title: 'Off' },
      { val: {f: 0, t: 2999}, title: '0 to 2999' },
      { val: {f: 3000, t: 5999}, title: '3000 to 5999' },
      { val: {f: 6000, t: 9999}, title: '6000 to 9999' },
      { val: {f: 10000, t: 14999}, title: '10000 to 14999' },
      { val: {f: 15000, t: Infinity}, title: '15000 and more' }
    ]
  }),
  mounted () {
    console.log('ToolsetLeftFilter', this.mainData)
  },
  methods: {
  },
  watch: {
  }
}
</script>

<style scoped>
.m-title {
  font-size: 12px;
  padding: 2px;
  color: rgba(0, 0, 0, 0.6);
}
.m-hint {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}
.fx-tree-icon {
  background: #1976d2;
  color: #fff!important;
  border-radius: 100%!important;
  font-size: 13px;
  padding: 2px;
}
.filter-results {
  color: #fff;
  background: #1976d2;
  padding: 5px 10px;
  font-size: 18px;
}
.no-filters {
  color: #777;
  background: #ddd;
}
.inset-card-shadow {
  box-shadow: inset 0px 3px 1px -2px rgb(0 0 0 / 20%), inset 0px 2px 2px 0px rgb(0 0 0 / 14%), inset 0px 1px 5px 0px rgb(0 0 0 / 12%)!important;
}
</style>
