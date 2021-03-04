import { transformAndValidate } from "class-transformer-validator";
import * as express from "express";
import { StatusCodes } from "http-status-codes";
import * as multer from "multer";
import { Cave } from "../../Models/Database/Cave";
import {
  Paginate,
  PaginateQueryOptions,
} from "../../Repositories/Shared/Paginate";
import { CaveRepository } from "../../Repositories/CaveRepository/CaveRepository";
import { CaveService } from "../../Services/CaveService";
import { CaveQuery } from "../../Repositories/CaveRepository/Models/CaveQuery";
import { CaveRouteOptions } from "./Models/CaveRouteModels";
import { FormatOptions } from "./Models/FormatOptions";

// TODO: Add api documentation/parms with jsdocs

const caveRoute = express();

// Used to store uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Gets a single cave by it's id.
 *
 * @param {string} id - A state survey Id, not Db Id. It matches 2 letters
 *   followed by numbers
 * @returns {Cave} Returns a single cave in JSON format.
 */
caveRoute.get("/:id(\\D{2}\\d*)", async (request, response) => {
  const id = request.params.id;
  const cave = await CaveRepository.getById(id);
  if (cave != null) {
    response.send(cave);
  } else {
    response.status(404);
    response.send("Cave does not exist.");
  }
});

// TODO: Support non used properties
// Get all caves with all properties
// param: sparse is a bool. If true, it returns geojson with only name, id, and coordinates
/**
 * Gets all caves
 *
 * @param {string} id - A state survey Id, not Db Id. It matches 2 letters
 *   followed by numbers
 * @returns {Cave} Returns a cave in JSON format.
 */
caveRoute.get("/", async (request, response, next) => {
  // default to db representation
  // default to Sparse representation
  // default to return all caves

  // TODO: Clean this up ? Maybe add function/class to handle params
  // TODO: Default to sparse and pagination
  // TODO: Use params to download files

  try {
    // #region Parse query body

    const paginateOptions = (await transformAndValidate(
      PaginateQueryOptions,
      request.body
    )) as PaginateQueryOptions;

    const formatOptions = (await transformAndValidate(
      CaveRouteOptions,
      request.body
    )) as CaveRouteOptions;

    const query = (await transformAndValidate(
      CaveQuery,
      request.body
    )) as CaveQuery;

    // #endregion

    const caves = await CaveRepository.findAndPaginate(
      paginateOptions.currentPage,
      paginateOptions.pageSize,
      query.getDocumentQuery(),
      query.getDocumentSort()
    );

    const items = {
      count: caves.count,
      currentPage: caves.currentPage,
      totalPages: caves.totalPages,
    } as Paginate<any>;
    if (formatOptions.format == FormatOptions.GeoJson) {
      items.items = [
        CaveService.convertToGeoJson(caves.items, formatOptions.sparse),
      ];
    } else if (formatOptions.sparse) {
      items.items = CaveService.convertToSparse(caves.items);
    } else if (formatOptions.format == FormatOptions.Default) {
      items.items = caves.items;
    }

    response.json(items);
  } catch (error) {
    next(error);
  }
});

// Creates a single cave
caveRoute.post("/", async (request, response) => {
  const cave = request.body as Cave;
  try {
    await CaveRepository.insert(cave);
    response.sendStatus(201); // http created
  } catch (error) {
    response.statusCode = StatusCodes.CONFLICT;
    response.send(error.toString());
  }
});

// form-data csv:*.csv
caveRoute.post("/upload", upload.single("csv"), async (request, response) => {
  const convertedCaves = await CaveService.csvToCaves(
    request.file.buffer.toString()
  );

  response.statusCode = StatusCodes.ACCEPTED;
  response.json(convertedCaves.splice(0, 100));
  CaveRepository.insertMultiple(convertedCaves);
});

export { caveRoute };
