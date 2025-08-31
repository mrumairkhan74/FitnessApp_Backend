
class HttpError extends Error {
    constructor(statusCode, message) {
        super(message),
            this.statusCode = statusCode
    }
}

// forbidden
class ForbiddenError extends Error {
    constructor(message = "Forbidden") {
        super(message);
        this.name = "ForbiddenError";
        this.statusCode = 403;
    }
}

// for bad request

class BadRequestError extends HttpError {
    constructor(message = "bad Request") {
        super(400, message)
    }
}

// Unauthorized Error
class UnAuthorizedError extends HttpError {
    constructor(message = "UnAuthorized") {
        super(401, message)
    }
}
// NotFound Error
class NotFoundError extends HttpError {
    constructor(message = "Not Found") {
        super(404, message)
    }
}
// Conflict Error (email is already registered)
class ConflictError extends HttpError {
    constructor(message = "User Conflict") {
        super(409, message)
    }
}
// internal server Error
class InternalServerError extends HttpError {
    constructor(message = "Internal Server Error") {
        super(500, message)
    }
}


module.exports = {
    HttpError,
    BadRequestError,
    UnAuthorizedError,
    NotFoundError,
    ConflictError,
    InternalServerError,
    ForbiddenError
}