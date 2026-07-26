import { describe, expect, test } from "vitest";
import { env } from "@/lib/env";
import { uploadMediaSchema } from "../schema";

const buildFormData = (entries: Record<string, string | File>) => {
	const formData = new FormData();
	for (const [key, value] of Object.entries(entries)) {
		formData.set(key, value);
	}
	return formData;
};

describe("uploadMediaSchema", () => {
	test("accepts a valid image with alt text", () => {
		const file = new File(["bytes"], "cover.png", { type: "image/png" });
		const result = uploadMediaSchema.safeParse(
			buildFormData({ file, altText: "a nice cover" }),
		);

		expect(result.success).toBe(true);
	});

	test("rejects a FormData with no file field", () => {
		const result = uploadMediaSchema.safeParse(buildFormData({}));

		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe("A file is required.");
	});

	test("rejects when the file field is a plain string, not a File", () => {
		const result = uploadMediaSchema.safeParse(
			buildFormData({ file: "not-a-file" }),
		);

		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe("A file is required.");
	});

	test("rejects an unsupported mime type", () => {
		const file = new File(["bytes"], "doc.pdf", { type: "application/pdf" });
		const result = uploadMediaSchema.safeParse(buildFormData({ file }));

		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe("Unsupported image format.");
	});

	test("accepts a file exactly at the max size boundary", () => {
		const file = new File(
			[new Uint8Array(env.media.maxUploadSizeBytes)],
			"cover.png",
			{ type: "image/png" },
		);
		const result = uploadMediaSchema.safeParse(buildFormData({ file }));

		expect(result.success).toBe(true);
	});

	test("rejects a file one byte over the max size boundary", () => {
		const file = new File(
			[new Uint8Array(env.media.maxUploadSizeBytes + 1)],
			"cover.png",
			{ type: "image/png" },
		);
		const result = uploadMediaSchema.safeParse(buildFormData({ file }));

		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe(
			"Image exceeds the maximum allowed size.",
		);
	});

	test("accepts alt text exactly at the 300 character boundary", () => {
		const file = new File(["bytes"], "cover.png", { type: "image/png" });
		const result = uploadMediaSchema.safeParse(
			buildFormData({ file, altText: "a".repeat(300) }),
		);

		expect(result.success).toBe(true);
	});

	test("rejects alt text one character over the 300 character boundary", () => {
		const file = new File(["bytes"], "cover.png", { type: "image/png" });
		const result = uploadMediaSchema.safeParse(
			buildFormData({ file, altText: "a".repeat(301) }),
		);

		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe(
			"Alt text must not exceed 300 characters.",
		);
	});

	test("treats an empty alt text string as not provided", () => {
		const file = new File(["bytes"], "cover.png", { type: "image/png" });
		const result = uploadMediaSchema.safeParse(
			buildFormData({ file, altText: "" }),
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.altText).toBeUndefined();
		}
	});

	test("defaults alt text to undefined when the field is omitted entirely", () => {
		const file = new File(["bytes"], "cover.png", { type: "image/png" });
		const result = uploadMediaSchema.safeParse(buildFormData({ file }));

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.altText).toBeUndefined();
		}
	});
});
