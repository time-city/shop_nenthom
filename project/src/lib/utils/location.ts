export interface Location {
  id: string;
  name: string;
  full_name: string;
}

export const fetchLocations = async (level: number, parentId: string = "0"): Promise<Location[]> => {
  try {
    const res = await fetch(`https://esgoo.net/api-tinhthanh/${level}/${parentId}.htm`);
    const data = await res.json();
    if (data.error === 0) {
      return data.data as Location[];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    return [];
  }
};
