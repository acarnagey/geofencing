import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import "./App.scss";
import { Button, Card, Grid, TextField } from "@material-ui/core";

mapboxgl.accessToken = process.env.MAPBOX_API_KEY;

export default class App extends Component {
  mapContainer: HTMLDivElement | null;

  state = {
    map: {},
    zoom: 8,
    services: [],
    location: {
      latitude: 36.3369601,
      longitude: -96.8176006,
    },
    latLons:
      "3660 9704 3664 9705 3663 9657 3616 9680 3617 9682 3625 9682 3625 9692 3633 9693 3634 9703 3651 9703 3651 9701 3653 9698 3655 9690 3658 9689 3660 9692 3658 9698 3659 9705",
  };

  componentDidMount() {
    this.initMap();
  }

  initMap() {
    const { latLons } = { ...this.state };
    const map = new mapboxgl.Map({
      container: this.mapContainer!,
      style: "mapbox://styles/mapbox/streets-v11",
      // style: "mapbox://styles/mapbox/dark-v10",
      center: [this.state.location.longitude, this.state.location.latitude],
      zoom: this.state.zoom,
    });
    const latLonList = latLons.split(" ");
    const coordinates: any = [];
    for (let i = 0; i < latLonList.length; i = i + 2) {
      const lat = Number(latLonList[i + 1]) / -100;
      const lng = Number(latLonList[i]) / 100;
      coordinates.push([lat, lng]);
    }
    map.on("load", () => {
      map.addSource("maine", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
        },
      });
      map.addLayer({
        id: "maine",
        type: "fill",
        source: "maine",
        layout: {},
        paint: {
          "fill-color": "#088",
          "fill-opacity": 0.8,
        },
      });
    });
    this.setState({ map });
  }

  render() {
    const { latLons, location } = { ...this.state };
    return (
      <div className="container">
        <div ref={(el) => (this.mapContainer = el)} className="map-container" />
        <Card className="form-container">
          <TextField
            className="lat-lons"
            id="standard-basic"
            label="Geofence"
            fullWidth
            multiline
            rows={5}
            value={latLons}
          />
          <Grid item xs={12}>
            <Button variant="contained" color="primary" disabled>
              Set Geofence
            </Button>
          </Grid>
          <TextField
            // className="lat-lons"
            label="latitude"
            // fullWidth
            // multiline
            // rows={5}
            value={location.latitude}
          />
          <TextField
            // className="lat-lons"
            label="longitude"
            // fullWidth
            // multiline
            // rows={5}
            value={location.longitude}
          />
          <Grid item xs={12}>
            <Button variant="contained" color="primary" disabled>
              Set Location
            </Button>
          </Grid>
        </Card>
      </div>
    );
  }
}
