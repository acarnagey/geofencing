import React, { Component, Fragment, RefObject } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "./App.scss";
import {
  Button,
  Card,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import GeoCoordinate from "../models/GeoCoordinate";
import GeoUtil from "../util/GeoUtil";

function Alert2(props) {
  return <Alert elevation={6} variant="filled" {...props} />;
}

mapboxgl.accessToken = process.env.MAPBOX_API_KEY!;

enum AlgorithmEnum {
  POINT_TO_POLYGON = "POINT_TO_POLYGON",
  CIRCLE_TO_POLYGON = "CIRCLE_TO_POLYGON",
}

interface AppState {
  map?: Map;
  zoom: number;
  services: any;
  location: any;
  latLons: string;
  showAlert: boolean;
  hasIntersection: boolean;
  selectedAlgorithm: AlgorithmEnum;
}

export default class App extends Component<{}, AppState> {
  mapContainerRef: any;
  // mapContainerRef: RefObject<HTMLDivElement> | HTMLElement | null;

  constructor(props) {
    super(props);
    this.mapContainerRef = React.createRef();
    const latitude = 36.3369601;
    const longitude = -96.8176006;
    const zoom = 9;
    this.state = {
      hasIntersection: false,
      selectedAlgorithm: AlgorithmEnum.POINT_TO_POLYGON,
      showAlert: false,
      zoom,
      services: [],
      location: {
        latitude,
        longitude,
        radiusInMiles: 1,
      },
      latLons:
        "3660 9704 3664 9705 3663 9657 3616 9680 3617 9682 3625 9682 3625 " +
        "9692 3633 9693 3634 9703 3651 9703 3651 9701 3653 9698 3655 9690 " +
        "3658 9689 3660 9692 3658 9698 3659 9705",
    };
  }

  componentDidMount() {
    this.initMap();
  }

  checkIntersection = () => {
    const { latLons, location, selectedAlgorithm } = { ...this.state };
    const geoCoordinates: GeoCoordinate[] = GeoUtil.latlonStringToGeoCoordinates(
      latLons
    );
    const serviceGeoCoord: GeoCoordinate = {
      latitude: location.latitude,
      longitude: location.longitude,
    };
    let hasIntersection = false;
    if (selectedAlgorithm === AlgorithmEnum.POINT_TO_POLYGON) {
      hasIntersection = GeoUtil.pointInPolygon(geoCoordinates, serviceGeoCoord);
    } else {
      geoCoordinates.push(geoCoordinates[0]);
      hasIntersection = GeoUtil.circleInPolygon(
        geoCoordinates,
        serviceGeoCoord,
        location.radiusInMiles
      );
    }
    this.setState({ showAlert: true, hasIntersection });
  };

  setLocation = () => {
    const { map, location } = { ...this.state };
    (map!.getSource("poi") as any).setData({
      type: "Feature",
      properties: [],
      geometry: {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      },
    });
    map!.panTo([location.longitude, location.latitude]);
    // map!.setPaintProperty("poi", "circle-color", "blue");
    map!.setPaintProperty("poi", "circle-radius", {
      stops: [
        [0, 0],
        [
          20,
          this.milesToPixelsAtMaxZoom(
            location.radiusInMiles,
            location.latitude
          ),
        ],
      ],
      base: 2,
    });
  };

  milesToPixelsAtMaxZoom = (miles, latitude) =>
    (miles * 1609.344) / 0.075 / Math.cos((latitude * Math.PI) / 180);

  initMap() {
    const { latLons, location, zoom } = { ...this.state };
    const map = new mapboxgl.Map({
      container: this.mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      // style: "mapbox://styles/mapbox/dark-v10",
      center: [location.longitude, location.latitude],
      zoom,
    });
    const scale = new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: "imperial",
    });
    map.addControl(scale);
    scale.setUnit("imperial");

    const latLonList = latLons.split(" ");
    const coordinates: any = [];
    for (let i = 0; i < latLonList.length; i = i + 2) {
      const lat = Number(latLonList[i + 1]) / -100;
      const lng = Number(latLonList[i]) / 100;
      coordinates.push([lat, lng]);
    }
    map.on("load", () => {
      map.addSource("geofence", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: [],
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
        },
      });
      map.addLayer({
        id: "geofence",
        type: "fill",
        source: "geofence",
        layout: {},
        paint: {
          "fill-color": "#088",
          "fill-opacity": 0.8,
        },
      });
      map.addSource("poi", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: [],
          geometry: {
            type: "Point",
            coordinates: [location.longitude, location.latitude],
          },
        },
      });
      map.addLayer({
        id: "poi",
        type: "circle",
        source: "poi",
        paint: {
          "circle-radius": {
            stops: [
              [0, 0],
              [
                20,
                this.milesToPixelsAtMaxZoom(
                  location.radiusInMiles,
                  location.latitude
                ),
              ],
            ],
            base: 2,
          },
          "circle-color": "red",
          "circle-opacity": 0.6,
          // "circle-stroke-width": 4,
          // "circle-stroke-color": "blue",
        },
      });
    });
    this.setState({ map });
  }

  render() {
    const {
      latLons,
      location,
      showAlert,
      selectedAlgorithm,
      hasIntersection,
    } = {
      ...this.state,
    };
    return (
      <div className="container">
        <div ref={this.mapContainerRef} className="map-container" />
        <Card className="form-container">
          <h2>Intersection Inputs</h2>
          <TextField
            className="lat-lons"
            id="standard-basic"
            label="Geofence"
            fullWidth
            multiline
            rows={5}
            value={latLons}
            disabled
          />
          <Grid item xs={12}>
            <Button variant="contained" color="primary" disabled>
              Set Geofence
            </Button>
          </Grid>
          <TextField
            type="number"
            label="latitude"
            value={location.latitude}
            onChange={(e) => {
              location.latitude = e.target.value;
              this.setState({ location });
            }}
          />
          <TextField
            type="number"
            label="longitude"
            value={location.longitude}
            onChange={(e) => {
              location.longitude = e.target.value;
              this.setState({ location });
            }}
          />
          <TextField
            type="number"
            label="radius in miles"
            value={location.radiusInMiles}
            onChange={(e) => {
              location.radiusInMiles = e.target.value;
              this.setState({ location });
            }}
          />
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              disabled={location.radiusInMiles < 1}
              onClick={this.setLocation}
            >
              Set Location
            </Button>
          </Grid>
          <h2>Intersection Algorithms</h2>
          <FormControl component="fieldset">
            <FormLabel component="legend">Algorithms</FormLabel>
            <RadioGroup
              aria-label="Algorithms"
              name="algos"
              value={selectedAlgorithm}
              onChange={(e) => {
                this.setState({ selectedAlgorithm: e.target.value as any });
              }}
            >
              <FormControlLabel
                value={AlgorithmEnum.POINT_TO_POLYGON}
                control={<Radio />}
                label="Point to Geofence"
              />
              <FormControlLabel
                value={AlgorithmEnum.CIRCLE_TO_POLYGON}
                control={<Radio />}
                label="Circle Radius to Geofence"
              />
            </RadioGroup>
          </FormControl>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              disabled={location.radiusInMiles < 1}
              onClick={this.checkIntersection}
            >
              Check for Intersection
            </Button>
          </Grid>
          {hasIntersection && (
            <Snackbar
              open={showAlert}
              autoHideDuration={6000}
              onClose={() => {
                // this.setState({ showAlert: false });
              }}
            >
              <Alert2
                onClose={() => {
                  this.setState({ showAlert: false });
                }}
                severity="success"
              >
                Location intersects with Geofence!
              </Alert2>
            </Snackbar>
          )}
          {!hasIntersection && (
            <Snackbar
              open={showAlert}
              autoHideDuration={6000}
              onClose={() => {
                // this.setState({ showAlert: false });
              }}
            >
              <Alert2
                onClose={() => {
                  this.setState({ showAlert: false });
                }}
                severity="error"
              >
                Location does not intersect with Geofence!
              </Alert2>
            </Snackbar>
          )}
        </Card>
      </div>
    );
  }
}
