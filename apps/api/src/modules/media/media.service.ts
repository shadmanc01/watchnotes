import { searchTmdb } from "../../integrations/tmdb/tmdb.client.js";

export async function searchMedia(query: string) {
  return searchTmdb(query);
}
