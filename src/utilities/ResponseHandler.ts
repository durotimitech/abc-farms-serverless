export enum StatusCodes {
  OK = 200,
  CREATED = 201,
  INTERNAL_SERVER_ERROR = 500,
  BAD_REQUEST = 400,
}

interface ResponseHandlerProps {
  statusCode: StatusCodes;
  body: any;
}

export const ResponseHandler = ({ statusCode, body }: ResponseHandlerProps) => {
  return {
    statusCode,
    body: JSON.stringify(body, null, 2),
  };
};
