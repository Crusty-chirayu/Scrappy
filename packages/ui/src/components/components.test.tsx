import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "./Button.js";
import { IconButton } from "./IconButton.js";
import { Input } from "./Input.js";
import { Select } from "./Select.js";
import { Tabs, TabList, Tab, TabPanel } from "./Tabs.js";
import { Badge } from "./Badge.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card.js";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./Dialog.js";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "./Sheet.js";
import { Tooltip } from "./Tooltip.js";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./Table.js";
import { Skeleton, SkeletonText, SkeletonCard, SkeletonTableRow } from "./Skeleton.js";
import { EmptyState } from "./EmptyState.js";
import { ErrorState } from "./ErrorState.js";

describe("@scrappy/ui Core Primitives (Rebuilt Phase 0)", () => {
  describe("Button", () => {
    it("renders primary button variant with token styling and accessible attributes", () => {
      const html = renderToStaticMarkup(
        <Button variant="primary" size="md">
          Compare Prices
        </Button>,
      );
      expect(html).toContain("Compare Prices");
      expect(html).toContain("bg-[var(--color-accent)]");
      expect(html).toContain('type="button"');
      expect(html).toContain('aria-busy="false"');
      expect(html).toContain("min-h-[44px]");
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

  describe("IconButton", () => {
    it("enforces aria-label and satisfies 44px min touch target", () => {
      const html = renderToStaticMarkup(
        <IconButton aria-label="Toggle theme" variant="secondary">
          <span>Icon</span>
        </IconButton>,
      );
      expect(html).toContain('aria-label="Toggle theme"');
      expect(html).toContain("h-11 w-11");
      expect(html).toContain("Icon");
    });
  });

  describe("Input", () => {
    it("renders accessible label, helper text, and 44px min height input", () => {
      const html = renderToStaticMarkup(
        <Input id="search-q" label="Product Search" helperText="Enter brand or model" />,
      );
      expect(html).toContain("<label");
      expect(html).toContain("Product Search");
      expect(html).toContain('id="search-q"');
      expect(html).toContain('aria-describedby="search-q-helper"');
      expect(html).toContain("Enter brand or model");
      expect(html).toContain("min-h-[44px]");
    });

    it("renders error state with aria-invalid and alert role", () => {
      const html = renderToStaticMarkup(
        <Input id="ean" label="EAN Code" errorMessage="Invalid barcode format" />,
      );
      expect(html).toContain('aria-invalid="true"');
      expect(html).toContain('aria-describedby="ean-error"');
      expect(html).toContain('role="alert"');
      expect(html).toContain("Invalid barcode format");
      expect(html).toContain("border-[var(--color-danger)]");
    });
  });

  describe("Select", () => {
    it("renders options, label, and accessible 44px select wrapper", () => {
      const html = renderToStaticMarkup(
        <Select
          id="sort-select"
          label="Sort By"
          options={[
            { value: "price_asc", label: "Lowest Price" },
            { value: "price_desc", label: "Highest Price" },
          ]}
        />,
      );
      expect(html).toContain("<select");
      expect(html).toContain("Lowest Price");
      expect(html).toContain("Highest Price");
      expect(html).toContain("min-h-[44px]");
    });
  });

  describe("Tabs", () => {
    it("renders tablist with role tabs and aria-selected state", () => {
      const html = renderToStaticMarkup(
        <Tabs defaultValue="all">
          <TabList aria-label="Filter tabs">
            <Tab value="all">All Offers</Tab>
            <Tab value="verified">Verified Only</Tab>
          </TabList>
          <TabPanel value="all">All offers content</TabPanel>
          <TabPanel value="verified">Verified offers content</TabPanel>
        </Tabs>,
      );
      expect(html).toContain('role="tablist"');
      expect(html).toContain('role="tab"');
      expect(html).toContain('aria-selected="true"');
      expect(html).toContain("All offers content");
    });
  });

  describe("Badge", () => {
    it("renders badge variant with dot indicator and mono styling", () => {
      const html = renderToStaticMarkup(
        <Badge variant="accent" dot>
          Lowest Price
        </Badge>,
      );
      expect(html).toContain("Lowest Price");
      expect(html).toContain("font-mono");
      expect(html).toContain("rounded-full");
      expect(html).toContain("bg-[var(--color-accent)]");
    });
  });

  describe("Card", () => {
    it("renders semantic card structure with header and footer", () => {
      const html = renderToStaticMarkup(
        <Card variant="interactive">
          <CardHeader>
            <CardTitle>Flipkart Deal</CardTitle>
            <CardDescription>Verified 2m ago</CardDescription>
          </CardHeader>
          <CardContent>₹49,999</CardContent>
          <CardFooter>
            <Button size="sm">View Offer</Button>
          </CardFooter>
        </Card>,
      );
      expect(html).toContain("Flipkart Deal");
      expect(html).toContain("Verified 2m ago");
      expect(html).toContain("₹49,999");
      expect(html).toContain("View Offer");
    });
  });

  describe("Dialog & Sheet", () => {
    it("renders dialog trigger with popup semantics", () => {
      const html = renderToStaticMarkup(
        <Dialog>
          <DialogTrigger>
            <Button>Open Modal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Modal Title</DialogTitle>
            <DialogDescription>Modal Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );
      expect(html).toContain('aria-haspopup="dialog"');
      expect(html).toContain("Open Modal");
    });

    it("renders sheet trigger with popup semantics", () => {
      const html = renderToStaticMarkup(
        <Sheet side="right">
          <SheetTrigger>
            <Button>Open Drawer</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Drawer Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );
      expect(html).toContain('aria-haspopup="dialog"');
      expect(html).toContain("Open Drawer");
    });
  });

  describe("Tooltip", () => {
    it("wraps child element and renders trigger", () => {
      const html = renderToStaticMarkup(
        <Tooltip content="Price drop alert threshold">
          <button type="button">Set Alert</button>
        </Tooltip>,
      );
      expect(html).toContain("Set Alert");
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

  describe("EmptyState & ErrorState", () => {
    it("renders empty state with title and action button", () => {
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

    it("renders error state with alert role and trace info", () => {
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
