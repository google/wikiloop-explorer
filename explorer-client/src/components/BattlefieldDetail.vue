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
    <b-col sm="6">
      <h1 class="font-weight-bold my-4 text-left">Wikiloop Battlefield</h1>
    </b-col>
    <b-col sm="6">
      <b-button variant='primary' href="http://battlefield.wikiloop.org/" target='_blank'  class="float-right">Go to game!</b-button>
    </b-col>
  </b-row>
  <b-row class="text-left" align-v="center">
    <b-col>
      <p class="head-description">
        Wikiloop Battlefield is a web app project built to allow people to fight vandalism on Wikipedia collaboratively.<br>
        Scroll down for instructions and tool statistics.
      </p>
    </b-col>
  </b-row>
  <b-row>
    <b-col>
      <h2 id="how-to-play" class="h2-section-margin text-left">How To Play</h2>
    </b-col>
  </b-row>
  <b-row>
    <b-col class="text-left">
      <p class="passage-margin tool-passage">Structure of each tile displayed</p>
      <b-img :src="require('@/assets/Battlefield_tile_explanation.png')" fluid alt="Responsive image"></b-img>
    </b-col>
  </b-row>  
  <b-row align-v="center">
    <b-col class="text-left">
      <p class="passage-margin tool-passage">GIF instruction</p>
      <!-- <div>
        <b-embed
          type="iframe"
          aspect="16by9"
          src="https://www.youtube.com/embed/video_id"
          allowfullscreen
        ></b-embed>
      </div> -->
      <b-img :src="require('@/assets/battlefield-demo-1.2.0-beta.gif')" fluid alt="Responsive image"></b-img>
    </b-col>
  </b-row>
  <b-row>
    <b-col class="text-left">
      <h2 id="user-choice-distribution" class="h2-section-margin text-left">User Choice Distribution</h2>
      <p class="passage-margin tool-passage">
        Note that numbers of total choice and total revision are different. This is because one revision could receive more than one choices from different users(actually this is what we expected).
      </p>
    </b-col>
  </b-row>
  <b-row align-v="center">
    <b-col md="6" class="text-left">
      <doughnut-chart v-if="loaded" :chartdata="choiceDistributionDonut" :options="defaultChartOptions"/>
    </b-col>
    <b-col md="6">
      <b-table bordered striped :items="choiceDistributionTable"></b-table>
    </b-col>
  </b-row>
  <b-row>
    <b-col class="text-left">
      <h2 id="user-choice-table" class="h2-section-margin text-left">User Choices In Table</h2>
      <p class="passage-margin tool-passage">
        All choices made in the app are displayed in the following table. Filter by revision number to check choices it received.
      </p>      
    </b-col>
  </b-row>
  <b-row>
  <!-- Filter -->
      <b-col md="6" class="my-2">
        <b-form-group class="my-2">
          <b-input-group>
            <b-form-input v-model="filter" placeholder="Filter by revision"></b-form-input>
            <b-input-group-append>
              <b-button variant="outline-primary" :disabled="!filter" @click="filter = ''">Clear</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>  
      <b-col md="4" offset-md="2" class="my-2">
        <b-form-group label-cols-md="4" label="Choice Filter" label-align-md="left" class="my-2">
          <b-form-select v-model="display" :options="revisionOptions"></b-form-select>
        </b-form-group>
      </b-col>    
  </b-row>
  <b-row>
    <b-table
      responsive
      striped
      bordered
      hover
      id="revision-table"
      head-variant="light"
      :items="displayRevisions"
      :fields="tableFields"
      :per-page="perPage"
      :current-page="currentPage"
      :filter="filter"
      @filtered="onFiltered" 
      :filter-function="tableFilter"
    >
      <template v-slot:cell(title)="data">
        <span v-html="getTitleLink(data.value)"></span>
      </template>
      <template v-slot:cell(diff)="data">
        <span v-html="getDiffLink(data.value)"></span>
      </template>      
    </b-table>    
  </b-row>
  <b-row align-v="center" align-h="start">
    <b-col md="4" class="my-1">
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        class="my-0"
        aria-controls="revision-table"
      ></b-pagination>
    </b-col>
  </b-row>  
  <footer style="height: 50px"></footer>
</b-container>
</template>

