import DistanceUnitEnum from "./DistanceUnitEnum";

class GeoConstants {
  public static readonly EARTH_RADIUS_KM: number = 6371.0;
  public static readonly EARTH_RADIUS_MILES: number = 3959.0; // tighten this up, add major/minor axis
  public static readonly WGS84_POLAR_RADIUS_LM: number = 6378.137;
  public static readonly WGS84_EQUATORIAL_RADIUS_LM: number = 6356.7523142;
  // multipliers for common conversions
  public static readonly METERS_TO_FEET: number = 3.2808399;
  public static readonly FEET_TO_METERS: number = 0.3048;
  public static readonly METERS_TO_STATUTEMILES: number = 0.000621371;
  public static readonly FEET_TO_STATUTEMILES: number = 0.000189394;
  public static readonly STATUTEMILES_TO_FEET: number = 5280.0;
  public static readonly KILOMETERS_TO_NAUTICALMILES: number = 0.539956803;
  public static readonly STATUTEMILES_TO_NAUTICALMILES: number = 0.8684;
  public static readonly KILOMETERS_TO_STATUTEMILES: number = 0.6213712;
  public static readonly STATUTEMILES_TO_KILOMETERS: number = 1.609344;
  public static readonly CM_TO_INCHES: number = 0.393701;
  public static readonly MM_TO_INCHES: number = 0.0393701;
  // Source: http://en.wikipedia.org/wiki/Extreme_points_of_the_United_States#Westernmost
  public static readonly CONUS_NORTH_LAT: number = 49.3457868;
  public static readonly CONUS_WEST_LON: number = -124.7844079;
  public static readonly CONUS_EAST_LON: number = -66.9513812;
  public static readonly CONUS_SOUTH_LAT: number = 24.7433195;
  // other multipliers
  public static readonly MPS_TO_KTS: number = 1.94384;
  public static readonly KMPH_TO_KTS: number = 0.539957;
  public static readonly MPH_TO_KTS: number = 0.868976;

  public static toKm(distance: number, distanceUnit: number) {
    switch (distanceUnit) {
      case DistanceUnitEnum.KILOMETERS.valueOf():
        return distance;
      case DistanceUnitEnum.NAUTICAL_MILES.valueOf():
        return distance / this.KILOMETERS_TO_NAUTICALMILES;
      case DistanceUnitEnum.STATUTE_MILES.valueOf():
        return distance * this.STATUTEMILES_TO_KILOMETERS;
      default:
        console.error("GeoConstants.toKm(): Unknown units");
        return distance;
    }
  }

  // public static BboxXY getConusBbox() {
  // //		return new Bbox(new LatLon(CONUS_SOUTH_LAT, CONUS_WEST_LON), new LatLon(CONUS_NORTH_LAT, CONUS_EAST_LON));
  //   return new BboxXY(CONUS_WEST_LON, CONUS_SOUTH_LAT, CONUS_EAST_LON, CONUS_NORTH_LAT);
  // }
}

export default GeoConstants;
