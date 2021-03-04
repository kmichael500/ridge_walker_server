/* eslint-disable new-cap */
import { IsNumber, IsOptional } from "class-validator";

export interface Paginate<T> {
  currentPage: number;
  totalPages: number;
  count: number;
  items: T[];
}

export interface PaginateOptions {
  currentPage: number;
  pageSize: number;
}

/** Used to validate quries that are paginated. */
export class PaginateQueryOptions implements PaginateOptions {
  @IsNumber()
  @IsOptional()
  currentPage!: number;
  @IsNumber()
  @IsOptional()
  pageSize!: number;
}
