<!--
  Copyright 2019 Google LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<template>
  <b-container>
    <b-row align-v="center">
      <b-col>
        <p class="font-weight-bold my-4 text-left" style="font-size: 1.8rem;">Advanced search</p>
      </b-col>
    </b-row>
    <b-row>
      <!-- Choose Dataset -->
      <b-col class="my-2">
        <b-form-group
          label-cols="4"
          label-cols-lg="2"
          label="Dataset"
          label-for="select-dataset"
          label-align="left"
        >
          <b-form-select
            v-model="currentDataset"
            :options="datasetlist"
            id="select-dataset"
            @change="onDatasetChange()"
          ></b-form-select>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <!-- Choose Dataset Epoch -->
      <b-col class="my-2 self-right">
        <b-form-group
          label-cols="4"
          label-cols-lg="2"
          label="Dataset epoch"
          label-for="select-epoch"
          label-align="left"
        >
          <b-form-select label="select-epoch" v-model="currentEpoch" :options="epochlist"></b-form-select>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <!-- Value contains -->
      <b-col class="my-2 self-right">
        <b-form-group
          label-cols="4"
          label-cols-lg="2"
          label="Item Contains"
          label-for="input-content"
          label-align="left"
          :invalid-feedback="invalidFeedback"
          :state="inputItemState"
        >
          <b-form-input
            v-model="inputItem"
            placeholder="Example: Q123 or Q123,Q456 (if multiple items)."
            id="input-content"
            trim
            :state="inputItemState"
          ></b-form-input>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <!-- Drop down selector on language -->
      <b-col class="my-2 self-right">
        <b-form-group
          label-cols="4"
          label-cols-lg="2"
          label="Language Includes"
          label-for="select-language"
          label-align="left"
        >
          <b-form-select
            v-model="selectedLanguage"
            :options="languages"
            multiple
            :select-size="6"
            id="select-language"
          ></b-form-select>
          <!-- <div class="my-2">Selected: <strong>{{ language }}</strong></div> -->
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-button
          variant="primary"
          :disabled="searchDisabled"
          @click="onSearch()"
          class="float-left"
        >Search</b-button>
      </b-col>
      <b-col>
        <b-button variant="primary" :disabled="!searched" class="float-right">
          <json-csv
            :data="records"
            :name="currentDataset + currentEpoch + '_searchresult.csv'"
          >Download as CSV</json-csv>
        </b-button>
      </b-col>
    </b-row>
    <!-- Searched table element -->
    <b-spinner label="Loading..." v-if="searching" variant="info" v-bind:style="{marginTop: '2em'}"></b-spinner>
    <hr v-if="searched" v-bind:style="{marginBottom: 0}">
    <missing-value-view
      v-if="searched"
      :records="records"
      :dsname="dsname"
      :currentEpoch="currentEpoch"
    ></missing-value-view>
  </b-container>
</template>

<script>
/* eslint-disable no-console */
import axios from "axios";
import _ from "lodash";
import {
  getNameForDisplay,
  getFullLanguage,
  getHTMLLinks,
  languageAbbrMap
} from "../utils/utils";
import JsonCSV from "vue-json-csv";
import MissingValueTableView from "./MissingValueTableView.vue";

const backendurl =
  "https://explorer-backend-dot-dataz-wikiloop-dev.appspot.com";
const languageSupported = Object.keys(languageAbbrMap)
  .sort((a, b)=>{return languageAbbrMap[a].localeCompare(languageAbbrMap[b])});
const nullEpochList = [{ value: null, text: "Please choose a dataset first" }];