<script>
import axios from "axios";
import DoughnutChart from './DoughnutChart.vue';
const backendurl =
  "https://explorer-backend-dot-dataz-wikiloop-dev.appspot.com";

export default {
  name: 'BattlefieldDetail',
  components: {"doughnut-chart": DoughnutChart}, 
  data() {
    return {
      result: {},
      records: [],
      choiceDistributionDonut: {},
      choiceDistributionTable: [],
      defaultChartOptions: {
        responsive: true,
        maintainAspectRatio: false
      },   
      loaded: false,
      // Table properties
      display: 'All',
      perPage: 20,
      revisionOptions: ['All', 'Should revert', 'Looks good', 'Not sure'],
      currentPage: 1,
      selectedPage: null,
      filter: null,
      filteredRows: 1,
      tableFields: [
          { key: "title", label: "Article Title", sortable: true },
          { key: "diff", label: "Current Rev vs. Previous Rev"},
          { key: "choice", label: "User Choice"}   
      ],
      filterIgnoredFields: ["title", "choice"]
    }
  },
  mounted: async function() {
    // load battlefield stats data
    let res;
    try{
      res= await axios.get(backendurl + "/battlefield/getInteractionCounts");
    }catch(e) {
      console.error(e);
    }
    this.loaded = true;
    res = res.data;
    this.records = res.allRevisions;
    this.choiceDistributionDonut = {
        labels: ["Should revert", "Not sure", "Looks good"],
        datasets: [
          {
            data: [res.ShouldRevert, res.NotSure, res.LooksGood],
            backgroundColor: ['#E74C3C', 'grey', '#27AE60']
          }
        ]
    };
    this.choiceDistributionTable = [
      {type: 'Should revert', number: res.ShouldRevert},
      {type: 'Not sure', number: res.NotSure},
      {type: 'Looks good', number: res.LooksGood},
      {type: 'Total choices', number: res.Total},
      {type: 'Total revisions', number: res.revisionCount}
    ];
  },
  computed: {
    displayRevisions: function() {
      return this.getRevisionsToDisplay();
    },
    totalRows: function() {
      return this.filter ? this.filteredRows : this.displayRevisions.length;
    }
  },
  methods: {
    tableFilter: function(row, filter) {
      return row.diff.currentRev.toString().includes(filter) || row.diff.oldRev.toString().includes(filter);
    },
    onFiltered: function(filteredItems) {
      this.filteredRows = filteredItems.length;
      this.currentPage = 1;
    },
    getTotalPage: function() {
      return Math.ceil(this.totalRows / this.perPage);
    },
    getTitleLink: function(arg) {
      let site = this.getSiteLink(arg.wikiSite);
      let title = arg.title;
      return `<a href="${site}wiki/${title}" target="_blank">${title}</a>`;  
    },
    getDiffLink: function(arg) {
      let site = this.getSiteLink(arg.wikiSite);
      let oldRev = arg.oldRev;
      let currentRev = arg.currentRev;
      return `<a href="${site}w/index.php?type=revision&diff=${oldRev}&oldid=${currentRev}" target="_blank">rev.${currentRev} vs rev.${oldRev}</a>`;
    },
    getSiteLink: function(arg) {
      let language = arg.replace("wiki", "");
      return `https://${language}.wikipedia.org/`;
    },
    getRevisionsToDisplay: function() {
      let result = [];
      this.records.forEach(r => {
        let row = {};
        row.title = {
          title: r.title,
          wikiSite: r.wikiSite
        };
        row.diff = {
          wikiSite: r.wikiSite,
          currentRev: r.currentRev,
          oldRev: r.oldRev
        };
        row.choice = `Should revert: ${r.judgementsCount.ShouldRevert}, Not sure: ${r.judgementsCount.NotSure}, Looks good: ${r.judgementsCount.LooksGood}`
        if (this.display == 'All') {
          result.push(row);
        }else if (this.display == "Should revert") {
          if (r.judgementsCount.ShouldRevert > 0) {
            result.push(row);
          }
        }else if (this.display == "Looks good") {
          if (r.judgementsCount.LooksGood > 0) {
            result.push(row);
          }
        }else if (this.display == "Not sure") {
          if (r.judgementsCount.NotSure > 0) {
            result.push(row);
          }
        }   
      });
      return result;     
    }
  }
}
</script>
