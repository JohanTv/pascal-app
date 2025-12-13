import type { Result } from "@/types/result.types";

const PROCESSING_ERROR = "No se pudo procesar la solicitud.";

export async function handleResponse<T>(
  url: string,
  options: RequestInit,
): Promise<Result<T>> {
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const error =
        response.status === 401 || response.status === 500
          ? PROCESSING_ERROR
          : data?.message || response.statusText;
      return {
        success: false,
        error: error as string,
      };
    }

    return {
      success: true,
      value: data,
    };
  } catch (error) {
    console.error("[API Exception]", {
      url,
      error,
    });

    return {
      success: false,
      error: PROCESSING_ERROR,
    };
  }
}
