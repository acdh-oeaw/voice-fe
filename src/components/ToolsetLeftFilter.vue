<template>
  <div class="fill-height d-flex flex-column">
    <div class="pa-2 flex-grow-1" style="overflow-y: auto;">
      <v-card class="mb-2 px-2 pb-1 inset-card-shadow">
        <div class="m-title">Filters</div>
        <v-switch v-model="mainData.filter.active" dense hide-details class="mt-0" :label="mainData.filter.active ? 'On' : 'Off'"></v-switch>
      </v-card>
      <div :class="'d-flex filter-results' + (mainData.app.filteredSeIds && mainData.app.filteredSeIds.length < 1 ? ' warning' : '') + (mainData.app.filteredSeIds ? '' : ' no-filters')">
        <div v-if="mainData.app.filteredSeIds">
          Speech Events: <b>{{ mainData.app.filteredSeIds.length }}</b>
        </div>
        <div v-else>
          No active filters
        </div>
        <v-spacer />
        <v-tooltip top max-width="300">
          <template v-slot:activator="{ on, attrs }"><v-icon v-bind="attrs" :color="mainData.filter.active ? 'white' : null" v-on="on">mdi-information-outline</v-icon></template>
          <div class="py-1">
            <p class="mb-0"><b>Filter:</b> Choose corpus text according to meta-data categories below.</p>
            <!-- <p class="mt-1 mb-0"><b>Expert filter:</b> This feature allows to combine different filters. Note of caution: Some combinations may drastically reduce the number of corpus texts selected.</p> -->
          </div>
        </v-tooltip>
      </div>
      <v-card class="my-2 px-2 pb-1 inset-card-shadow">
        <v-select
          :items="itemsDomain.filter(i => !multiSelect || i.val !== null)"
          item-text="title"
          item-value="val"
          label="Domain"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.domain"
          :multiple="multiSelect"
        >
        </v-select>
        <v-select
          :items="itemsSpet.filter(i => !multiSelect || i.val !== null)"
          item-text="title"
          item-value="val"
          label="SPET"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.spet"
          :multiple="multiSelect"
        >
        </v-select>
        <v-select
          :items="itemsInteractants.filter(i => !multiSelect || i.val !== null)"
          item-text="title"
          item-value="val"
          label="No of interactants"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.interactants"
          :multiple="multiSelect"
        >
          <template v-slot:append-outer>
            <v-tooltip top max-width="300">
              <template v-slot:activator="{ on, attrs }"><v-icon v-bind="attrs" v-on="on">mdi-information-outline</v-icon></template>
              <div class="py-1">All speakers except for researchers and non-participants.</div>
            </v-tooltip>
          </template>
        </v-select>
        <v-select
          :items="itemsSpeakers.filter(i => !multiSelect || i.val !== null)"
          item-text="title"
          item-value="val"
          label="No of speakers"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.speakers"
          :multiple="multiSelect"
        >
          <template v-slot:append-outer>
            <v-tooltip top max-width="300">
              <template v-slot:activator="{ on, attrs }"><v-icon v-bind="attrs" v-on="on">mdi-information-outline</v-icon></template>
              <div class="py-1">All persons who say something in the course of a speech event. The number of speakers thus equals the number of identified speakers in the transcript.</div>
            </v-tooltip>
          </template>
        </v-select>
        <v-select
          :items="itemsAcquaintedness.filter(i => !multiSelect || i.val !== null)"
          item-text="title"
          item-value="val"
          label="Acquaintedness"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.acquaintedness"
          :multiple="multiSelect"
        >
          <template v-slot:append-outer>
            <v-tooltip top max-width="300">
              <template v-slot:activator="{ on, attrs }"><v-icon v-bind="attrs" v-on="on">mdi-information-outline</v-icon></template>
              <div class="py-1">Acquaintedness indicates whether participants (excluding non-participants and researchers) have met before (at least once).</div>
            </v-tooltip>
          </template>
        </v-select>
        <v-select
          :items="itemsPowerRelations.filter(i => !multiSelect || i.val !== null)"
          item-text="title"
          item-value="val"
          label="Power relations"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.powerRelations"
          :multiple="multiSelect"
        >
          <template v-slot:append-outer>
            <v-tooltip top max-width="300">
              <template v-slot:activator="{ on, attrs }"><v-icon v-bind="attrs" v-on="on">mdi-information-outline</v-icon></template>
              <div class="py-1">Power relations is an approximate classification indicating the span of social/hierarchical status among participants in any given speech event. This classification does not apply to non-participants and researchers.</div>
            </v-tooltip>
          </template>
        </v-select>
        <v-select
          :items="itemsDurationOfSpeechEvent.filter(i => !multiSelect || i.val !== null)"
          item-text="title"
          item-value="val"
          label="Duration of speech event"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.durationOfSpeechEvent"
          :multiple="multiSelect"
        >
        </v-select>
        <v-select
          :items="itemsWords.filter(i => !multiSelect || i.val !== null)"
          item-text="title"
          item-value="val"
          label="No of words"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.words"
          :multiple="multiSelect"
        >
        </v-select>
        <v-select
          :items="itemsSpeakersL1.filter(i => !multiSelect || i.val !== null)"
          item-text="title"
          item-value="val"
          label="Speakers L1"
          class="mb-3"
          hide-details
          @change="mainData.filter.active = true"
          v-model="mainData.filter.speakersL1"
          :multiple="multiSelect"
        >
        </v-select>
        <div class="m-title">With audio file</div>
        <v-switch v-model="mainData.filter.onlyWithAudio" @change="mainData.filter.active = true" dense hide-details class="mt-0" :label="mainData.filter.onlyWithAudio ? 'On' : 'Off'"></v-switch>
      </v-card>
      <v-card class="mb-2 px-2 pb-1 inset-card-shadow">
        <v-tooltip top max-width="300">
          <template v-slot:activator="{ on, attrs }"><v-icon v-bind="attrs" class="fx-btn" v-on="on">mdi-information-outline</v-icon></template>
          <div class="py-1">
            Select individual corpus texts in tree view.<br>
            <b>Attention:</b> if additional filters are selected this will reduce the number of texts.
          </div>
        </v-tooltip>
        <div class="m-title">Manual selection</div>
        <v-switch
          v-model="mainData.filter.manualSelect"
          @change="mainData.filter.active = true"
          dense hide-details class="mt-0"
          :label="mainData.filter.manualSelect ? 'On: ' + (mainData.filter.manualSelection.length > 0 ? mainData.filter.manualSelection.length + ' speech event' + (mainData.filter.manualSelection.length > 1 ? 's' : '') + ' selected' : 'No element selected') : 'Off'"
        ></v-switch>
        <div v-if="mainData.filter.manualSelect">
          <v-icon :class="'fx-tree-icon' + (mainData.filter.manualSelection.length > 0 ? '' : ' fx-icon-red') + ' mr-2'" v-if="mainData.filter.manualSelect">mdi-check-bold</v-icon>
          <span class="m-hint">Elements are selectable in <a @click="$emit('treeview')">Tree View</a>.</span>
        </div>
      </v-card>
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
    filterType: 'simple-multi',
    filterTypes: [
      { val: 'simple', title: 'Simple filter (AND-Logic)' },
      { val: 'simple-multi', title: 'Simple filter (AND-Logic) with multiple select (OR-Logic)'},
    ],
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
      { val: {f: 0, t: 30 * 60}, title: '0 to 29 min' },
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
    ],
    itemsSpeakersL1: [
      { val: null, title: 'Off' },
      { val: 'alb', title: 'Albanian (alb)' },
      { val: 'ara', title: 'Arabic (ara)' },
      { val: 'arm', title: 'Armenian (arm)' },
      { val: 'bos', title: 'Bosnian	(bos)' },
      { val: 'bul', title: 'Bulgarian	(bul)' },
      { val: 'cat', title: 'Catalan	(cat)' },
      { val: 'chi', title: 'Chinese	(chi)' },
      { val: 'cze', title: 'Czech (cze)' },
      { val: 'dan', title: 'Danish (dan)' },
      { val: 'dut', title: 'Dutch (dut)' },
      { val: 'eng', title: 'English (eng)' },
      { val: 'est', title: 'Estonian (est)' },
      { val: 'fin', title: 'Finnish (fin)' },
      { val: 'fre', title: 'French (fre)' },
      { val: 'ger', title: 'German (ger)' },
      { val: 'gre', title: 'Greek (gre)' },
      { val: 'heb', title: 'Hebrew (heb)' },
      { val: 'hin', title: 'Hindi (hin)' },
      { val: 'hun', title: 'Hungarian (hun)' },
      { val: 'ice', title: 'Icelandic (ice)' },
      { val: 'ind', title: 'Indonesian (ind)' },
      { val: 'ita', title: 'Italian (ita)' },
      { val: 'jpn', title: 'Japanese (jpn)' },
      { val: 'kaz', title: 'Kazakh (kaz)' },
      { val: 'kir', title: 'Kirghiz (kir)' },
      { val: 'kor', title: 'Korean (kor)' },
      { val: 'lav', title: 'Latvian (lav)' },
      { val: 'lit', title: 'Lithuanian (lit)' },
      { val: 'mac', title: 'Macedonian (mac)' },
      { val: 'mlt', title: 'Maltese (mlt)' },
      { val: 'nor', title: 'Norwegian (nor)' },
      { val: 'per', title: 'Persian (per)' },
      { val: 'pol', title: 'Polish (pol)' },
      { val: 'por', title: 'Portuguese (por)' },
      { val: 'rum', title: 'Romanian (rum)' },
      { val: 'rus', title: 'Russian (rus)' },
      { val: 'srp', title: 'Serbian (srp)' },
      { val: 'hrv', title: 'Croatian (hrv)' },
      // { val: 'scc', title: 'Serbian (scc)' },
      // { val: 'scr', title: 'Croatian (scr)' },
      { val: 'slo', title: 'Slovak (slo)' },
      { val: 'slv', title: 'Slovenian (slv)' },
      { val: 'spa', title: 'Spanish (spa)' },
      { val: 'swe', title: 'Swedish (swe)' },
      { val: 'tgl', title: 'Tagalog (tgl)' },
      { val: 'tur', title: 'Turkish (tur)' },
      { val: 'ukr', title: 'Ukrainian (ukr)' },
      { val: 'und', title: 'Undetermined (und)' },
      { val: 'urd', title: 'Urdu (urd)' },
      { val: 'vie', title: 'Vietnamese (vie)' },
      { val: 'yor', title: 'Yoruba (yor)' }
    ]
  }),
  mounted () {
    console.log('ToolsetLeftFilter', this.mainData)
  },
  computed: {
    multiSelect () {
      return this.filterType === 'simple-multi'
    }
  },
  methods: {
  },
  watch: {
    multiSelect () {
      let fs = ['manualSelect', 'domain', 'spet', 'interactants', 'speakers', 'acquaintedness', 'powerRelations', 'durationOfSpeechEvent', 'words', 'speakersL1']
      if (this.multiSelect) {
        fs.forEach(f => {
          if (this.mainData.filter[f] && !Array.isArray(this.mainData.filter[f])) {
            this.mainData.filter[f] = [this.mainData.filter[f]]
          }
        })
      } else {
        fs.forEach(f => {
          if (this.mainData.filter[f] && Array.isArray(this.mainData.filter[f])) {
            this.mainData.filter[f] = this.mainData.filter[f][0] || null
          }
        })
      }
    }
  }
}
</script>

<style scoped>
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
  margin: 0.5rem -8px;
}
.no-filters {
  color: #777;
  background: #ddd;
}
.fx-btn {
  position: absolute;
  right: 0.2rem;
  top: 0.2rem;
}
</style>
