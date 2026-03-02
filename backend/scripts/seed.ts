import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

async function seed() {
  const dataDir = join(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });

  const users = Array.from({ length: 22 }, (_, index) => {
    const number = index + 1;
    const isAdmin = number <= 2;
    return {
      id: `user-${number}`,
      name:
        number === 1
          ? "Admin"
          : isAdmin
            ? `Admin ${number}`
            : `Employee ${number}`,
      email: `employee${number}@example.com`,
      role: isAdmin ? "admin" : "employee",
      createdAt: new Date().toISOString(),
    };
  });

  const credentials = users.map((user, index) => ({
    userId: user.id,
    username: user.email,
    password: index < 2 ? "Admin@123" : "Employee@123",
  }));

  await writeFile(
    join(dataDir, "users.json"),
    JSON.stringify(users, null, 2),
    "utf8",
  );
  await writeFile(
    join(dataDir, "credentials.json"),
    JSON.stringify(credentials, null, 2),
    "utf8",
  );
  await writeFile(
    join(dataDir, "sessions.json"),
    JSON.stringify([], null, 2),
    "utf8",
  );
  await writeFile(
    join(dataDir, "timesheets.json"),
    JSON.stringify([], null, 2),
    "utf8",
  );

  console.log(
    "Seed complete: users + credentials + empty sessions/timesheets.",
  );
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
