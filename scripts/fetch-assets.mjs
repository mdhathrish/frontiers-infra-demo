#!/usr/bin/env node
// Downloads candidate photos + videos from the Pexels API into public/assets/raw/
// for manual curation. Requires PEXELS_API_KEY in .env.local.

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

process.loadEnvFile(".env.local");
const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error("PEXELS_API_KEY missing from .env.local");
  process.exit(1);
}

const RAW_DIR = path.join(process.cwd(), "public/assets/raw");
const PHOTO_DIR = path.join(RAW_DIR, "photos");
const VIDEO_DIR = path.join(RAW_DIR, "videos");

const PHOTO_QUERIES = [
  "modern villa exterior",
  "luxury house facade",
  "residential architecture",
  "apartment building modern",
  "construction site crane",
  "house interior living room",
  "modern kitchen interior",
  "luxury bedroom interior",
  "aerial drone housing",
];

const VIDEO_QUERIES = ["aerial drone house", "modern architecture"];

const PHOTOS_PER_QUERY = 8;
const MAX_VIDEOS = 2;
const MAX_VIDEO_BYTES = 10 * 1024 * 1024;

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function pexelsGet(url) {
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  if (!res.ok) {
    throw new Error(`Pexels API error ${res.status} for ${url}`);
  }
  return res.json();
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
  return buf.length;
}

async function fetchPhotos() {
  await mkdir(PHOTO_DIR, { recursive: true });
  const manifest = [];
  for (const query of PHOTO_QUERIES) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${PHOTOS_PER_QUERY}&orientation=landscape`;
    console.log(`Searching photos: "${query}"`);
    const data = await pexelsGet(url);
    for (const photo of data.photos ?? []) {
      const filename = `pexels-${slugify(photo.photographer)}-${photo.id}.jpg`;
      const dest = path.join(PHOTO_DIR, filename);
      const bytes = await downloadFile(photo.src.large2x, dest);
      manifest.push({
        type: "photo",
        query,
        filename,
        id: photo.id,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        pexelsUrl: photo.url,
        bytes,
      });
      console.log(`  ${filename} (${(bytes / 1024).toFixed(0)} KB)`);
    }
  }
  return manifest;
}

async function fetchVideos() {
  await mkdir(VIDEO_DIR, { recursive: true });
  const manifest = [];
  let count = 0;
  for (const query of VIDEO_QUERIES) {
    if (count >= MAX_VIDEOS) break;
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;
    console.log(`Searching videos: "${query}"`);
    const data = await pexelsGet(url);
    const video = (data.videos ?? [])[0];
    if (!video) {
      console.log(`  no results for "${query}"`);
      continue;
    }
    const sdFile = video.video_files
      .filter((f) => f.quality === "sd")
      .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
    if (!sdFile) {
      console.log(`  no SD file for "${query}"`);
      continue;
    }
    const filename = `pexels-video-${slugify(query)}-${video.id}.mp4`;
    const dest = path.join(VIDEO_DIR, filename);
    const bytes = await downloadFile(sdFile.link, dest);
    const oversized = bytes > MAX_VIDEO_BYTES;
    manifest.push({
      type: "video",
      query,
      filename,
      id: video.id,
      photographer: video.user?.name,
      photographerUrl: video.user?.url,
      pexelsUrl: video.url,
      bytes,
      oversized,
    });
    console.log(
      `  ${filename} (${(bytes / 1024 / 1024).toFixed(1)} MB)${oversized ? " -- OVER 10MB, exclude from git" : ""}`,
    );
    count += 1;
  }
  return manifest;
}

async function main() {
  const photoManifest = await fetchPhotos();
  const videoManifest = await fetchVideos();
  const manifest = [...photoManifest, ...videoManifest];
  await writeFile(path.join(RAW_DIR, "fetch-manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nDone. ${photoManifest.length} photos, ${videoManifest.length} videos.`);
  console.log("Manifest written to public/assets/raw/fetch-manifest.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
