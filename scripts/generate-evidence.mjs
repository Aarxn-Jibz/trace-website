/**
 * Generates the non-text evidence artefacts for TRACE-001.
 *
 * Text artefacts (logs, csv, md, json) are authored by hand in
 * public/evidence/trace-001. This script produces the binary ones, plus a
 * manifest of real sizes + SHA-256 digests used by src/data.
 *
 *   node scripts/generate-evidence.mjs
 */
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "evidence", "trace-001");
/** Digests live in src/data so the UI never ships stale integrity values. */
const MANIFEST = join(__dirname, "..", "src", "data", "evidence-manifest.json");

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const ip = (s) => s.split(".").map((o) => Number(o));
const mac = (s) => s.split(":").map((o) => parseInt(o, 16));

/** Internet checksum over a buffer (ones complement of 16-bit sum). */
function checksum(buf) {
  let sum = 0;
  for (let i = 0; i < buf.length - 1; i += 2) sum += (buf[i] << 8) | buf[i + 1];
  if (buf.length & 1) sum += buf[buf.length - 1] << 8;
  while (sum >> 16) sum = (sum & 0xffff) + (sum >> 16);
  return (~sum & 0xffff) >>> 0;
}

class Writer {
  constructor() {
    this.parts = [];
  }
  u8(v) {
    const b = Buffer.alloc(1);
    b.writeUInt8(v & 0xff);
    this.parts.push(b);
    return this;
  }
  u16(v) {
    const b = Buffer.alloc(2);
    b.writeUInt16BE(v & 0xffff);
    this.parts.push(b);
    return this;
  }
  u32(v) {
    const b = Buffer.alloc(4);
    b.writeUInt32BE(v >>> 0);
    this.parts.push(b);
    return this;
  }
  bytes(b) {
    this.parts.push(Buffer.from(b));
    return this;
  }
  str(s) {
    this.parts.push(Buffer.from(s, "latin1"));
    return this;
  }
  buf() {
    return Buffer.concat(this.parts);
  }
}

/* ------------------------------------------------------------------ */
/* Ethernet / IP / TCP / UDP builders                                  */
/* ------------------------------------------------------------------ */

const SRC_MAC = mac("08:00:27:4c:9a:11"); // 192.168.1.42
const DST_MAC = mac("52:54:00:12:35:02"); // 10.20.4.114
const GW_MAC = mac("52:54:00:aa:bb:01");

function eth(payload, type, dst = DST_MAC, src = SRC_MAC) {
  const w = new Writer();
  w.bytes(dst);
  w.bytes(src);
  w.u16(type);
  w.bytes(payload);
  return w.buf();
}

function ipv4(srcStr, dstStr, proto, payload) {
  const src = ip(srcStr);
  const dst = ip(dstStr);
  const total = 20 + payload.length;
  const w = new Writer();
  w.u8(0x45).u8(0x00);
  w.u16(total);
  w.u16(0x1c46); // id
  w.u16(0x4000); // don't fragment
  w.u8(64).u8(proto);
  w.u16(0); // checksum placeholder
  w.bytes(src);
  w.bytes(dst);
  const header = w.buf();
  const csum = checksum(header);
  header.writeUInt16BE(csum, 10);
  return Buffer.concat([header, payload]);
}

/** Full TCP segment with correct checksum over the pseudo-header. */
function tcpSegment(srcIpStr, dstIpStr, srcPort, dstPort, seq, ack, flags, payload = Buffer.alloc(0)) {
  const ph = new Writer();
  ph.bytes(ip(srcIpStr));
  ph.bytes(ip(dstIpStr));
  ph.u8(0).u8(6);
  ph.u16(20 + payload.length);

  const seg = new Writer();
  seg.u16(srcPort).u16(dstPort);
  seg.u32(seq).u32(ack);
  seg.u8(0x50).u8(flags);
  seg.u16(65535);
  seg.u16(0);
  seg.u16(0);
  const partial = seg.buf();
  const csum = checksum(Buffer.concat([ph.buf(), partial, payload]));
  partial.writeUInt16BE(csum, 16);
  return Buffer.concat([partial, payload]);
}

function udp(srcIpStr, dstIpStr, srcPort, dstPort, payload) {
  const ph = new Writer();
  ph.bytes(ip(srcIpStr));
  ph.bytes(ip(dstIpStr));
  ph.u8(0).u8(17);
  ph.u16(8 + payload.length);

  const h = new Writer();
  h.u16(srcPort).u16(dstPort);
  h.u16(8 + payload.length);
  h.u16(0);
  const partial = h.buf();
  const csum = checksum(Buffer.concat([ph.buf(), partial, payload]));
  partial.writeUInt16BE(csum, 6);
  return Buffer.concat([partial, payload]);
}

