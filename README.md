# 🐻 Bearboo

**Bearboo** é um blog técnico pessoal desenvolvido com foco em performance, organização de código e boas práticas modernas.  
O projeto serve como repositório de estudos e demonstração prática do meu aprendizado em desenvolvimento web full-stack.

---

## ✨ Destaques Técnicos

- Arquitetura baseada em **DDD (Domain-Driven Design)** com separação clara entre entidades, repositórios, casos de uso e controladores.
- API implementada com **tRPC**, garantindo type-safety total entre backend e frontend.
- Sessões seguras com **Redis**, utilizado como cache para sessões e perfis de usuário.
- **PostgreSQL** como banco relacional principal, garantindo persistência robusta dos dados.
- **Next.js com ISR** para melhora de performance e SEO em páginas dinâmicas.
- Design responsivo com **Tailwind CSS** e suporte a tema claro/escuro.

---

## 📦 Funcionalidades

- 🔐 **Autenticação**
  - Registro, login, logout
  - Sessão com refresh automático
  - Recuperação de senha

- 📝 **Posts & Comentários**
  - CRUD completo para posts, comentários e perfis de usuário
  - Busca semântica de posts usando vetores de similaridade

- 👤 **Perfil de Usuário**
  - Página pública com posts e comentários
  - Edição de perfil com avatar e informações

- 🚀 **Performance e UX**
  - ISR com Next.js
  - Cache com Redis
  - Tema claro/escuro

---

## 🛠️ Como rodar localmente

1. Clone o repositório:

```bash
git clone https://github.com/SemIdea/bearboo.git
cd bearboo
````

2. Execute:

```bash
docker compose up --build
```

3. Acesse em `http://localhost:4000`

---

## 📂 Estrutura do Projeto

A organização segue princípios de DDD com separação entre:

```
src/
├── app/                # Rotas do Next.js
├── components/         # Componentes reutilizáveis
├── server/             # Camada backend (entidades, serviços, rotas, repositórios)
├── prisma/             # Schema e migrations
├── public/             # Assets públicos
```

---

## 📌 Status do Projeto

🚧 Em desenvolvimento
📁 Projeto pessoal, sem contribuição externa por enquanto.

---

## 📃 Licença

Este projeto está licenciado sob os termos da **MIT License**.

---

## 🔗 Futuro

* Publicação no [Vercel](https://vercel.com/) em breve
* Expansão do sistema de busca semântica
* Dashboard para gerenciamento de conteúdo

---

## 🤝 Contato

[GitHub](https://github.com/SemIdea)
