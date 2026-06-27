import { exec } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const TIMEOUT = 10000; // 10 seconds max

export const executeCode = async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ success: false, error: "Language and code are required" });
  }

  const ext = { javascript: "js", python: "py", java: "java" }[language];
  if (!ext) {
    return res.status(400).json({ success: false, error: `Unsupported language: ${language}` });
  }

  const fileName = language === "java" ? "Main" : `code_${Date.now()}`;
  const filePath = join(tmpdir(), `${fileName}.${ext}`);

  try {
    writeFileSync(filePath, code);

    const commands = {
      javascript: `node ${filePath}`,
      python: `python3 ${filePath}`,
      java: `cd ${tmpdir()} && javac ${filePath} && java ${fileName}`,
    };

    const command = commands[language];

    exec(command, { timeout: TIMEOUT }, (error, stdout, stderr) => {
      // Clean up file
      try { unlinkSync(filePath); } catch {}
      if (language === "java") {
        try { unlinkSync(join(tmpdir(), `${fileName}.class`)); } catch {}
      }

      if (stderr && !stdout) {
        return res.json({ success: false, error: stderr });
      }

      if (error && !stdout) {
        return res.json({ success: false, error: error.message });
      }

      return res.json({ success: true, output: stdout || "No output", error: stderr || null });
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
