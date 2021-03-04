/* eslint-disable new-cap */
// # region Default GET route

import { Type } from "class-transformer";
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { FilterQuery } from "mongoose";
import { Cave } from "../../../Models/Database/Cave";

/** Used for user request comparing number values <, <=, >, >= for mongoose queries */
export class NumberComparison {
  @IsNumber()
  @IsOptional()
  lessThan?: number;
  @IsNumber()
  @IsOptional()
  greaterThan?: number;
}

/** Specify lat long and a max distance within a radius (in miles) */
export class WithinRadius {
  @IsLatitude({ message: "Not a valid latitude." })
  @IsNumber()
  lattitude!: number;
  @IsLongitude({ message: "Not a valid longitude" })
  @IsNumber()
  longitude!: number;
  @Min(0)
  @IsNumber()
  maxDistance!: number;
}

export enum SortBy {
  relavance = "relavance",
  length = "length",
  depth = "depth",
  pitDepth = "pitDepth",
  numberOfPits = "numberOfPits",
  elevation = "elevation",
  narrative = "narrative",
}

export enum SortOrder {
  "Asc" = "Asc",
  "Desc" = "Desc",
}

/** Used to valide the request sent by a user for getting caves. */
export class CaveQuery {
  @IsOptional()
  @IsEnum(SortBy)
  sortBy: SortBy = SortBy.relavance;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.Desc;

  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => WithinRadius)
  withinRadius?: WithinRadius;

  @ValidateNested()
  @Type(() => NumberComparison)
  length?: NumberComparison;

  @ValidateNested()
  @Type(() => NumberComparison)
  depth?: NumberComparison;
  @ValidateNested()
  @Type(() => NumberComparison)
  pitDepth?: NumberComparison;
  @ValidateNested()
  @Type(() => NumberComparison)
  numberOfPits?: NumberComparison;

  @IsString({ each: true })
  @IsOptional()
  countyNames?: string[];

  @IsString({ each: true })
  @IsOptional()
  topoNames?: string[];

  @IsString({ each: true })
  @IsOptional()
  topoIndications?: string[];

  elevation?: NumberComparison;
  @IsString({ each: true })
  @IsOptional()
  ownership?: string[];

  @IsString({ each: true })
  @IsOptional()
  requiredGear?: string[];

  @IsString({ each: true })
  @IsOptional()
  entranceType?: string[];

  @IsString({ each: true })
  @IsOptional()
  fieldIndication?: string[];

  @IsString({ each: true })
  @IsOptional()
  mapStatus?: string[];

  @IsString({ each: true })
  @IsOptional()
  geology?: string[];

  @IsString({ each: true })
  @IsOptional()
  geologyAge?: string[];

  @IsString({ each: true })
  @IsOptional()
  physiographicProvince?: string[];

  @IsString()
  @IsOptional()
  narrative?: string;
  /**
   * Generates the query for the object.
   *
   * @returns {FilterQuery<Cave>} Query to use with mongoose.
   */
  getDocumentQuery(): FilterQuery<Cave> {
    let query = {} as FilterQuery<Cave>;

    // Only querying fields that were actually provided for efficiency
    if (this.id) {
      query.id = { $regex: this.id, $options: "i" };
    }
    if (this.name) {
      query.name = { $regex: this.name, $options: "i" };
    }
    if (this.withinRadius) {
      query.coordinates = {
        $geoWithin: {
          $centerSphere: [
            [this.withinRadius.longitude, this.withinRadius.lattitude],
            this.milesToRadians(this.withinRadius.maxDistance),
          ],
        },
      };
    }
    if (this.countyNames) {
      query.countyName = {
        $in: this.countyNames.map((cn) => new RegExp(`^${cn}$`, "i")),
      };
    }
    if (this.topoNames) {
      query.topoName = {
        $in: this.topoNames.map((tn) => new RegExp(`^${tn}$`, "i")),
      };
    }
    if (this.topoIndications) {
      query.topoIndication = {
        $in: this.topoIndications.map((ti) => new RegExp(`^${ti}$`, "i")),
      };
    }
    if (this.ownership) {
      query.ownership = {
        $in: this.ownership.map((o) => new RegExp(`^${o}$`, "i")),
      };
    }
    if (this.requiredGear) {
      query.requiredGear = {
        $in: this.requiredGear.map((rg) => new RegExp(`^${rg}$`, "i")),
      };
    }
    if (this.entranceType) {
      query.entranceType = {
        $in: this.entranceType.map((et) => new RegExp(`^${et}$`, "i")),
      };
    }
    if (this.fieldIndication) {
      query.fieldIndication = {
        $in: this.fieldIndication.map((fi) => new RegExp(`^${fi}$`, "i")),
      };
    }
    if (this.mapStatus) {
      query.mapStatus = {
        $in: this.mapStatus.map((ms) => new RegExp(`^${ms}$`, "i")),
      };
    }
    if (this.geology) {
      query.geologyAge = {
        $in: this.geology.map((g) => new RegExp(`^${g}$`, "i")),
      };
    }
    if (this.geologyAge) {
      query.geologyAge = {
        $in: this.geologyAge.map((ga) => new RegExp(`^${ga}$`, "i")),
      };
    }
    if (this.physiographicProvince) {
      query.physiographicProvince = {
        $in: this.physiographicProvince.map((pp) => new RegExp(`^${pp}$`, "i")),
      };
    }
    if (this.narrative) {
      query.$text = {
        $search: this.narrative,
      };
    }

    query = {
      ...query,
      ...this.filterByNumber(),
    };

    return query;
  }

  /**
   * Filters elevation, length, etc by greater than or less than.
   *
   * @returns {FilterQuery<Cave>} Filter for number values in query.
   */
  private filterByNumber(): FilterQuery<Cave> {
    const numberFilter = {} as FilterQuery<Cave>;
    // Length
    if (this.length && this.length.greaterThan) {
      numberFilter.length = { $gt: this.length.greaterThan };
    }
    if (this.length && this.length.lessThan) {
      numberFilter.length = {
        $lt: this.length.lessThan,
      };
    }
    if (this.length && this.length.lessThan && this.length.greaterThan) {
      numberFilter.length = {
        $lt: this.length.lessThan,
        $gt: this.length.greaterThan,
      };
    }

    // Elevation
    if (this.elevation && this.elevation.greaterThan) {
      numberFilter.elevation = { $gt: this.elevation.greaterThan };
    }
    if (this.elevation && this.elevation.lessThan) {
      numberFilter.elevation = {
        $lt: this.elevation.lessThan,
      };
    }

    // Elevation
    if (
      this.elevation &&
      this.elevation.lessThan &&
      this.elevation.greaterThan
    ) {
      numberFilter.elevation = {
        $lt: this.elevation.lessThan,
        $gt: this.elevation.greaterThan,
      };
    }

    // Depth
    if (this.depth && this.depth.lessThan && this.depth.greaterThan) {
      numberFilter.depth = {
        $lt: this.depth.lessThan,
        $gt: this.depth.greaterThan,
      };
    }

    // Pit Depth
    if (this.pitDepth && this.pitDepth.lessThan && this.pitDepth.greaterThan) {
      numberFilter.pitDepth = {
        $lt: this.pitDepth.lessThan,
        $gt: this.pitDepth.greaterThan,
      };
    }

    // Number Of Pits
    if (
      this.numberOfPits &&
      this.numberOfPits.lessThan &&
      this.numberOfPits.greaterThan
    ) {
      numberFilter.numberOfPits = {
        $lt: this.numberOfPits.lessThan,
        $gt: this.numberOfPits.greaterThan,
      };
    }

    return numberFilter;
  }

  /**
   * Generates the sort for the query based on sortOrder and sortBy.
   *
   * @returns {any} Query to use with mongoose.
   */
  getDocumentSort(): any {
    const sort = {} as any;

    if ((this.sortBy = SortBy.relavance)) {
      // default search value for relevance based on other params
      if (this.narrative) {
        sort[SortBy.narrative] = this.sortOrder; // TODO: Verify sort by text score
      } else if (this.length) {
        sort[SortBy.length] = this.sortOrder;
      } else if (this.depth) {
        sort[SortBy.depth] = this.depth;
      } else if (this.pitDepth) {
        sort[SortBy.pitDepth] = this.sortOrder;
      } else if (this.elevation) {
        sort[SortBy.elevation] = this.sortOrder;
      } else if (this.numberOfPits) {
        sort[SortBy.numberOfPits] = this.sortOrder;
      } else {
        // default to length if no other search params
        sort[SortBy.length] = this.sortOrder;
      }
    } else {
      // user specific sort by
      sort[this.sortBy] = this.sortOrder;
    }
    return sort;
  }
  /**
   * Converts miles to radians.
   *
   * @param {number} miles Miles to be converted to radians.
   * @returns {number} Miles converted to radians.
   */
  private milesToRadians(miles: number): number {
    const earthRadiusInMiles = 3963;
    return miles / earthRadiusInMiles;
  }
}

// #endregion
