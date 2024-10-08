import logger from "./logger";

export enum StatusCodes {
  OK = 200,
  CREATED = 201,
  INTERNAL_SERVER_ERROR = 500,
  BAD_REQUEST = 400,
}

interface ResponseHandlerProps {
  statusCode: StatusCodes;
  body: {
    data: {};
  };
}

export const ResponseHandler = ({ statusCode, body }: ResponseHandlerProps) => {
  return {
    statusCode,
    body: JSON.stringify(body, null, 2),
  };
};

export const ErrorResponseHandler = (e: any) => {
  const statusCode = e.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  return {
    statusCode,
    body: JSON.stringify(e.message, null, 2),
  };
};
