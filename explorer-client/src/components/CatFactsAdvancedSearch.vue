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
      <b-col lg="12">
      <b-form-group 
        label-cols="4"
        label-cols-lg="2"
        label="Dataset Name"
        label-align="left"
      >
      <div class="col-form-label" style="text-align: left; font-weight: bold;">{{datasetDisplayName}}</div>
      </b-form-group>
      </b-col>
      <b-col>
      <b-form-group 
        label-cols="4"
        label-cols-lg="2"
        label="Dataset Epoch"
        label-align="left"
      >
      <div class="col-form-label" style="text-align: left; font-weight: bold;">{{epoch}}</div>
      </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <!-- Q number includes (AND) -->
      <b-col class="my-2 self-right">
        <b-form-group
          label-cols="4"
          label-cols-lg="2"
          label="Entity Includes (and)"
          label-for="entity-include-and"
          label-align="left"
          :invalid-feedback="invalidFeedback"
          :state="inputEntityState"
        >
          <b-form-input
            v-model="inputEntityAnd"
            placeholder="Example: Q123 or Q123,Q456 (if multiple entities). Same for the following inputs."
            id="entity-include-and"
            trim
            :state="inputEntityState"
          ></b-form-input>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <!-- Q number includes (OR) -->
      <b-col class="my-2 self-right">
        <b-form-group
          label-cols="4"
          label-cols-lg="2"
          label="Entity Includes (or)"
          label-for="entity-include-or"
          label-align="left"
          :invalid-feedback="invalidFeedback"
          :state="inputEntityState"
        >
          <b-form-input
            v-model="inputEntityOr"
            id="entity-include-or"
            trim
            :state="inputEntityState"
          ></b-form-input>
        </b-form-group>
      </b-col>
    </b-row>    
    <b-row>
      <!-- Multi selector on language -->
      <b-col class="my-2 self-right" md="6">
        <b-form-group
          label="Language Includes (and)"
          label-for="select-language-and"
          label-align="left"
        >
          <b-form-select
            v-model="selectedLanguageAnd"
            :options="languages"
            multiple
            :select-size="6"
            id="select-language-and"
          ></b-form-select>
          <!-- <div class="my-2">Selected: <strong>{{ language }}</strong></div> -->
        </b-form-group>
      </b-col>
      <b-col class="my-2 self-right" md="6">
        <b-form-group
          label="Language Includes (or)"
          label-for="select-language-or"
          label-align="left"
        >
          <b-form-select
            v-model="selectedLanguageOr"
            :options="languages"
            multiple
            :select-size="6"
            id="select-language-or"
          ></b-form-select>
          <!-- <div class="my-2">Selected: <strong>{{ language }}</strong></div> -->
        </b-form-group>
      </b-col>      
    </b-row>
    <b-row>
      <!-- Whether palyed in game -->
      <b-col>
      <b-form-group 
        label-cols="4"
        label-cols-lg="2"
        label="Reviewed in Game?"
        label-align="left"
      >
        <b-form-select v-model="reviewedInGame">
          <option value="all">All</option>
          <option value="yes">Reviewed</option>
          <option value="no">Not reviewed</option>
        </b-form-select>
      </b-form-group>  
      </b-col>
    </b-row>
    <div v-if="reviewedInGame === 'yes'">
      <b-row>
        <!-- Filter by user -->
        <b-col class="my-2 self-right">
          <b-form-group
            label-cols="4"
            label-cols-lg="2"
            label="User Includes"
            label-for="user-include"
            label-align="left"
          >
            <b-form-input
              v-model="userInclude"
              placeholder="Put wiki user name here, separate by ','."
              id="user-include"
              trim
            ></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>      
      <b-row>
        <!-- Filter by user decision -->
        <b-col>
        <b-form-group 
          label-cols="4"
          label-cols-lg="2"
          label="User decision (or)"
          label-align="left"
        >
          <b-form-select v-model="userDecision" multiple>
            <option value="all">All</option>
            <option value="yes">Accept</option>
            <option value="Wrong category semantics">Wrong category semantics</option>
            <option value="Wrong belongingship">Wrong belongingship</option>
            <option value="Nonsense">Not Valid</option>
          </b-form-select>
        </b-form-group>    
        </b-col>       
      </b-row>
    </div>
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
        <div class="float-right">
        <b-button 
          variant="primary" 
          :disabled="!searched || loadingError || records.length == 0 || recordsForDownload.length == 0" 
        >
          <json-csv
            :data="recordsForDownload"
            :name="dsname + '_epoch(' + epoch + ')_' + Date.now() + '.csv'"
          >Download Full Dataset</json-csv>
        </b-button>
        <p style="color:grey; font-style:italic;">Clickable when full dataset loaded.</p>
        </div>
      </b-col>
    </b-row>
    <!-- Searched table element -->
    <b-spinner label="Loading..." v-if="searching" variant="info" v-bind:style="{marginTop: '2em'}"></b-spinner>
    <hr v-if="searched" style="{marginBottom: 0}">
    <div v-if="searched && loadingError" style="font-weight: bold; font-size:1.5em">{{loadingErrorMessage}}</div>
    <div v-if="searched && !loadingError && records.length === 0" style="font-weight: bold; font-size:1.5em">No results.</div>
    <catfacts-missing-property
      v-if="searched && !loadingError && records.length != 0"
      :records="records"
      :dsname="dsname"
      :currentEpoch="epoch"
      :reviewed="reviewedInGame === 'yes'"
    ></catfacts-missing-property>
    <footer style="height: 50px"></footer>
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
import CatfactsMissingPropertyTableView from "./CatfactsMissingPropertyTableView.vue";

