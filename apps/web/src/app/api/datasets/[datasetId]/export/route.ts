import { NextResponse } from "next/server";
import { defaultSupabaseRepository } from "@scrappy/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ datasetId: string }> },
) {
  try {
    const { datasetId } = await params;
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "json").toLowerCase();

    if (!datasetId) {
      return NextResponse.json({ error: "Missing datasetId parameter" }, { status: 400 });
    }

    const records = await defaultSupabaseRepository.getDatasetRecords(datasetId);

    if (format === "csv") {
      if (records.length === 0) {
        return new NextResponse("", {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="dataset-${datasetId}.csv"`,
          },
        });
      }

      // Collect all keys
      const headers = Array.from(new Set(records.flatMap((r) => Object.keys(r))));
      const csvLines = [
        headers.join(","),
        ...records.map((r) =>
          headers
            .map((h) => {
              const val = r[h];
              if (val === undefined || val === null) return "";
              const str = typeof val === "object" ? JSON.stringify(val) : String(val);
              return `"${str.replace(/"/g, '""')}"`;
            })
            .join(","),
        ),
      ];

      return new NextResponse(csvLines.join("\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="dataset-${datasetId}.csv"`,
          "X-Scrappy-Dataset-Id": datasetId,
          "X-Scrappy-Record-Count": String(records.length),
        },
      });
    }

    // Default JSON export
    return new NextResponse(JSON.stringify(records, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="dataset-${datasetId}.json"`,
        "X-Scrappy-Dataset-Id": datasetId,
        "X-Scrappy-Record-Count": String(records.length),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to export dataset" },
      { status: 500 },
    );
  }
}
