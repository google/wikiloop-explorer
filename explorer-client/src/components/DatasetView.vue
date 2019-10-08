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
  <!-- User Interface controls -->
  <b-container class="my-2">
    <b-row align-v="center">
      <b-col>
        <p class="font-weight-bold my-4 text-left" style="font-size: 1.8rem;">{{dsDisplayName}}</p>
      </b-col>
    </b-row>
    <b-row>
      <!-- Link to stats -->
      <b-col md="2" class="my-2">
        <b-button
          variant="primary"
          :to="{ name: 'Stats', params:{dsname: dsname, epoch: currentEpoch}}"
        >Statistics</b-button>
      </b-col>
      <!-- Link to Game -->
      <b-col md="2" class="my-2">
        <b-button variant="primary" :href="gameLink" target="_blank">Game!</b-button>
      </b-col>
      <!-- Link to leaderboard -->
      <b-col md="2" class="my-2">
        <b-button
          variant="primary"
          :to="{ name: 'Leaderboard', params:{dsname: dsname, epoch: currentEpoch}}"
        >Leaderboard</b-button>
      </b-col>
      <b-col md="4" offset-md="2">
        <b-form-group label-cols-md="5" label="Dateset epoch" label-align-md="left" class="my-2">
          <b-form-select v-model="currentEpoch" :options="dataEpochs" @change="changeDsEpoch()"></b-form-select>
        </b-form-group>
      </b-col>
    </b-row>
    <b-spinner label="Loading..." v-if="loading" variant="info" v-bind:style="{marginTop: '2em'}"></b-spinner>
    <missing-value-view 
      v-if="!loading && !dsname.includes('catfacts')"
      :records="records"
      :dsname="dsname"
      :currentEpoch="currentEpoch"
    ></missing-value-view>
    <catfacts-missing-property
      v-else-if="!loading && dsname.includes('catfacts')"
      :records="records"
      :dsname="dsname"
      :currentEpoch="currentEpoch" 
    ></catfacts-missing-property>
  </b-container>
</template>

<script>
/* eslint-disable no-console */
import axios from "axios";
import _ from "lodash";
import { getHTMLLinks, getNameForDisplay } from "../utils/utils";
import MissingValueTableView from "./MissingValueTableView.vue";
import CatfactsMissingPropertyTableView from "./CatfactsMissingPropertyTableView.vue";

const backend_url =
  "https://explorer-backend-dot-dataz-wikiloop-dev.appspot.com";
const game_root_url = "https://tools.wmflabs.org/wikidata-game/distributed";

export default {
  name: "DatasetView",
  props: ["dsname"],
  components: {
    "missing-value-view": MissingValueTableView,
    "catfacts-missing-property": CatfactsMissingPropertyTableView},  
  data() {
    return {
      loading: true,
      dsname_indata: "",
      pageOptions: [5, 20, 100],
      currentPage: 1,
      selected: null,
      totalRows: 1,
      perPage: 20,
      filter: null,
      records: [],
      dataEpochs: [],
      currentEpoch: "",
    };
  },
  mounted: function() {
    this.initiateView();
  },
  computed: {
    dsDisplayName: function() {
      return getNameForDisplay(this.dsname);
    },
    gameLink: function() {
      switch (this.dsname) {
        case "missingdateofdeath":
          return game_root_url + "/#game=53";
        case "missingdateofbirth":
          return game_root_url + "/#game=50";
        case "missingplaceofbirth":
          return game_root_url + "/#game=54";
        case "catfacts_missingproperty":
          return game_root_url + "/#game=56";
        default:
          return "#";
      }
    }
  },
  methods: {
    initiateView: function() {
      axios.get(backend_url + "/dsepoch/" + this.dsname).then(response => {
        this.dataEpochs = response.data;
        this.currentEpoch = this.dataEpochs[0];
      });
      // // Initialization for missing value dataset
      // else if (this.dsname.includes("missing")) {
      axios
        .get(backend_url + "/ds/" + this.dsname)
        .then(response => {
          this.loading = false;
          this.records = response.data;
          this.totalRows = this.records.length;
        })
        .catch(error => {
          this.loading = false;
          throw error;
        });
      // }
    },
    getALinks: function(arg) {
      return getHTMLLinks(arg);
    },
    getWikidataLink: function(arg) {
      return `<a href='https://www.wikidata.org/wiki/Q${arg}' target='_blank'> ${arg} </a>`;
    },
    onFiltered: function(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    getTotalPage: function() {
      return Math.ceil(this.totalRows / this.perPage);
    },
    getOptions: function() {
      let ops = _.range(this.getTotalPage() + 1);
      return ops.map(o => {
        if (o == 0) {
          return { value: null, text: "Jump to" };
        } else {
          return o;
        }
      });
    },
    changeDsEpoch: function() {
      this.loading = true;     
      axios
        .get(backend_url + "/ds/" + this.dsname + "/" + this.currentEpoch)
        .then(response => {
          this.loading = false;
          this.records = response.data;
          this.totalRows = this.records.length;
        });
    }
  }
};
</script>