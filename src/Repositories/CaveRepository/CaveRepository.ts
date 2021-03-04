import { FilterQuery } from "mongoose";
import { Cave, CaveModel } from "../../Models/Database/Cave";
import { Paginate } from "../Shared/Paginate";

export namespace CaveRepository {
  // #region Create

  /**
   * Adds a cave to the Db. If the id already exists, an error will be thrown.
   *
   * @param {Cave} cave - A new cave to add to the Db.
   * @returns {Promise<void>} - Returns a promise.
   */
  export async function insert(cave: Cave): Promise<void> {
    await CaveModel.create(cave);
  }

  /**
   * Adds a caves to the Db. If the id already exists, an error will be thrown.
   *
   * @param {Cave[]} caves - New caves to add to the Db.
   * @returns {Promise<void>} - Returns a promise.
   */
  export async function insertMultiple(caves: Cave[]): Promise<void> {
    // this is much faster
    await CaveModel.insertMany(caves, { ordered: false });

    // FIXME: Deal with enterances
  }

  // #endregion

  // #region Get

  /**
   * Gets a cave by id from the Db.
   *
   * @param {string} id - The Id of the cave.
   * @returns {Promise<Cave | null>} Returns null if the cave does not exist.
   */
  export async function getById(id: string): Promise<Cave | null> {
    const cave = await CaveModel.findOne({ id: id });

    return cave;
  }

  /**
   * Searches though database based on query. If no query is passed, it will
   * return all of the caves.
   *
   * @param {FilterQuery<Cave>} query Optional query
   * @returns {Promise<Cave>} Returns paginated caves.
   */
  export async function find(query?: FilterQuery<Cave>): Promise<Cave[]> {
    if (!query) {
      query = {};
    }

    return await CaveModel.find(query);
  }

  // #endregion

  // #region Helper functions

  /**
   * Executes a query and paginates the results.
   *
   * @param {number} currentPage Defaults to 0
   * @param {number} pageSize Defaults to 10
   * @param {FilterQuery<Cave>} query If it is null or empty it will return all
   *   caves with a page of 0 and pagesize of the count.
   * @param {object} sort Sort options
   * @returns {Promise<Paginate<Cave>>} - The results of the query pagainated.
   */
  export async function findAndPaginate(
    currentPage: number = 0,
    pageSize: number = 10,
    query?: FilterQuery<Cave>,
    sort?: object
  ): Promise<Paginate<Cave>> {
    // Set to empty query if none supplied
    if (!query) {
      query = {};
    }

    const documentCount = await getCount(query);

    if (!sort) {
      sort = { length: -1 };
    }
    const caveQuery = CaveModel.find(query).sort(sort);

    // #region Validate Pagination page && pageSize

    const totalPages = Math.ceil(documentCount / pageSize);

    if (currentPage < 0) {
      currentPage = 0;
    } else if (currentPage > totalPages) {
      currentPage = totalPages - 1;
    }

    // #endregion

    const skip = currentPage * pageSize;
    caveQuery.skip(skip).limit(pageSize);

    const results = await caveQuery;

    const paginatedCaves = {
      currentPage: currentPage,
      totalPages: totalPages,
      count: documentCount,
      items: results,
    } as Paginate<Cave>;
    return paginatedCaves;
  }

  /**
   * Gets document count of a query in the caves documents..
   *
   * @param {FilterQuery<Cave>} query - The query to filter on. If null, it will
   *   query all of the cave documents.
   * @returns {Promise<int>} - Returns the count of the query.
   */
  export async function getCount(query?: FilterQuery<Cave>): Promise<number> {
    if (!query) {
      query = {};
    }
    // TODO: Use estimated document count only for null/empty queries
    return await CaveModel.find(query).countDocuments();
  }

  // #endregion
}
