/* eslint-disable no-unused-vars */
/** A collection of GeoJson Features. Type, features[] */
export interface FeatureCollection {
  type: FeatureCollectionType;
  features: Feature[];
}

/** A GeoJson Feaeture. */
export interface Feature {
  type: FeatureType;
  properties: any; // TODO: Add type
  geometry: Geometry;
}

/** A point geometry type. */
export interface Geometry {
  type: GeometryType;
  coordinates: number[];
}

export enum GeometryType {
  Point = "Point",
}

export enum FeatureType {
  Feature = "Feature",
}

export enum FeatureCollectionType {
  FeatureCollection = "FeatureCollection",
}
