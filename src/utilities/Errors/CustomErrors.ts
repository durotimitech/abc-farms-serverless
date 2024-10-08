import logger from "../logger";
import CustomError from "./BaseError";

export class BadRequestError extends CustomError {
  constructor(message: string, data: any = null) {
    super(message, 400, data);
    logger.error(message);
  }
}

// export class UnauthorizedError extends CustomError {
//   constructor(message: string, data: any = null) {
//     super(message, 401, data);
    // logger.error(message);
    //   }
// }

// export class ForbiddenError extends CustomError {
//   constructor(message: string, data: any = null) {
//     super(message, 403, data);
    // logger.error(message);
//   }
// }

// export class NotFoundError extends CustomError {
//   constructor(message: string, data: any = null) {
//     super(message, 404, data);
    // logger.error(message);
//   }
// }

// export class ConflictError extends CustomError {
//   constructor(message: string, data: any = null) {
//     super(message, 409, data);
    // logger.error(message);
//   }
// }

// export class InternalServerError extends CustomError {
//   constructor(message: string, data: any = null) {
//     super(message, 500, data);
    // logger.error(message);
//   }
// }
