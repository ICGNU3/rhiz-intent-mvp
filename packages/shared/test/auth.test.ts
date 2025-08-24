import { getUserId } from "../src/auth";

describe("auth facade", () => {
  it("returns demo user when mock is on", async () => {
    process.env.USE_MOCK_AUTH = "true";
    const uid = await getUserId();
    expect(uid).toBe("demo-user");
  });
});