// const backendurl =
//   "https://explorer-backend-dot-dataz-wikiloop-dev.appspot.com";
const backendurl =
  "https://explorer-backend-dev-dot-dataz-wikiloop-dev.appspot.com";
const languageSupported = Object.keys(languageAbbrMap)
  .sort((a, b)=>{return languageAbbrMap[a].localeCompare(languageAbbrMap[b])});
const nullEpochList = [{ value: null, text: "Please choose a dataset first" }];
const recordsLimit = 1000;

export default {
  name: "CatFactsAdvancedSearch",
  props: ["dsname", "epoch"],
  components: {
    "json-csv": JsonCSV,
    "catfacts-missing-property": CatfactsMissingPropertyTableView
  },
  data() {
    return {
      selectedLanguageAnd: [],
      selectedLanguageOr: [],  
      // currentDataset: dsname,
      // currentEpoch: epoch,
      inputEntityAnd: "",
      inputEntityOr: "",
      reviewedInGame: "all",
      userInclude: "",
      userDecision: [],
      datasetlist: [],
      epochlist: [],
      languages: [],
      // Table properties
      perPage: 20,
      pageOptions: [5, 20, 100],
      currentPage: 1,
      searching: false,
      searched: false,
      totalRows: 1,
      selectedPage: null,
      records: [],
      recordsForDownload: [],
      loadingError: false,
      loadingErrorMessage: "",
    };
  },
  mounted: function() {
    this.initiateData();
  },
  computed: {
    inputEntityState: function() {
      if (!this.inputEntityAnd && !this.inputEntityOr) {
        return true;
      }
      let check = true;
      if (this.inputEntityAnd) {
        check = this.checkInputEntity(this.inputEntityAnd);
      }
      if (this.inputEntityOr) {
        check = check && this.checkInputEntity(this.inputEntityOr);
      }
      return check;
    },
    invalidFeedback: function() {
      return this.inputItemState === false ? "Wrong input format!" : "";
    },
    searchDisabled: function() {
      if (this.dsname && this.epoch && this.inputEntityState) {
        return false;
      } else {
        return true;
      }
    },
    datasetDisplayName: function() {
      return getNameForDisplay(this.dsname);     
    },    
  },
  methods: {
    initiateData: async function() {
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
    onSearch: async function() {
      let dt = {
        dsname: this.dsname,
        epoch: this.epoch,
        entitiesAnd: this.inputEntityAnd,
        entitiesOr: this.inputEntityOr,
        languagesAnd: this.selectedLanguageAnd,
        languagesOr: this.selectedLanguageOr,
        reviewed: this.reviewedInGame,
        userInclude: this.userInclude,
        userDecision: this.userDecision,
        type: "display"
      };
      this.searched = false;
      this.searching = true;
      let res = await axios.post(backendurl + "/advancedsearch", dt);
      this.recordsForDownload = [];
      this.searching = false;
      this.searched = true;
      if (res.status === '404') {
        this.loadingError = true;
        this.loadingErrorMessage = res.data.errMessage;
      }else {
        this.records = res.data;
        this.totalRows = this.records.length;
        if (this.records.length < recordsLimit) {
          this.recordsForDownload = this.records;
        }else {
          dt.type = "download";
          axios.post(backendurl + "/advancedsearch", dt).then(
            (response) => {
              this.recordsForDownload = response.data;
          })
        }
      }
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
    },
    checkInputEntity: function(entities) {
      let items = entities.split(",");
      let check = true;
      items.forEach(i => {
        i = i.trim();
        // Each item should follow pattern "Q<number>" or "P<number>"
        // and shorter than 10 char
        if (i.length > 0 && (i.length > 10 || !/^[QqPp]\d+$/.test(i))) {
          check = false;
        }
      });
      return check;      
    }
  }
};
</script>