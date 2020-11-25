import DistanceUnitEnum from "../constants/DistanceUnitEnum";
import GeoConstants from "../constants/GeoConstants";
import GeoCoordinate from "../models/GeoCoordinate";
// import * as jsts from "jsts";
// import { geom, io } from "jsts";
import * as turf from "@turf/turf";
import { Feature, Point, Polygon } from "@turf/turf";

class GeoUtil {
  public static distance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    units: number
  ): number {
    const lat1r = this.degreesToRadians(lat1);
    const lon1r = this.degreesToRadians(lon1);
    const lat2r = this.degreesToRadians(lat2);
    const lon2r = this.degreesToRadians(lon2);
    const thetaR = lon1r - lon2r;

    let dist =
      Math.sin(lat1r) * Math.sin(lat2r) +
      Math.cos(lat1r) * Math.cos(lat2r) * Math.cos(thetaR);
    dist = Math.acos(dist) * GeoConstants.EARTH_RADIUS_KM;

    if (units === DistanceUnitEnum.STATUTE_MILES.valueOf()) {
      dist = dist * GeoConstants.KILOMETERS_TO_STATUTEMILES;
    } else if (units === DistanceUnitEnum.NAUTICAL_MILES.valueOf()) {
      dist = dist * GeoConstants.KILOMETERS_TO_NAUTICALMILES;
    }
    return dist;
  }

  public static latlonStringToGeoCoordinates(latlons: string): GeoCoordinate[] {
    const geoCoordinates: GeoCoordinate[] = [];
    try {
      if (latlons && latlons.length > 0) {
        const latlonsList = latlons.split(" ");
        let geoCoordinate: GeoCoordinate = { latitude: 0, longitude: 0 };
        for (let i = 0; i < latlonsList.length; i++) {
          if (i % 2 === 0) {
            geoCoordinate.latitude = Number(latlonsList[i]) / 100;
          } else {
            geoCoordinate.longitude = (Number(latlonsList[i]) / 100) * -1;
            geoCoordinates.push(geoCoordinate);
            geoCoordinate = { latitude: 0, longitude: 0 };
          }
        }
      }
    } catch (err) {
      console.error(err, err.stack);
    }

    return geoCoordinates;
  }

  public static circleInPolygon(
    geoFence: GeoCoordinate[],
    geoCoord: GeoCoordinate,
    radius: number
  ) {
    const poly1: Feature<Polygon> = turf.polygon([
      geoFence.map((gc) => [gc.longitude, gc.latitude]),
    ]);
    const point: Feature<Point> = turf.point([
      geoCoord.longitude,
      geoCoord.latitude,
    ]);
    const poly2: Feature<Polygon> = turf.buffer(point, radius, {
      units: "miles",
    });
    const isOverlapping = turf.booleanOverlap(poly1, poly2);
    const isWithin = turf.booleanWithin(poly1, poly2);
    const isContaining = turf.booleanContains(poly1, poly2);
    return isOverlapping || isWithin || isContaining;
  }

  // ref: http://alienryderflex.com/polygon/
  //  int    polyCorners  =  how many corners the polygon has (no repeats)
  //  float  polyX[]      =  horizontal coordinates of corners
  //  float  polyY[]      =  vertical coordinates of corners
  //  float  x, y         =  point to be tested
  //
  //  The function will return TRUE if the point x,y is inside the polygon, or
  //  FALSE if it is not.  If the point is exactly on the edge of the polygon,
  //  then the function may return TRUE or FALSE.
  //
  //  Note that division by zero is avoided because the division is protected
  //  by the "if" clause which surrounds it.
  public static pointInPolygon(
    geoFence: GeoCoordinate[],
    geoCoord: GeoCoordinate
  ): boolean {
    let oddNodes: boolean = false;
    try {
      const polyX: number[] = geoFence.map(
        (geoCoord1: GeoCoordinate) => geoCoord1.longitude
      );
      const polyY: number[] = geoFence.map(
        (geoCoord1: GeoCoordinate) => geoCoord1.latitude
      );
      const polyCorners: number = geoFence.length;
      let i: number;
      let j: number = polyCorners - 1;
      for (i = 0; i < polyCorners; i++) {
        if (
          (polyY[i] < geoCoord.latitude && polyY[j] >= geoCoord.latitude) ||
          (polyY[j] < geoCoord.latitude && polyY[i] >= geoCoord.latitude)
        ) {
          if (
            polyX[i] +
              ((geoCoord.latitude - polyY[i]) / (polyY[j] - polyY[i])) *
                (polyX[j] - polyX[i]) <
            geoCoord.longitude
          ) {
            oddNodes = !oddNodes;
          }
        }
        j = i;
      }
    } catch (err) {
      console.error(err, err.stack);
    }
    return oddNodes;
  }

  private static degreesToRadians(degrees: number): number {
    const pi = Math.PI;
    return degrees * (pi / 180);
  }
}

export default GeoUtil;
