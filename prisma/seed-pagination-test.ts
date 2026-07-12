import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { generateSlug } from "./slug.ts";

const prisma = new PrismaClient();

const TITLE_PREFIX = "Pagination test post";
const POST_COUNT = 15;

async function create() {
	const user = await prisma.user.findFirst();

	if (!user) {
		throw new Error(
			"Nenhum usuário encontrado — rode `yarn db:seed` primeiro.",
		);
	}

	for (let index = 1; index <= POST_COUNT; index += 1) {
		const title = `${TITLE_PREFIX} ${index}`;

		await prisma.post.create({
			data: {
				id: uuid(),
				userId: user.id,
				title,
				slug: generateSlug(title),
				content: `Post gerado só pra testar a paginação da home (#${index}). Seguro apagar.`,
			},
		});
	}

	console.log(
		`${POST_COUNT} posts de teste criados (prefixo "${TITLE_PREFIX}").`,
	);
	console.log(
		"Pra limpar depois: node --env-file=.env prisma/seed-pagination-test.ts --clean",
	);
}

async function clean() {
	const { count } = await prisma.post.deleteMany({
		where: { title: { startsWith: TITLE_PREFIX } },
	});

	console.log(`${count} posts de teste removidos.`);
}

const run = process.argv.includes("--clean") ? clean : create;

run()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
