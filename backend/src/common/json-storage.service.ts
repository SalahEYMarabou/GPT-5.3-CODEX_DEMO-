import { Injectable } from "@nestjs/common";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

@Injectable()
export class JsonStorageService {
  private readonly dataDir = join(process.cwd(), "data");

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
