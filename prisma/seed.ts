import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

const SEED_PASSWORD = "Password123!";

// seed roda via `node prisma/seed.ts` (ESM nativo), que exige extensão em todo
// import relativo — reimportar src/lib/slug quebraria a cadeia (kebabCase -> adapter,
// ambos sem extensão, resolvidos hoje só via moduleResolution "bundler" do Next).
// Duplica o mesmo algoritmo de src/lib/slug/implementations/kebabCase.ts.
const COMBINING_DIACRITICS_START = 0x0300;
const COMBINING_DIACRITICS_END = 0x036f;
const DIACRITICS_REGEX = new RegExp(
	`[${String.fromCharCode(COMBINING_DIACRITICS_START)}-${String.fromCharCode(COMBINING_DIACRITICS_END)}]`,
	"g",
);

function generateSlug(title: string): string {
	return title
		.normalize("NFD")
		.replace(DIACRITICS_REGEX, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80)
		.replace(/-+$/g, "");
}

async function main() {
	console.log("Limpando dados existentes...");
	await prisma.comment.deleteMany();
	await prisma.post.deleteMany();
	await prisma.session.deleteMany();
	await prisma.resetToken.deleteMany();
	await prisma.verificationToken.deleteMany();
	await prisma.user.deleteMany();

	const password = await hash(SEED_PASSWORD, 10);

	console.log("Criando usuários...");

	const ana = await prisma.user.create({
		data: {
			id: uuid(),
			name: "Ana Souza",
			email: "ana@bearboo.dev",
			password,
			bio: "Front-end dev apaixonada por markdown e café.",
			verified: true,
		},
	});

	const bruno = await prisma.user.create({
		data: {
			id: uuid(),
			name: "Bruno Lima",
			email: "bruno@bearboo.dev",
			password,
			bio: "Escrevo sobre backend, Postgres e tRPC.",
			verified: true,
		},
	});

	const carla = await prisma.user.create({
		data: {
			id: uuid(),
			name: "Carla Mendes",
			email: "carla@bearboo.dev",
			password,
			bio: null,
			verified: false,
		},
	});

	console.log(
		"Criando tokens (verify/reset) para testar os fluxos de email...",
	);

	const verifyToken = await prisma.verificationToken.create({
		data: {
			id: uuid(),
			token: uuid(),
			userId: carla.id,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
		},
	});

	const resetToken = await prisma.resetToken.create({
		data: {
			id: uuid(),
			token: uuid(),
			userId: ana.id,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60),
		},
	});

	console.log("Criando posts...");

	const anaPost1Title = "Bem-vindo ao Bearboo";
	const anaPost1 = await prisma.post.create({
		data: {
			id: uuid(),
			userId: ana.id,
			title: anaPost1Title,
			slug: generateSlug(anaPost1Title),
			content:
				"# Bem-vindo!\n\nEsse é o primeiro post do blog, escrito em **markdown**.\n\n- item 1\n- item 2\n\nUse esse post pra testar leitura, comentários e edição.",
		},
	});

	// post editado — updatedAt != createdAt, testa o label "(edited ...)"
	const anaPost2Title = "Dicas de markdown para o editor";
	const anaPost2 = await prisma.post.create({
		data: {
			id: uuid(),
			userId: ana.id,
			title: anaPost2Title,
			slug: generateSlug(anaPost2Title),
			content:
				"Você pode usar `código`, **negrito**, _itálico_ e listas.\n\n1. Primeiro\n2. Segundo\n3. Terceiro",
		},
	});
	await prisma.post.update({
		where: { id: anaPost2.id },
		data: { content: `${anaPost2.content}\n\n_Editado após publicação._` },
	});

	const brunoPost1Title = "Por que escolhemos tRPC neste projeto";
	const brunoPost1 = await prisma.post.create({
		data: {
			id: uuid(),
			userId: bruno.id,
			title: brunoPost1Title,
			slug: generateSlug(brunoPost1Title),
			content:
				"tRPC nos dá tipagem ponta a ponta sem precisar gerar client separado. Nesse post explico as trocas que fizemos.",
		},
	});

	console.log("Criando comentários...");

	await prisma.comment.create({
		data: {
			id: uuid(),
			postId: anaPost1.id,
			userId: bruno.id,
			content: "Muito bom, testei o cadastro e ficou redondo!",
		},
	});

	await prisma.comment.create({
		data: {
			id: uuid(),
			postId: anaPost1.id,
			userId: ana.id,
			content: "Valeu, Bruno! Ainda vou postar mais sobre o editor.",
		},
	});

	await prisma.comment.create({
		data: {
			id: uuid(),
			postId: brunoPost1.id,
			userId: ana.id,
			content: "Curti a comparação com REST, ficou bem clara.",
		},
	});

	console.log("\nSeed concluído.\n");
	console.log("Usuários criados (senha igual para todos):");
	console.log(`  senha: ${SEED_PASSWORD}\n`);
	console.log(`  ${ana.email}   (verificado, dono de 2 posts)`);
	console.log(`  ${bruno.email} (verificado, dono de 1 post)`);
	console.log(`  ${carla.email}  (NÃO verificado — use o link abaixo)\n`);
	console.log("Links para testar os fluxos de email:");
	console.log(`  verificação: /auth/verify/${verifyToken.token}`);
	console.log(`  recuperação de senha: /auth/recover/${resetToken.token}\n`);
	console.log("Posts:");
	console.log(`  /post/${anaPost1.slug}`);
	console.log(`  /post/${anaPost2.slug} (editado)`);
	console.log(`  /post/${brunoPost1.slug}`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
