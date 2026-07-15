import type { Response } from "express";

export class ApiResponse {
  static sendSuccess(
    res: Response,
    data: unknown = "Done",
    message?: string,
    status = 200,
  ) {
    return res.status(status).json({ success: true, message, data });
  }

  static sendError(res: Response, message: string, status = 500) {
    return res.status(status).json({ success: false, message });
  }
}
