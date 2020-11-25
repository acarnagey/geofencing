import GeoUtil from "./GeoUtil";

describe('GeoUtil', () => {
  it('matches with algo 2', () => {
    const geoFence = [
      {longitude: -97.04, latitude: 36.6},
      {longitude: -97.05, latitude: 36.64},
      {longitude: -96.57, latitude: 36.63},
      {longitude: -96.8, latitude: 36.16},
      {longitude: -96.82, latitude: 36.17},
      {longitude: -96.82, latitude: 36.25},
      {longitude: -96.92, latitude: 36.25},
      {longitude: -96.93, latitude: 36.33},
      {longitude: -97.03, latitude: 36.34},
      {longitude: -97.03, latitude: 36.51},
      {longitude: -97.01, latitude: 36.51},
      {longitude: -96.98, latitude: 36.53},
      {longitude: -96.9, latitude: 36.55},
      {longitude: -96.89, latitude: 36.58},
      {longitude: -96.92, latitude: 36.6},
      {longitude: -96.98, latitude: 36.58},
      {longitude: -97.05, latitude: 36.59},
      {longitude: -97.04, latitude: 36.6},
    ];
    const geoCoordinate1 = {longitude: -96.8176006, latitude: 36.3369601};
    const geoCoordinate2 = {longitude: -96.7, latitude: 36.3369601};
    const geoCoordinate3 = {longitude: -96.6, latitude: 36.3369601};
    const isMatch1 = GeoUtil.circleInPolygon(geoFence, geoCoordinate1, 1); // within
    const isMatch2 = GeoUtil.circleInPolygon(geoFence, geoCoordinate1, 500); // contains
    const isMatch3 = GeoUtil.circleInPolygon(geoFence, geoCoordinate2, 1); // overlap
    const isMatch4 = GeoUtil.circleInPolygon(geoFence, geoCoordinate3, 1); // no match
    expect(isMatch1).toBeTruthy();
    expect(isMatch2).toBeTruthy();
    expect(isMatch3).toBeTruthy();
    expect(isMatch4).toBeFalsy();
  });
});
