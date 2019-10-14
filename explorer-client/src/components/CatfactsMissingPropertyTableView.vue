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
<div>
    <b-row>
      <!-- Filter -->
      <b-col md="6" class="my-2">
        <b-form-group class="my-2">
          <b-input-group>
            <b-form-input v-model="filter" placeholder="Type to Filter"></b-form-input>
            <b-input-group-append>
              <b-button variant="outline-primary" :disabled="!filter" @click="filter = ''">Clear</b-button>
              <b-button
                variant="outline-primary"
                :to="{ name: 'CatFactsAdvancedSearch', query:{dsname: dsname, epoch: currentEpoch}}"
                v-if="!this.$route.path.includes('advancedsearch')"
              >Advanced search</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
      <!-- Rows per page -->
      <b-col md="4" offset-md="2" class="my-2">
        <b-form-group label-cols-md="5" label="Rows per page" label-align-md="left" class="my-2">
          <b-form-select v-model="perPage" :options="pageOptions"></b-form-select>
        </b-form-group>
      </b-col>
    </b-row>
    <span v-if="records.length === recordsLimit" style="color:grey; font-style:italic; float:left">Note: Only {{recordsLimit}} rows are rendered here. You can download the full dataset in Advanced Search.</span>
    <!-- Main table element -->
    <b-table
      responsive
      striped
      bordered
      hover
      id="my-table"
      head-variant="light"
      :items="records"
      :fields="conditionalFields"
      :per-page="perPage"
      :current-page="currentPage"
      :filter="filter"
      @filtered="onFiltered"
    >
      <template v-slot:cell(entity)="data">
        <span v-html="getWikidataLinkByQNumber(data.value)"></span>
      </template>
      <template v-slot:cell(category)="data">
        <span v-html="getWikidataLinkByQNumber(data.value)"></span>
      </template>   
      <template v-slot:cell(property)="data">
        <span v-html="getWikidataLinkByPNumber(data.value)"></span>
      </template>  
      <template v-slot:cell(missingValue)="data">
        <span v-html="displayMissingValue(data.value)"></span>
      </template>                 
      <template v-slot:cell(refs)="data">
        <span v-html="getALinks(data.value)"></span>
      </template>  
      <template v-slot:cell(user)="data">
        <span v-html="getWikidataUserLink(data.value)"></span>
      </template>        
    </b-table>

    <b-row align-v="center" align-h="start">
      <b-col md="4" class="my-1">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          class="my-0"
          aria-controls="my-table"
        ></b-pagination>
      </b-col>
      <b-col md="6" offset-md="2" class="my-1 self-right">
        <b-form-group
          label-cols-md="6"
          :label="'Total: ' + getTotalPage() + ' pages'"
          label-align-md="right"
          class="my-1 self-right"
        >
          <b-form-select
            v-model="selected"
            :options="getOptions()"
            @change="currentPage = selected"
          ></b-form-select>
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
/* eslint-disable no-console */
import _ from "lodash";
import { getHTMLLinks, getNameForDisplay } from "../utils/utils";

export default {
  name: "CatfactsMisingPropertyTableView",
  props: ["records", "dsname", "currentEpoch", "reviewed"],
  data() {
    return {
      pageOptions: [5, 20, 100],
      currentPage: 1,
      selected: null,
      totalRows: this.records.length,
      perPage: 20,
      filter: null,
      recordsLimit: 1000
    };
  },
  computed: {
    dsDisplayName: function() {
      return getNameForDisplay(this.dsname);
    },
    conditionalFields: function() {
      if (this.reviewed) {
        return [
          { key: "entity", label: "Wikidata entity", sortable: true },
          { key: "category", label: "Wikidata Category", sortable: true},
          { key: "property", label: "Property", sortable: true},
          { key: "missingValue", label: "Property Value"},
          { key: "refs", label: "Wikipedia Category Reference"},
          { key: "user", label: "User", sortable: true},
          { key: "decision", label: "Decison"}   
        ];
      } else {
        return [
          { key: "entity", label: "Wikidata entity", sortable: true },
          { key: "category", label: "Wikidata Category", sortable: true},
          { key: "property", label: "Property", sortable: true},
          { key: "missingValue", label: "Property Value"},
          { key: "refs", label: "Wikipedia Category Reference"}     
        ];
      }
    }
  },
  methods: {
    getALinks: function(arg) {
      return getHTMLLinks(arg);
    },
    getWikidataLinkByQNumber: function(arg) {
      return `<a href="https://www.wikidata.org/wiki/${arg}" target="_blank"> ${arg} </a>`;
    },
    getWikidataLinkByPNumber: function(arg) {
      return `<a href="https://www.wikidata.org/wiki/Property:${arg}" target="_blank"> ${arg} </a>`;
    },
    getWikidataUserLink: function(arg) {
      return `<a href="https://www.wikidata.org/wiki/User:${arg}" target="_blank"> ${arg} </a>`;
    },
    displayMissingValue: function(arg) {
      let reg = RegExp('Q.+');
      if (arg.includes('http://www.wikidata.org/wiki/Q')){
        let qNumber = arg.replace("http://www.wikidata.org/wiki/", "");
        return `<a href="${arg}" target="_blank">${qNumber}</a>`;
      }else if (reg.test(arg)){
        return `<a href="http://www.wikidata.org/wiki/${arg}" target="_blank">${arg}</a>`;
      }
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
    }
  }
};
</script>