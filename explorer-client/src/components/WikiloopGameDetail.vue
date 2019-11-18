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
  <p class="font-weight-bold my-4 text-left" style="font-size: 1.8rem;">Wikiloop Game - {{datasetDisplayName}}</p>
  <div>
    {{getDescriptionByName}}
  </div>
</b-container>
</template>

<script>
import {
  getNameForDisplay
} from "../utils/utils";

export default {
  
  name: "WikiloopGameDetail",
  props: ["dsname"],
  data() {
    return {
    }
  },
  computed: {
    // Move to util
    getDescriptionByName: function() {
      switch(this.dsname) {
        case 'missingdateofdeath':
          return `This game is based on missing date of death dataset. See the latest `
      }
    },
    datasetDisplayName: function() {
      return getNameForDisplay(this.dsname);     
    },  
  }
}
</script>