import * as csvToJson from "csvtojson";
import { Cave } from "../Models/Database/Cave";
import {
  Feature,
  FeatureCollection,
  FeatureCollectionType,
  FeatureType,
  GeometryType,
} from "./Models/GeoJson";

export namespace CaveService {
  // #region Conversions
  interface CaveFromCsv {
    tcsnumber?: string;
    name?: string;
    latitude?: string;
    longitude?: string;
    length?: string;
    depth?: string;
    pdep?: string;
    ps?: string;
    // eslint-disable-next-line camelcase
    co_name?: string;
    // eslint-disable-next-line camelcase
    topo_name?: string;
    // eslint-disable-next-line camelcase
    topo_indi?: string;
    elev?: string;
    ownership?: string;
    gear?: string;
    // eslint-disable-next-line camelcase
    ent_type?: string;
    // eslint-disable-next-line camelcase
    field_indi?: string;
    // eslint-disable-next-line camelcase
    map_status?: string;
    geology?: string;
    // eslint-disable-next-line camelcase
    geo_age?: string;
    // eslint-disable-next-line camelcase
    phys_prov?: string;
    narr?: string;
  }

  // eslint-disable-next-line no-unused-vars
  enum BadData {
    // eslint-disable-next-line no-unused-vars
    String = "-1",
    // eslint-disable-next-line no-unused-vars
    Number = -1,
  }

  /**
   * Convert a csv (as a string) to the Cave model.
   *
   * @param {string} csvFile - The csv file to convert as a string.
   * @returns {Promise<Cave>} - Converted caves.
   */
  export async function csvToCaves(csvFile: string): Promise<Cave[]> {
    const csvJson = (await csvToJson().fromString(csvFile)) as CaveFromCsv[];

    // Convert the caves to GeoJson. Any missing data is filled with -1.
    const convertedCaves = csvJson.map((c) => {
      const cave = {
        coordinates: [
          Number.parseFloat(c.longitude ?? BadData.String),
          Number.parseFloat(c.latitude ?? BadData.String),
        ],
        // empty cols come in as empty strings
        // to catch it add `|| BadData.Number`
        // this works because parseInt will return NaN
        id: c.tcsnumber ?? BadData.String,
        name: c.name ?? BadData.String,
        length: Number.parseInt(c.length ?? BadData.String),
        depth: Number.parseInt(c.depth ?? BadData.String),
        pitDepth: Number.parseInt(c.pdep ?? BadData.String),
        numberOfPits: Number.parseInt(c.ps ?? BadData.String),
        countyName: c.co_name ?? BadData.String,
        topoName: c.topo_name ?? BadData.String,
        topoIndication: c.topo_indi ?? BadData.String,
        elevation: Number.parseInt(c.elev ?? BadData.String),
        ownership: c.ownership ?? BadData.String,
        requiredGear: c.gear ?? BadData.String,
        entranceType: c.ent_type ?? BadData.String,
        fieldIndication: c.field_indi ?? BadData.String,
        mapStatus: c.map_status ?? BadData.String,
        geology: c.geology ?? BadData.String,
        geologyAge: c.geo_age ?? BadData.String,
        physiographicProvince: c.phys_prov ?? BadData.String,
        narrative: c.narr ?? BadData.String,
      } as Cave;

      return cave;
    });

    return convertedCaves;
  }
  /**
   * Converts caves to GeoJson represnetation.
   *
   * @param {Cave[]} caves - Caves to convert to geoJson.
   * @param {boolean} sparse - Only returns name, and id in geoJson properties.
   * @returns {FeatureCollection} - A valid geoJson object.
   */
  export function convertToGeoJson(
    caves: Cave[],
    sparse: boolean
  ): FeatureCollection {
    const convertedCaves = {
      type: FeatureCollectionType.FeatureCollection,
      features: caves.map((c) => {
        let properties = {} as any;
        if (sparse) {
          properties = {
            name: c.name,
            id: c.id,
          };
        } else {
          // Remove non geoJson properties
          // TODO: Make this refactorable
          const caveCopy = JSON.parse(JSON.stringify(c));
          delete caveCopy._id;
          delete caveCopy.__v;
          delete caveCopy.createdAt;
          delete caveCopy.updatedAt;
          delete caveCopy.coordinates;
          properties = caveCopy;
        }

        const feature = {
          type: FeatureType.Feature,
          properties: properties,
          geometry: { type: GeometryType.Point, coordinates: c.coordinates },
        } as Feature;

        return feature;
      }),
    } as FeatureCollection;

    return convertedCaves;
  }

  /**
   * Converts caves to sparse represnetation.
   *
   * @param {Cave[]} caves - Caves to convert.
   * @returns {any} - {id: string, name: string, coordinates:[number, number]}
   */
  export function convertToSparse(caves: Cave[]): any {
    // TODO: Add type to this function
    const convertedCaves = caves.map((c) => ({
      id: c.id,
      name: c.name,
      coordinates: c.coordinates,
    }));
    return convertedCaves;
  }

  // #endregion
}
