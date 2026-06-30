export class UserAlreadyExistException extends Error {
  statusCode = 409;
  constructor(message = "User Already exists!") {
    super(message);
  }
}

export class UserNotFoundException extends Error {
  statusCode = 404;
  constructor(message = "Not found!") {
    super(message);
  }
}

export class UserAlreadyActiveException extends Error {
  statusCode = 404;
  constructor(message = "Already logged in!") {
    super(message);
  }
}

export class BadRequestException extends Error {
  statusCode = 404;
  constructor(message = "User Already logged out!") {
    super(message);
  }
}

