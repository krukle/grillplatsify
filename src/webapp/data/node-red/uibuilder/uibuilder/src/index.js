/* jshint browser: true, esversion: 5, asi: true */
/*globals Vue, uibuilder */
// @ts-nocheck
/*
  Copyright (c) 2019 Julian Knight (Totally Information)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
'use strict'

/** @see https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Front-End-Library---available-properties-and-methods */

// eslint-disable-next-line no-unused-vars
var app1 = new Vue({
    el: '#app',
    data: {
        mapboxToken : 'pk.eyJ1Ijoib2Vuc3Ryb20iLCJhIjoiY2tpajJzNmswMmRmdzJycGV0NjZzdjZxbSJ9.fyY_n0hhtJBJuxtK0GBidA',
        msgRecvd    : '[Nothing]',
        map         : null,
        tileLayer   : null,
        pycoms: [
            {
                id: "olofs_pycom",
                name: "Svinö",
                lat: 56.679817820502805,
                lon: 16.381292377038996
            },
            {
                id: "christoffers_pycom",
                name: "Värsnäs",
                lat: 56.72020603108509,
                lon: 16.372115027943583
            },
            {
                id: "isacs_pycom",
                name: "Jutnabben",
                lat: 56.68470129936251,
                lon: 16.369756906536878
            }
        ],
        markers: [],
    },
    methods: {
        // Create the Leaflet map from mapbox api.
        initMap: function() {
            this.map = L.map('map').setView([56.678673285247974, 16.36233661588886], 13);
            this.tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: this.mapboxToken,
            });
            this.tileLayer.addTo(this.map);
        },
        // Create the markers and add to map.
        initMarkers: function() {
            var myIcon = L.icon({
                iconUrl: './fire_red.png',
                iconSize: [48, 48]
            });
            this.pycoms.forEach(function(el) {
                var x = L.marker(
                    [el.lat, el.lon],
                    {icon: myIcon, id: el.id, alt: el.name, status: 'Upptagen'}
                ).addTo(this.map);
                x.bindPopup(this.newPopupContent(x, true));
                this.markers.push(x);
            }, this);
        },
        // Create content for the popups when clicking a marker.
        newPopupContent: function(marker, occupied) {
            var cls = occupied ? 'red' : 'green';
            var cor = marker.getLatLng();
            var link = `https://www.google.com/maps/dir/?api=1&destination=${cor.lat},${cor.lng}`;
            return `
                <h5>${marker.options.alt}</h5>
                <p>Status: <span class="${cls}">${marker.options.status}</span><br>
                <a href="${link}" target="_blank">Vägbeskrivning hit</a></p>
            `;
        },
        // Change the status (icon & text) of a fireplace.
        changeStatus: function(key, value) {
            var marker = this.markers.find(el => el.options.id === key);
            if (marker == null) return;
            var icon = marker.getIcon();
            if (value === 1) {
                marker.options.status = 'Upptagen';
                marker.setPopupContent(this.newPopupContent(marker, true));
                icon.options.iconUrl = './fire_red.png';
                marker.setIcon(icon);
            } else {
                marker.options.status = 'Ledig';
                marker.setPopupContent(this.newPopupContent(marker, false));
                icon.options.iconUrl = './fire_green.png';
                marker.setIcon(icon);
            }
        },
    },
    // Init map, markers. Start uibuilder.
    mounted: function(){
        this.initMap();
        this.initMarkers();
        uibuilder.start();
        var vueApp = this;

        // If msg changes - msg is updated when a standard msg is received from Node-RED over Socket.IO
        uibuilder.onChange('msg', function(newVal){
            vueApp.msgRecvd = newVal;
            if (newVal.hasOwnProperty('status')) { //Client connect, get latest status
                for (var key in newVal.status) {
                    if (!newVal.status.hasOwnProperty(key)) continue;
                    vueApp.changeStatus(key, newVal.status[key]);
                }
            } else if (newVal.hasOwnProperty('payload')) { //Normal msg
                vueApp.changeStatus(newVal.payload[1].device, newVal.payload[0].value);
            }
        })
    }
});