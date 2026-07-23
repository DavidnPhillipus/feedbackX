/**
 * End-to-end smoke test — run with backend + DB available:
 *   npm run test:smoke
 */

const API = process.env.API_URL || "http://localhost:8080/v1";

const runId = Date.now().toString(36);
const testUser = {
  name: "Smoke Test",
  username: `smoke_${runId}`,
  email: `smoke_${runId}@example.com`,
  password: "SmokeTest1!",
};

let token = "";
let postId: number | null = null;
let passed = 0;
let failed = 0;

function ok(label: string) {
  passed += 1;
  console.log(`  ✓ ${label}`);
}

function fail(label: string, err: unknown) {
  failed += 1;
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`  ✗ ${label}: ${msg}`);
}

type ApiOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: BodyInit | Record<string, unknown> | FormData;
};

async function api(route: string, options: ApiOptions = {}) {
  const { auth, body, ...rest } = options;
  const headers: Record<string, string> = {
    ...(rest.headers as Record<string, string>),
  };
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API}${route}`, {
    ...rest,
    headers,
    body:
      body instanceof FormData
        ? body
        : body
          ? JSON.stringify(body)
          : null,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const validation = (data as { errors?: { message: string }[] }).errors
      ?.map((e) => e.message)
      .join(". ");
    throw new Error(
      (data as { message?: string; error?: string }).message ||
        (data as { error?: string }).error ||
        validation ||
        `HTTP ${res.status}`
    );
  }
  return data;
}

async function testHealth() {
  const res = await fetch(API.replace("/v1", "/"));
  const data = await res.json();
  if (!data.message) throw new Error("No API message");
  ok("API health");
}

async function testAuth() {
  const reg = await api("/auth/register", { method: "POST", body: testUser });
  ok("Register");

  const login = await api("/auth/login", {
    method: "POST",
    body: { username: testUser.username, password: testUser.password },
  });
  token = login.token;
  ok("Login");

  if (!token) throw new Error("No token");

  const me = await api("/auth/me", { auth: true });
  if (!me.user?.id) throw new Error("No user id");
  ok("Auth me");
}

async function testUploads() {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );

  const imageForm = new FormData();
  imageForm.append(
    "image",
    new Blob([png], { type: "image/png" }),
    "smoke.png"
  );
  const imageUp = await api("/upload/image", {
    method: "POST",
    auth: true,
    body: imageForm as unknown as BodyInit,
  });
  if (!imageUp.url) throw new Error("Image upload missing url");
  ok("Upload image");

  const pdfContent = "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF";
  const fileForm = new FormData();
  fileForm.append(
    "file",
    new Blob([pdfContent], { type: "application/pdf" }),
    "smoke.pdf"
  );
  const fileUp = await api("/upload/file", {
    method: "POST",
    auth: true,
    body: fileForm as unknown as BodyInit,
  });
  if (!fileUp.url || fileUp.mediaKind !== "pdf") {
    throw new Error("PDF upload failed");
  }
  ok("Upload PDF");

  const txtForm = new FormData();
  txtForm.append(
    "file",
    new Blob(["smoke test document"], { type: "text/plain" }),
    "smoke.txt"
  );
  await api("/upload/file", {
    method: "POST",
    auth: true,
    body: txtForm as unknown as BodyInit,
  });
  ok("Upload document");
}

async function testPosts() {
  const created = await api("/posts", {
    method: "POST",
    auth: true,
    body: {
      title: "Smoke test project title",
      body: "Smoke test project description for integration testing.",
      tags: ["Design"],
      published: true,
    },
  });
  postId = created.post?.id ?? created.id;
  if (!postId) throw new Error("Post not created");
  ok("Create post");

  const list = await api("/posts?page=1&limit=10", { auth: true });
  if (!Array.isArray(list.posts)) throw new Error("Posts list invalid");
  ok("List posts");

  await api(`/posts/${postId}/likes`, {
    method: "POST",
    auth: true,
    body: { emoji: "👍" },
  });
  ok("Like post");

  await api(`/posts/${postId}/replies`, {
    method: "POST",
    auth: true,
    body: { body: "Smoke test reply content here." },
  });
  ok("Reply to post");
}

async function testRooms() {
  if (!postId) throw new Error("No post for room test");

  const room = await api(`/posts/${postId}/feedback-room`, { auth: true });
  if (!room.room?.id) throw new Error("Feedback room missing");
  ok("Post feedback room");

  const rooms = await fetch(`${API}/rooms`).then((r) => r.json());
  if (!Array.isArray(rooms.rooms)) throw new Error("Rooms invalid");
  ok("List rooms");
}

async function testUsers() {
  const users = await api("/users?page=1&limit=5", { auth: true });
  if (!Array.isArray(users.users)) throw new Error("Users list invalid");
  ok("List users");
}

async function main() {
  console.log(`\nfeedbackX smoke test → ${API}\n`);

  const steps = [
    ["Health", testHealth],
    ["Auth", testAuth],
    ["Uploads", testUploads],
    ["Posts", testPosts],
    ["Rooms", testRooms],
    ["Users", testUsers],
  ] as const;

  for (const [name, fn] of steps) {
    console.log(name);
    try {
      await fn();
    } catch (err) {
      fail(name, err);
      break;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
