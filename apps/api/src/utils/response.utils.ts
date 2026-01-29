import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode: number = 200) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: string, statusCode: number = 400) => {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
) => {
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  return res.status(200).json({ success: true, ...response });
};