/** Minimal DNS message — question + (optional) A answer. */
function dns(qname, isResponse, answerIp) {
  const labels = qname.split(".");
  const q = new Writer();
  for (const l of labels) q.u8(l.length).str(l);
  q.u8(0);
  q.u16(1).u16(1); // A, IN

  const head = new Writer();
  head.u16(0x0120);
  head.u16(isResponse ? 0x8180 : 0x0100);
  head.u16(1); // qdcount
  head.u16(isResponse ? 1 : 0); // ancount
  head.u16(0).u16(0);
  const body = new Writer();
  body.bytes(q.buf());
  if (isResponse && answerIp) {
    body.u16(0xc00c); // pointer to name
    body.u16(1).u16(1); // A IN
    body.u32(300); // ttl
    body.u16(4);
    body.bytes(ip(answerIp));
  }
  return Buffer.concat([head.buf(), body.buf()]);
}

function arp(srcIpStr, targetIpStr, srcMac, isReply, targetMac) {
  const w = new Writer();
  w.u16(0x0001); // ethernet
  w.u16(0x0800); // ipv4
  w.u8(6).u8(4);
  w.u16(isReply ? 2 : 1);
  w.bytes(srcMac);
  w.bytes(ip(srcIpStr));
  w.bytes(isReply ? targetMac : Buffer.alloc(6));
  w.bytes(ip(targetIpStr));
  return w.buf();
}

/* ------------------------------------------------------------------ */
/* pcap assembly                                                       */
/* ------------------------------------------------------------------ */

function pcap(records) {
  const gh = new Writer();
  gh.u32(0xa1b2c3d4);
  gh.u16(2).u16(4);
  gh.u32(0); // thiszone
  gh.u32(0); // sigfigs
  gh.u32(65535); // snaplen
  gh.u32(1); // ethernet

  const out = [gh.buf()];
  for (const { ts, data } of records) {
    const sec = Math.floor(ts);
    const usec = Math.round((ts - sec) * 1e6);
    const h = new Writer();
    h.u32(sec).u32(usec);
    h.u32(data.length).u32(data.length);
    out.push(h.buf(), data);
  }
  return Buffer.concat(out);
}

const SSH_BANNER = "SSH-2.0-OpenEnchanted_8.9p1 EnchantedLinux-9.4\r\n";
const CLIENT_BANNER = "SSH-2.0-TraceClient_1.2\r\n";

