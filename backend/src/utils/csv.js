import { parse } from "csv-parse";

export function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];

    const parser = parse({
      columns: true,
      trim: true
    });

    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        rows.push(record);
      }
    });

    parser.on("error", reject);
    parser.on("end", () => resolve(rows));

    parser.write(buffer);
    parser.end();
  });
}
