export const getCommunities = async ({ page, pageSize, query, filter }) => {
  try {
    const response = await fetch(
      `/api/communities?page=${page}&pageSize=${pageSize}&query=${query}&filter=${filter}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch communities");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
