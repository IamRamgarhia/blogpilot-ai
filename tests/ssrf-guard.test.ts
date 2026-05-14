import { describe, it, expect } from "vitest";
import { assertExternalUrl, isPrivateHostname, UnsafeUrlError } from "@/lib/net/ssrf-guard";

describe("isPrivateHostname", () => {
  it("blocks localhost", () => {
    expect(isPrivateHostname("localhost")).toBe(true);
  });
  it("blocks 127.0.0.1 family", () => {
    expect(isPrivateHostname("127.0.0.1")).toBe(true);
    expect(isPrivateHostname("127.0.0.5")).toBe(true);
  });
  it("blocks 0.0.0.0", () => {
    expect(isPrivateHostname("0.0.0.0")).toBe(true);
  });
  it("blocks RFC1918 ranges", () => {
    expect(isPrivateHostname("10.0.0.5")).toBe(true);
    expect(isPrivateHostname("172.16.5.5")).toBe(true);
    expect(isPrivateHostname("172.31.0.1")).toBe(true);
    expect(isPrivateHostname("192.168.1.1")).toBe(true);
  });
  it("blocks 169.254 link-local + AWS metadata", () => {
    expect(isPrivateHostname("169.254.169.254")).toBe(true);
  });
  it("blocks IPv6 loopback + link-local", () => {
    expect(isPrivateHostname("::1")).toBe(true);
    expect(isPrivateHostname("fe80::1")).toBe(true);
  });
  it("allows public hosts", () => {
    expect(isPrivateHostname("example.com")).toBe(false);
    expect(isPrivateHostname("dicecodes.com")).toBe(false);
    expect(isPrivateHostname("1.1.1.1")).toBe(false);
  });
});

describe("assertExternalUrl", () => {
  it("throws UnsafeUrlError on localhost", () => {
    expect(() => assertExternalUrl("http://localhost/x")).toThrow(UnsafeUrlError);
  });
  it("throws on private LAN", () => {
    expect(() => assertExternalUrl("http://192.168.1.1/secret")).toThrow(UnsafeUrlError);
  });
  it("throws on AWS metadata service", () => {
    expect(() => assertExternalUrl("http://169.254.169.254/latest/meta-data/")).toThrow(UnsafeUrlError);
  });
  it("throws on file:// protocol", () => {
    expect(() => assertExternalUrl("file:///etc/passwd")).toThrow(UnsafeUrlError);
  });
  it("throws on invalid URL", () => {
    expect(() => assertExternalUrl("not-a-url")).toThrow(UnsafeUrlError);
  });
  it("returns parsed URL for valid public URLs", () => {
    const u = assertExternalUrl("https://example.com/path");
    expect(u.hostname).toBe("example.com");
  });
});
