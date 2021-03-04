/* eslint-disable new-cap */
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { FormatOptions } from "./FormatOptions";

/** Options for the default cave GET route. */
export class CaveRouteOptions {
  @IsEnum(FormatOptions)
  @IsOptional()
  format: FormatOptions = FormatOptions.Default;
  @IsBoolean()
  @IsOptional()
  sparse: boolean = false;
}
