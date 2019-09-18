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
        <p class="font-weight-bold my-4 text-left" style="font-size: 1.8rem;">Leaderboard</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="6">
        <h3 class="text-left">{{datasetDsplayName}}</h3>
      </b-col>
      <b-col md="6">
        <h3 class="text-right">Epoch: {{epoch}}</h3>
      </b-col>
    </b-row>
    <b-card title="Editors Leaderboard">
      <b-spinner label="Loading..." v-if="loading" variant="info"></b-spinner>
      <b-row>
        <b-col>
          <GChart type="Table" :data="leaderboardData" :options="chartOptionsLeaderboard" />
        </b-col>
      </b-row>
    </b-card>
  </b-container>
</template>

<script>
import axios from "axios";
const backendurl =
  "https://explorer-backend-dot-dataz-wikiloop-dev.appspot.com";

export default {
  name: "Leaderboard",
  props: ["dsname", "epoch"],
  data() {
    return {
      loading: true,
      leaderboardData: [],
      chartOptionsLeaderboard: {
        showRowNumber: true,
        width: "100%",
        height: "100%",
        cssClassNames: {
          headerCell: "leaderboard-header-cell",
          tableCell: "leaderboard-center-text leaderboard-cell-text",
          rowNumberCell: "leaderboard-center-text"
        }
      }
    };
  },
  mounted: function() {
    this.initiateData();
  },
  computed: {
    datasetDsplayName: function() {
      switch (this.dsname) {
        case "missingdateofdeath":
          return "Missing Date of Death";
        case "missingdateofbirth":
          return "Missing Date of Birth";
        default:
          return "No matching record";
      }
    }
  },
  methods: {
    initiateData: async function() {
      // axios call to backend to get data
      let res = await axios.get(backendurl + "/dsleaderboard/" + this.dsname, {
        params: { epoch: this.epoch }
      });
      this.loading = false;
      this.leaderboardData.push(["Editor", "Action count"]);
      res.data.forEach(element => {
        this.leaderboardData.push([element.user, element.num]);
      });
    }
  }
};
</script>

<style>
.leaderboard-center-text {
  text-align: center;
}

.leaderboard-cell-text {
  font-size: large;
}

.leaderboard-header-cell {
  font-style: bold;
  font-size: large;
  background-color: lightrey;
  background-blend-mode: soft-light;
}
</style>