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
    <a href="https://meta.wikimedia.org/wiki/WikiProject_WikiLoop" target="_blank">
    <b-img :src="require('@/assets/WikiLoop_Explorer_Logo.jpg')" fluid alt="Responsive image">
    </b-img>
    </a>
    <h1 class="my-4" style="font-size:4vw;">Welcome to Wikiloop Explorer!</h1>
  </div>
</template>

<script>
export default {
  name: 'WelcomePage'
}
</script>

<style>
.grey-color {
  color:grey; 
}

.text-italic {
  font-style:italic;
}

.text-underline {
  text-decoration: underline;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.cursor-pointer {
  cursor: pointer;
}

.foot-note {
  color:grey;
  font-style:italic;  
  text-align: left;
}

.remove-margin-bottom {
  margin-bottom: 0;
}

.h2-section-margin {
  margin-top: 3rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.passage-margin {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.tool-passage {
  font-size: 1.15rem;
}

.head-description {
  font-size: 1.3rem
}

.error-message {
  font-size: 1.3rem;
  color: red
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
