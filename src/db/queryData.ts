import { collection } from "./client";

export async function queryData(
  query: string[],
  nResults: number,
): Promise<Object> {
  const results = await collection.query({
    queryTexts: query,
    nResults: nResults,
  });

  return results;
}
