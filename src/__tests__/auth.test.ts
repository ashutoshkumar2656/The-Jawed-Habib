import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { hashPassword, comparePassword } from "@/lib/auth/password";
import { signToken, verifyToken } from "@/lib/auth/jwt";
import { customerRegisterSchema, loginSchema } from "@/lib/validation/schemas";
import { RoleType } from "@prisma/client";

describe("Customer Authentication & RBAC", () => {
  it("validates customer registration schema correctly", () => {
    // Valid input
    const valid = customerRegisterSchema.safeParse({
      name: "Aman Verma",
      phone: "9831722983",
      email: "aman@example.com",
      password: "SecurePassword123!",
    });
    expect(valid.success).toBe(true);

    // Invalid phone
    const invalidPhone = customerRegisterSchema.safeParse({
      name: "Aman Verma",
      phone: "12345",
      password: "SecurePassword123!",
    });
    expect(invalidPhone.success).toBe(false);

    // Password too short
    const shortPass = customerRegisterSchema.safeParse({
      name: "Aman Verma",
      phone: "9831722983",
      password: "123",
    });
    expect(shortPass.success).toBe(false);
  });

  it("hashes password with bcrypt and compares correctly", async () => {
    const raw = "SuperSecretPassword!";
    const hash = await hashPassword(raw);
    expect(hash).not.toBe(raw);
    expect(hash.startsWith("$2")).toBe(true);

    const matches = await comparePassword(raw, hash);
    expect(matches).toBe(true);

    const wrong = await comparePassword("WrongPassword!", hash);
    expect(wrong).toBe(false);
  });

  it("registers a customer with customer profile", async () => {
    const testPhone = `983${Math.floor(1000000 + Math.random() * 9000000)}`;
    const passHash = await hashPassword("Customer@2026!");

    const user = await dbRepo.createUserWithCustomerProfile({
      name: "Priya Sinha",
      phone: testPhone,
      email: `priya_${Date.now()}@example.com`,
      passwordHash: passHash,
      address: "Tinpulwa Chowk, Lalganj",
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe("Priya Sinha");
    expect(user.phone).toBe(testPhone);
    expect(user.roleType).toBe(RoleType.CUSTOMER);
    expect(user.customerProfile).toBeDefined();
    expect(user.customerProfile?.address).toBe("Tinpulwa Chowk, Lalganj");
  });

  it("signs and verifies JWT session tokens with roles", () => {
    const payload = {
      userId: "usr_test_123",
      role: RoleType.CUSTOMER,
      phone: "7707000463",
      email: "client@jawedhabib.com",
    };

    const token = signToken(payload);
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.role).toBe(RoleType.CUSTOMER);
    expect(decoded?.phone).toBe(payload.phone);
  });

  it("authenticates registered customer credentials properly", async () => {
    const testPhone = `982${Math.floor(1000000 + Math.random() * 9000000)}`;
    const rawPass = "MyPassword@123";
    const passHash = await hashPassword(rawPass);

    await dbRepo.createUserWithCustomerProfile({
      name: "Karan Mehta",
      phone: testPhone,
      passwordHash: passHash,
    });

    // Lookup user
    const user = await dbRepo.findUserByPhoneOrEmail(testPhone);
    expect(user).not.toBeNull();

    const isMatch = await comparePassword(rawPass, user!.passwordHash!);
    expect(isMatch).toBe(true);

    const isFail = await comparePassword("IncorrectPass", user!.passwordHash!);
    expect(isFail).toBe(false);
  });

  it("ensures Admin Login and Customer Login frontend pages do not expose credentials", () => {
    const fs = require("fs");
    const adminLoginPage = fs.readFileSync("src/app/admin/login/page.tsx", "utf8");
    const customerLoginPage = fs.readFileSync("src/app/(auth)/login/page.tsx", "utf8");

    // Must not contain demo passwords or exposed fill buttons
    expect(adminLoginPage).not.toContain("Admin@123!");
    expect(adminLoginPage).not.toContain("HabibAdmin2026!");
    expect(adminLoginPage).not.toContain("One-Click Fill");
    expect(adminLoginPage).not.toContain("loadDemoAdmin");
    expect(adminLoginPage).not.toContain("Official Admin Access");

    expect(customerLoginPage).not.toContain("Customer@123!");
    expect(customerLoginPage).not.toContain("One-Click Fill");
    expect(customerLoginPage).not.toContain("handleDemoSignIn");
  });

  it("verifies public footer contains Axivon Technologies branding with secure target and rel attributes", () => {
    const fs = require("fs");
    const footerContent = fs.readFileSync("src/components/layout/footer.tsx", "utf8");

    expect(footerContent).toContain("Designed &amp; Developed by");
    expect(footerContent).toContain("Axivon Technologies");
    expect(footerContent).toContain("https://axivontech.in");
    expect(footerContent).toContain('target="_blank"');
    expect(footerContent).toContain('rel="noopener noreferrer"');
  });

  it("validates loginSchema supports rememberMe option", () => {
    const res = loginSchema.safeParse({
      phoneOrEmail: "7707000463",
      password: "ValidPassword123!",
      rememberMe: true,
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.rememberMe).toBe(true);
    }
  });

  it("verifies checkAdminAuth rejects unauthenticated requests with 401 status", async () => {
    const { checkAdminAuth } = await import("@/lib/auth/rbac");
    const mockReq = new Request("http://localhost:3000/api/admin/appointments");
    const authResult = checkAdminAuth(mockReq);
    expect(authResult.authorized).toBe(false);
    expect(authResult.status).toBe(401);
  });
});
