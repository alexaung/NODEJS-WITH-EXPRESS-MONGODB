// Resuability of the query handler
class QueryHandler {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    let queryObj = { ...this.queryString }; // Duplicate the query object
    let excludedFields = ["sort", "page", "limit", "fields"];

    excludedFields.forEach((el) => delete queryObj[el]);

    // 1. Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryObj = JSON.parse(queryStr);
    this.query = this.query.find(queryObj);

    return this; // returning the entire object
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt"); // default sort
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v"); // excluding the version field
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100; // default limit is 100
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numMovies = await Movie.countDocuments();
    //   if (skip >= numMovies) throw new Error("This page does not exist");
    // }

    return this;
  }
}

module.exports = QueryHandler;
