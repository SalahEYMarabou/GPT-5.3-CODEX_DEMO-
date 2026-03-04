import { Injectable } from "@nestjs/common";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

@Injectable()
export class JsonStorageService {
  private readonly sourceDataDir = join(process.cwd(), "data");
  private readonly dataDir =
    process.env.VERCEL === "1"
      ? join("/tmp", "timesheet-data")
      : this.sourceDataDir;

  private async ensureDir(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true });
  }

  async read<T>(filename: string, fallback: T): Promise<T> {
    await this.ensureDir();
    const filePath = join(this.dataDir, filename);
    try {
      const content = await readFile(filePath, "utf8");
      return JSON.parse(content) as T;
    } catch {
      if (this.dataDir !== this.sourceDataDir) {
        try {
          const seeded = await readFile(
            join(this.sourceDataDir, filename),
            "utf8",
          );
          await writeFile(filePath, seeded, "utf8");
          return JSON.parse(seeded) as T;
        } catch {
          // Continue to fallback initialization below.
        }
      }

      await this.write(filename, fallback);
      return fallback;
    }
  }

  async write<T>(filename: string, payload: T): Promise<void> {
    await this.ensureDir();
    const filePath = join(this.dataDir, filename);
    await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
  }
}