function buildCapture() {
  const T = (min, sec) => 1755130000 + min * 60 + sec; // 2026-08-14 ~01:26 UTC
  const records = [];
  const add = (ts, data) => records.push({ ts, data });

  // ARP resolution for the gateway
  add(T(1, 4.002), eth(arp("192.168.1.42", "192.168.1.1", SRC_MAC, false), 0x0806, Buffer.from("ff:ff:ff:ff:ff:ff".split(":").map((x) => parseInt(x, 16))), SRC_MAC));
  add(T(1, 4.004), eth(arp("192.168.1.1", "192.168.1.42", GW_MAC, true, SRC_MAC), 0x0806, SRC_MAC, GW_MAC));

  // DNS lookups against the Ministry resolver
  add(T(1, 9.118), eth(ipv4("192.168.1.42", "10.20.0.2", 17, udp("192.168.1.42", "10.20.0.2", 47122, 53, dns("archive-index.ministry.gov.magic", false)))));
  add(T(1, 9.131), eth(ipv4("10.20.0.2", "192.168.1.42", 17, udp("10.20.0.2", "192.168.1.42", 53, 47122, dns("archive-index.ministry.gov.magic", true, "10.20.4.114"))), 0x0800, SRC_MAC, DST_MAC));
  add(T(1, 9.884), eth(ipv4("192.168.1.42", "8.8.8.8", 17, udp("192.168.1.42", "8.8.8.8", 50114, 53, dns("ingest.dropshire.net", false)))));
  add(T(1, 9.907), eth(ipv4("8.8.8.8", "192.168.1.42", 17, udp("8.8.8.8", "192.168.1.42", 53, 50114, dns("ingest.dropshire.net", true, "203.0.113.77"))), 0x0800, SRC_MAC, DST_MAC));

  // SSH session to mo-auror-01
  let seq = 0x9a1b2000;
  let ack = 0;
  add(T(1, 43.002), eth(ipv4("192.168.1.42", "10.20.4.114", 6, tcpSegment("192.168.1.42", "10.20.4.114", 52331, 22, seq, 0, 0x02))));
  ack = seq + 1;
  add(T(1, 43.004), eth(ipv4("10.20.4.114", "192.168.1.42", 6, tcpSegment("10.20.4.114", "192.168.1.42", 22, 52331, 0x51f0aa10, ack, 0x12)), 0x0800, SRC_MAC, DST_MAC));
  seq = ack;
  ack = 0x51f0aa11;
  add(T(1, 43.006), eth(ipv4("192.168.1.42", "10.20.4.114", 6, tcpSegment("192.168.1.42", "10.20.4.114", 52331, 22, seq, ack, 0x10))));
  add(T(1, 43.061), eth(ipv4("10.20.4.114", "192.168.1.42", 6, tcpSegment("10.20.4.114", "192.168.1.42", 22, 52331, ack, seq, 0x18, Buffer.from(SSH_BANNER))), 0x0800, SRC_MAC, DST_MAC));
  seq += 0;
  add(T(1, 43.064), eth(ipv4("192.168.1.42", "10.20.4.114", 6, tcpSegment("192.168.1.42", "10.20.4.114", 52331, 22, seq, ack + SSH_BANNER.length, 0x18, Buffer.from(CLIENT_BANNER)))));

  // Interactive session — a handful of data segments
  const commands = ["ps aux\r", "sudo kill -9 1182\r", "sudo rm -rf /var/lib/pensieve/vault/.idx\r"];
  let off = 1;
  for (const c of commands) {
    add(T(1, 43 + off, 0.2 * off), eth(ipv4("192.168.1.42", "10.20.4.114", 6, tcpSegment("192.168.1.42", "10.20.4.114", 52331, 22, seq, ack + SSH_BANNER.length, 0x18, Buffer.from(c)))));
    off += 1;
  }

  // Teardown
  add(T(1, 55.019), eth(ipv4("192.168.1.42", "10.20.4.114", 6, tcpSegment("192.168.1.42", "10.20.4.114", 52331, 22, seq, ack, 0x11))));

  // Outbound transfer to the collection host
  add(T(3, 2.001), eth(ipv4("192.168.1.42", "192.168.1.88", 6, tcpSegment("192.168.1.42", "192.168.1.88", 52488, 22, 0x7c1000aa, 0, 0x02))));
  add(T(3, 2.003), eth(ipv4("192.168.1.88", "192.168.1.42", 6, tcpSegment("192.168.1.88", "192.168.1.42", 22, 52488, 0x1ab2cc30, 0x7c1000ab, 0x12)), 0x0800, SRC_MAC, mac("08:00:27:1f:33:0c")));
  add(T(3, 2.007), eth(ipv4("192.168.1.42", "192.168.1.88", 6, tcpSegment("192.168.1.42", "192.168.1.88", 52488, 22, 0x7c1000ab, 0x1ab2cc31, 0x18, Buffer.from("C0644 40790213 idx_backup.tar.gz\n")))));
  add(T(3, 44.118), eth(ipv4("192.168.1.42", "192.168.1.88", 6, tcpSegment("192.168.1.42", "192.168.1.88", 52488, 22, 0x7c1000ab, 0x1ab2cc31, 0x14)))); // RST

  records.sort((a, b) => a.ts - b.ts);
  return pcap(records);
}

/* ------------------------------------------------------------------ */
/* pseudo-binary artefacts                                             */
/* ------------------------------------------------------------------ */

const STRINGS = [
  "mo-auror-01",
  "/var/lib/pensieve/vault/.idx",
  "ward-daemon",
  "a.prewett",
  "svc.archive",
  "192.168.1.42",
  "192.168.1.88",
  "ingest.dropshire.net",
  "idx_backup.tar.gz",
  "pensieve-index --rebuild --force",
  "archive@ministry.gov.magic",
  "MOM-WS-0114",
  "EnchantedLinux 9.4",
  "TRACE-001",
];

function synthesise(sizeBytes, seed, header) {
  const out = Buffer.alloc(sizeBytes);
  let x = seed >>> 0;
  for (let i = 0; i < sizeBytes; i++) {
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    out[i] = x & 0xff;
  }
  if (header) header.copy(out, 0);
  // sprinkle recognisable strings so the artefact reads plausibly in a hex viewer
  for (const s of STRINGS) {
    const at = (x = (x * 1664525 + 1013904223) >>> 0) % Math.max(1, sizeBytes - 64);
    out.write(s, at, "latin1");
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  await writeFile(join(OUT, "network_capture.pcap"), buildCapture());
  await writeFile(
    join(OUT, "memory_dump.raw"),
    synthesise(1024 * 1024 * 3, 0x51f0aa10, Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00])),
  );
  await writeFile(
    join(OUT, "mail_archive.pst"),
    synthesise(1024 * 512, 0x1ab2cc30, Buffer.from("!BDN\x00\x00\x00\x00", "latin1")),
  );

  const files = (await readdir(OUT)).sort();
  const manifest = {};
  console.log("\n  TRACE-001 evidence manifest\n  " + "-".repeat(78));
  for (const f of files) {
    const p = join(OUT, f);
    const buf = await readFile(p);
    const sha = createHash("sha256").update(buf).digest("hex");
    const { size } = await stat(p);
    manifest[f] = { size, sha256: sha };
    console.log(`  ${f.padEnd(26)} ${String(size).padStart(9)} B   ${sha.slice(0, 16)}…`);
  }
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log("  -> src/data/evidence-manifest.json\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
