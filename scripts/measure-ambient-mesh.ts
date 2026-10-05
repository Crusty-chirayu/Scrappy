import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Measuring /dev/motion with and without AmbientMesh via Lighthouse mobile...");
  const tempDir = path.resolve(process.cwd(), ".tmp-lh");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const reportWith = path.join(tempDir, "with-mesh.json");
  const reportWithout = path.join(tempDir, "without-mesh.json");

  console.log("Running Lighthouse on /dev/motion (with AmbientMesh)...");
  try {
    execSync(
      `npx lighthouse http://localhost:3005/dev/motion --throttling-method=simulate --output=json --output-path="${reportWith}" --chrome-flags="--headless" --only-categories=performance`,
      { stdio: "inherit" }
    );
  } catch (err: any) {
    console.error("Lighthouse run with mesh failed:", err.message);
  }

  console.log("Running Lighthouse on /dev/motion?no-ambient=1 (without AmbientMesh)...");
  try {
    execSync(
      `npx lighthouse http://localhost:3005/dev/motion?no-ambient=1 --throttling-method=simulate --output=json --output-path="${reportWithout}" --chrome-flags="--headless" --only-categories=performance`,
      { stdio: "inherit" }
    );
  } catch (err: any) {
    console.error("Lighthouse run without mesh failed:", err.message);
  }

  if (fs.existsSync(reportWith) && fs.existsSync(reportWithout)) {
    const dataWith = JSON.parse(fs.readFileSync(reportWith, "utf-8"));
    const dataWithout = JSON.parse(fs.readFileSync(reportWithout, "utf-8"));

    const scoreWith = Math.round((dataWith.categories.performance?.score || 0) * 100);
    const scoreWithout = Math.round((dataWithout.categories.performance?.score || 0) * 100);

    const tbtWith = dataWith.audits["total-blocking-time"]?.numericValue;
    const tbtWithout = dataWithout.audits["total-blocking-time"]?.numericValue;

    console.log("=========================================");
    console.log("LIGHTHOUSE MOBILE PERFORMANCE COMPARISON:");
    console.log(`With AmbientMesh:    Score = ${scoreWith}/100, TBT = ${tbtWith?.toFixed(1)}ms`);
    console.log(`Without AmbientMesh: Score = ${scoreWithout}/100, TBT = ${tbtWithout?.toFixed(1)}ms`);
    console.log("=========================================");
  } else {
    console.log("Could not generate both reports. Marking CPU claim as UNVERIFIED.");
  }
}

main().catch(console.error);
