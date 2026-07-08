export const swrFetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // @ts-expect-error - Adding info and status to Error object
    error.info = await res.json();
    // @ts-expect-error - Adding info and status to Error object
    error.status = res.status;
    throw error;
  }

  return res.json();
};
