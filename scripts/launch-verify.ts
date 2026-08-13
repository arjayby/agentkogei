const verificationSteps = [
	["bun", "run", "format:check"],
	["bun", "run", "release:audit"],
	["bun", "run", "check-types"],
	["bun", "run", "build"],
	["bun", "run", "test"],
] as const;

for (const command of verificationSteps) {
	const process_ = Bun.spawn(command, {
		cwd: process.cwd(),
		stdin: "inherit",
		stdout: "inherit",
		stderr: "inherit",
	});
	const exitCode = await process_.exited;
	if (exitCode !== 0) process.exit(exitCode);
}
