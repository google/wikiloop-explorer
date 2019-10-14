// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Util functions for explorer client side

const datasetNameToDisplayMap = {
  'missingdateofdeath': 'Missing Date of Death',
  'missingdateofbirth': 'Missing Date of Birth',
  'missingplaceofbirth': 'Missing Place of Birth',
  'catfacts_missingproperty': 'Category Facts - Missing Property'
}

export const languageAbbrMap = {
  'en': 'English',
  'de': 'German',
  'fr': 'French',
  'ru': 'Russian',
  'it': 'Italian', 
  'es': 'Spanish',
  'pl': 'Polish',
  'ja': 'Japanese',
  'zh': 'Chinese',
  'pt': 'Portuguese',
  'fa': 'Persian',
  'ar': 'Arabic',
  'nl': 'Dutch',
  'he': 'Hebrew',
  'uk': 'Ukrainian',
  'id': 'Indonesian',
  'sv': 'Swedish',
  'ko': 'Korean',
  'cs': 'Czech',
  'vi': 'Vietnamese',
  'fi': 'Finnish',
  'hu': 'Hungarian',
  'bn': 'Bengali',
  'hi': 'Hindi',
  'th': 'Thai',
  'ca': 'Catalan',
  'el': 'Greek',
  'no': 'Norwegian (Bokmål)',
  'tr': 'Turkish',
  'da': 'Danish',
  'bg': 'Bulgarian',
  'et': 'Estonian',
  'hr': 'Croatian',
  'lt': 'Lithuanian',
  'lv': 'Latvian',
  'ms': 'Malay',
  'ro': 'Romanian',
  'sk': 'Slovak',
  'sl': 'Slovene',
  'sr': 'Serbian',
  'tl': 'Tagalog'
}

export function getNameForDisplay(dsname) {
  return datasetNameToDisplayMap[dsname];
}

export function getFullLanguage(langAbbr) {
  return languageAbbrMap[langAbbr];
}

export function getUrlLanguage(url) {
  // Chinese Wikipedia only take zh-cn
  let lang = url.replace(/^http:\/\//, "");
  return lang.replace(/\.wikipedia.*$/, "");
}

export function getHTMLLinks(refs) {
  refs = refs.split(', ');
  let links = refs.map(u => {
      return `<a href=${u} target='_blank'> ${getUrlLanguage(u).toUpperCase() + ' Wikipedia'} </a>`
  })
  let html = '';
  links.forEach(l => {
      if (html) {
          html += ', ' + l;
      }else {
          html += l;
      }
  })
  html = `<span>${html}</span>`;
  return html;
}
