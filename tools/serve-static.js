#!/usr/bin/env node
/**
 * Simple static HTTP server for local testing.
 * - Serves files from the specified directory (default: ./public)
 * - Defaults to port 8080
 * - Supports SPA fallback to index.html for non-file routes
 * - No dependencies
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = { port: undefined, dir: undefined };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--port" || arg === "-p") {
      args.port = Number(argv[i + 1]);
      i += 1;
    } else if (arg.startsWith("--port=")) {
      args.port = Number(arg.split("=")[1]);
    } else if (arg === "--dir" || arg === "-d") {
      args.dir = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--dir=")) {
      args.dir = arg.split("=")[1];
    }
  }
  return args;
}

const { port: cliPort, dir: cliDir } = parseArgs(process.argv);
const PORT = Number(
  cliPort || process.env.PORT || process.env.npm_config_port || 8080
);
const ROOT_DIR = path.resolve(
  process.cwd(),
  cliDir || process.env.DIR || "public"
);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ogg": "audio/ogg",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

function safeJoin(base, target) {
  const targetPath = path.normalize(target).replace(/^([/\\])+/, "");
  return path.join(base, targetPath);
}

function fileExists(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile();
  } catch (_) {
    return false;
  }
}

function directoryExists(dirPath) {
  try {
    const stat = fs.statSync(dirPath);
    return stat.isDirectory();
  } catch (_) {
    return false;
  }
}

if (!directoryExists(ROOT_DIR)) {
  console.error(`Directory not found: ${ROOT_DIR}`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);

    if (pathname.endsWith("/")) {
      pathname += "index.html";
    }

    let filePath = safeJoin(ROOT_DIR, pathname);

    // Prevent path traversal
    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };

    if (fileExists(filePath)) {
      res.writeHead(200, {
        ...headers,
        "Content-Type": getContentType(filePath),
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback to /index.html for non-asset routes (no dot in last segment)
    const lastSegment = path.basename(pathname);
    if (!lastSegment.includes(".")) {
      const indexPath = path.join(ROOT_DIR, "index.html");
      if (fileExists(indexPath)) {
        res.writeHead(200, {
          ...headers,
          "Content-Type": "text/html; charset=utf-8",
        });
        fs.createReadStream(indexPath).pipe(res);
        return;
      }
    }

    res.writeHead(404, {
      ...headers,
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end("Not Found");
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
    // eslint-disable-next-line no-console
    console.error(err);
  }
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  // eslint-disable-next-line no-console
  console.log(`Serving ${ROOT_DIR} at ${url}`);
  // eslint-disable-next-line no-console
  console.log("Usage: node tools/serve-static.js --port 9000 --dir public");
});
