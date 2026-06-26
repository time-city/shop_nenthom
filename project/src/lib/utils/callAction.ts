import { unstable_rethrow } from "next/navigation";

import { getPublicErrorMessage } from "./publicError";

export async function callAction<T>(
  fn: () => Promise<T>,
  errorMessage: string,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    throw new Error(getPublicErrorMessage(error, errorMessage));
  }
}
