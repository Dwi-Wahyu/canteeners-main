interface ActionSuccess<T = void> {
  success: true;
  data?: T;
  message?: string;
}

interface ActionError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: string;
  };
}

export type ServerActionReturn<T = void> = ActionSuccess<T> | ActionError;

export function successResponse<T = void>(
  data?: T,
  message?: string
): ServerActionReturn<T> {
  return { success: true, data, message };
}

export function errorResponse(
  message: string,
  code?: string,
  details?: any
): ServerActionReturn<never> {
  return { success: false, error: { message, code, details } };
}
