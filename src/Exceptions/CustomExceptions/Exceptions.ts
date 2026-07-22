export class UserAlreadyExistException extends Error {
  statusCode = 409;
  constructor(message = "User Already exists!") {
    super(message);
  }
}

export class NotFoundException extends Error {
  statusCode = 404;
  constructor(message = "Not found!") {
    super(message);
  }
}

export class UserAlreadyActiveException extends Error {
  statusCode = 409;
  constructor(message = "Already logged in!") {
    super(message);
  }
}

export class BadRequestException extends Error {
  statusCode = 400;
  constructor(message = "Bad Request!") {
    super(message);
  }
}

export class UnauthorizedException extends Error {
  statusCode = 401;
  constructor(message = "Unauthorized!") {
    super(message);
  }
}

export class AccountAlreadyExist extends Error {
  statusCode = 401;
  constructor(message = "Account Already Exist!") {
    super(message);
  }
}