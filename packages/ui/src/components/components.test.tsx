import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "./Button.js";
import { Input } from "./Input.js";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./Table.js";
import { Skeleton, SkeletonText, SkeletonCard, SkeletonTableRow } from "./Skeleton.js";
import { EmptyState } from "./EmptyState.js";
import { ErrorState } from "./ErrorState.js";

describe("@scrappy/ui Core Components", () => {
  describe("Button", () => {
    it("renders primary button variant with accessible attributes", () => {
      const html = renderToStaticMarkup(
        <Button variant="primary" size="md">
          Compare Prices
        </Button>,
      );
      expect(html).toContain("Compare Prices");
      expect(html).toContain("bg-[#C6F135]");
      expect(html).toContain('type="button"');
      expect(html).toContain('aria-busy="false"');
    });

    it("renders loading state with aria-busy and spinner", () => {
      const html = renderToStaticMarkup(
        <Button variant="secondary" isLoading loadingText="Fetching...">
          Compare
        </Button>,
      );
      expect(html).toContain('aria-busy="true"');
      expect(html).toContain('aria-disabled="true"');
      expect(html).toContain("Fetching...");
      expect(html).toContain("animate-spin");
    });
  });

  describe("Input", () => {
    it("renders accessible label, helper text, and input element", () => {
      const html = renderToStaticMarkup(
        <Input id="search-q" label="Product Search" helperText="Enter brand or model" />,
      );
      expect(html).toContain("<label");
      expect(html).toContain("Product Search");
      expect(html).toContain('id="search-q"');
      expect(html).toContain('aria-describedby="search-q-helper"');
      expect(html).toContain("Enter brand or model");
    });

    it("renders error state with aria-invalid and alert role", () => {
      const html = renderToStaticMarkup(
        <Input id="ean" label="EAN Code" errorMessage="Invalid barcode format" />,
      );
      expect(html).toContain('aria-invalid="true"');
      expect(html).toContain('aria-describedby="ean-error"');
      expect(html).toContain('role="alert"');
      expect(html).toContain("Invalid barcode format");
      expect(html).toContain("border-[#F2685B]");
    });
  });

  describe("Table", () => {
    it("renders table with sortable head and numerical alignment", () => {
      const html = renderToStaticMarkup(
        <Table density="compact">
          <TableHeader>
            <TableRow>
              <TableHead sortDirection="ascending" onSort={() => {}}>
                Merchant
              </TableHead>
              <TableHead align="right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Amazon.in</TableCell>
              <TableCell align="right" isNumeric>
                ₹49,999
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(html).toContain("<table");
      expect(html).toContain('aria-sort="ascending"');
      expect(html).toContain("Amazon.in");
      expect(html).toContain("font-mono tabular-nums");
      expect(html).toContain("₹49,999");
    });
  });

  describe("Skeleton", () => {
    it("renders with aria-hidden to avoid screen-reader noise", () => {
      const html = renderToStaticMarkup(<Skeleton width={100} height={20} rounded="md" />);
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain("animate-pulse");
      expect(html).toContain("width:100px");
      expect(html).toContain("height:20px");
    });

    it("renders skeleton text and cards", () => {
      const textHtml = renderToStaticMarkup(<SkeletonText lines={3} />);
      expect(textHtml).toContain('aria-hidden="true"');

      const cardHtml = renderToStaticMarkup(<SkeletonCard />);
      expect(cardHtml).toContain('aria-hidden="true"');

      const rowHtml = renderToStaticMarkup(
        <table>
          <tbody>
            <SkeletonTableRow columns={3} />
          </tbody>
        </table>,
      );
      expect(rowHtml).toContain("<td");
    });
  });

  describe("EmptyState", () => {
    it("renders title, description, and action button", () => {
      const html = renderToStaticMarkup(
        <EmptyState
          title="No products found"
          description="Try broadening your search query or removing filters."
          action={<Button variant="secondary">Clear filters</Button>}
        />,
      );
      expect(html).toContain("No products found");
      expect(html).toContain("Try broadening your search query");
      expect(html).toContain("Clear filters");
    });
  });

  describe("ErrorState", () => {
    it("renders alert role, message, traceId, and retry action", () => {
      const html = renderToStaticMarkup(
        <ErrorState
          title="Failed to load offers"
          message="Source adapter timed out after 3000ms."
          traceId="trace-req-88492"
          errorCode="ERR_ADAPTER_TIMEOUT"
        />,
      );
      expect(html).toContain('role="alert"');
      expect(html).toContain("Failed to load offers");
      expect(html).toContain("Source adapter timed out after 3000ms.");
      expect(html).toContain("ERR_ADAPTER_TIMEOUT");
      expect(html).toContain("trace-req-88492");
    });
  });
});
