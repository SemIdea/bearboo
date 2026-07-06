import { Prisma, PrismaClient } from "@prisma/client";
import createPrismaMock from "prisma-mock/client";

const prismaMock = createPrismaMock<PrismaClient>(Prisma, {
	datamodel: Prisma.dmmf.datamodel,
});

type IPrismaMockState = Parameters<typeof prismaMock.$setInternalState>[0];

// $clear() zera o estado sem as chaves dos models, e deleteMany/$transaction
// quebram em model ainda não recriado — o reset precisa re-seedar toda chave.
function resetPrismaMock(): void {
	const emptyState = Object.fromEntries(
		Prisma.dmmf.datamodel.models.map((model) => [
			model.name[0].toLowerCase() + model.name.slice(1),
			[],
		]),
	) as object as IPrismaMockState;

	prismaMock.$setInternalState(emptyState);
}

export { prismaMock, resetPrismaMock };