export default {
  name: "AdvancedSearch",
  props: ["dsname", "epoch"],
  components: {
    "json-csv": JsonCSV,
    "missing-value-view": MissingValueTableView
  },
  data() {
    return {
      selectedLanguage: [],
      currentDataset: null,
      currentEpoch: null,
      inputItem: "",
      datasetlist: [],
      epochlist: [],
      languages: [],
      // Table properties
      perPage: 20,
      pageOptions: [5, 20, 100],
      currentPage: 1,
      fields: [],
      searching: false,
      searched: false,
      totalRows: 1,
      selectedPage: null,
      records: []
    };
  },
  mounted: function() {
    this.initiateData();
  },
  computed: {
    inputItemState: function() {
      if (!this.inputItem) {
        return true;
      }
      let items = this.inputItem.split(",");
      let check = true;
      items.forEach(i => {
        i = i.trim();
        // Each item should follow pattern "Q<number>" or "P<number>"
        // and shorter than 10 char when not empty
        if (i.length > 0 && (i.length > 10 || !/^[QqPp]\d+$/.test(i))) {
          check = false;
        }
      });
      return check;
    },
    invalidFeedback: function() {
      return this.inputItemState === false ? "Wrong input format!" : "";
    },
    searchDisabled: function() {
      if (this.currentDataset && this.currentEpoch && this.inputItemState) {
        return false;
      } else {
        return true;
      }
    }
  },
  methods: {
    initiateData: async function() {
      this.currentDataset = this.dsname ? this.dsname : null;
      this.currentEpoch = this.epoch ? this.epoch : null;
      this.datasetlist = await this.getDatasetOptions();
      if (this.dsname) {
        this.epochlist = await this.getEpochOptions(this.dsname);
      } else {
        this.epochlist = nullEpochList;
      }
      this.languages = this.getLangOptions();
    },
    getDatasetOptions: async function() {
      try {
        var res = await axios.get(backendurl + "/dslist");
      } catch (err) {
        console.error(err);
      }
      let list = res.data;
      let options = [{ value: null, text: "Choose a dataset" }];
      list.forEach(e => {
        options.push({ value: e, text: getNameForDisplay(e) });
      });
      return options;
    },
    getEpochOptions: async function(dataset) {
      try {
        var res = await axios.get(backendurl + "/dsepoch/" + dataset);
      } catch (err) {
        console.error(err);
      }
      let options = [{ value: null, text: "Choose an epoch" }];
      options = options.concat(res.data);
      return options;
    },
    getLangOptions: function() {
      let options = [{ value: "none", text: "None" }];
      languageSupported.forEach(l => {
        options.push({ value: l, text: getFullLanguage(l) });
      });
      return options;
    },
    onDatasetChange: async function() {
      let router = this.$router;
      if (this.currentDataset) {
        // this.currentEpoch = null;
        // this.epochlist = await this.getEpochOptions(this.currentDataset);
        router.push({
          name: "AdvancedSearch",
          query: { dsname: this.currentDataset }
        });
      } else {
        router.push({ name: "AdvancedSearch" });
      }
    },
    onSearch: async function() {
      let dt = {
        dsname: this.currentDataset,
        epoch: this.currentEpoch,
        items: this.inputItem,
        languages: this.selectedLanguage
      };
      this.searched = false;
      this.searching = true;
      let res = await axios.post(backendurl + "/advancedsearch", dt);
      this.searching = false;
      this.searched = true;
      this.records = res.data;
      this.totalRows = this.records.length;
      if (this.currentDataset.includes("missing")) {
        this.fields = [
          { key: "qNumber", label: "Wikidata entity", sortable: true },
          { key: "missingValue", label: "Missing value", sortable: true },
          { key: "refs", label: "Wikipedia reference", sortable: true }
        ];
      }
    },
    getALinks: function(refs) {
      return getHTMLLinks(refs);
    },
    getWikidataLink: function(qNumber) {
      return `<a href='https://www.wikidata.org/wiki/${qNumber}' target='_blank'> ${qNumber} </a>`;
    },
    getTotalPage: function() {
      return Math.ceil(this.totalRows / this.perPage);
    },
    getPageOptions: function() {
      let ops = _.range(this.getTotalPage() + 1);
      return ops.map(o => {
        if (o == 0) {
          return { value: null, text: "Jump to" };
        } else {
          return o;
        }
      });
    }
  }
};
</script>