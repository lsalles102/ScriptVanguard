// Script para criar tabelas e dados iniciais no Supabase
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';

// Função para criar um usuário administrador inicial
async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL não configurada, abortando seed");
    process.exit(1);
  }

  console.log("Conectando ao banco de dados...");
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client, { schema });

  try {
    console.log("Iniciando seed do banco de dados...");

    // Criar usuário admin
    console.log("Criando usuário admin...");
    const adminUser = {
      id: "admin_1",
      email: "admin@scriptvanguard.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    };

    const existingAdmin = await db.select().from(schema.users)
      .where(eq(schema.users.email, adminUser.email)).limit(1);

    if (existingAdmin.length === 0) {
      await db.insert(schema.users).values(adminUser);
      console.log(`- Admin criado: ${adminUser.email}`);
    } else {
      console.log(`- Admin já existe: ${adminUser.email}`);
    }

    // Criando categorias
    console.log("Criando categorias...");
    const categories = [
      { name: "Aimbot", slug: "aimbot" },
      { name: "ESP", slug: "esp" },
      { name: "Mods", slug: "mods" },
      { name: "Scripts", slug: "scripts" }
    ];

    for (const category of categories) {
      const existingCategory = await db.select().from(schema.categories)
        .where(eq(schema.categories.slug, category.slug)).limit(1);

      if (existingCategory.length === 0) {
        await db.insert(schema.categories).values(category);
        console.log(`- Categoria criada: ${category.name}`);
      } else {
        console.log(`- Categoria já existe: ${category.name}`);
      }
    }

    // Criando produtos
    console.log("Criando produtos...");
    const products = [
      {
        name: "BloodStrike Aimbot Pro",
        slug: "bloodstrike-aimbot-pro",
        description: "O melhor aimbot para BloodStrike com precisão automática e detecção de inimigos através de paredes.",
        shortDescription: "Aimbot premium com alta precisão e funções avançadas",
        price: 9900, // R$ 99,00
        categoryId: 1, // Aimbot
        features: ["Alvo automático", "Precisão configurável", "Anti-recoil", "Bypass de detecção", "Atualizações constantes"],
        imageUrl: "https://pixabay.com/get/g1891a2213814653ce217951e9f14ee4a81c04c28da18fa6878954067fa77eee619c085395814e8d905f967a87222eb43140d3f20ac6c9f56ee0ba4550be217a6_1280.jpg",
        isBestseller: true,
        isActive: true
      },
      {
        name: "BloodStrike ESP Vision",
        slug: "bloodstrike-esp-vision",
        description: "Veja todos os jogadores através de paredes, com informações detalhadas de distância, saúde e equipamento.",
        shortDescription: "Visão completa do campo de batalha através de paredes",
        price: 7900, // R$ 79,00
        categoryId: 2, // ESP
        features: ["Visão através de paredes", "Informação de equipamento", "Radar", "Distância dos inimigos", "Invisível para anti-cheat"],
        imageUrl: "https://pixabay.com/get/g1891a2213814653ce217951e9f14ee4a81c04c28da18fa6878954067fa77eee619c085395814e8d905f967a87222eb43140d3f20ac6c9f56ee0ba4550be217a6_1280.jpg",
        isBestseller: false,
        isActive: true
      },
      {
        name: "BloodStrike Mod Pack",
        slug: "bloodstrike-mod-pack",
        description: "Pacote completo de mods para BloodStrike incluindo texturas modificadas, skins exclusivas e efeitos visuais personalizados.",
        shortDescription: "Pacote completo de modificações visuais para BloodStrike",
        price: 5900, // R$ 59,00
        categoryId: 3, // Mods
        features: ["Skins exclusivas", "Efeitos visuais melhorados", "Texturas modificadas", "Fácil instalação", "Compatível com outros cheats"],
        imageUrl: "https://pixabay.com/get/g1891a2213814653ce217951e9f14ee4a81c04c28da18fa6878954067fa77eee619c085395814e8d905f967a87222eb43140d3f20ac6c9f56ee0ba4550be217a6_1280.jpg",
        isBestseller: false,
        isActive: true
      },
      {
        name: "BloodStrike Ultimate Bundle",
        slug: "bloodstrike-ultimate-bundle",
        description: "Pacote completo com todos os nossos hacks e mods para BloodStrike. Inclui aimbot, ESP, mod pack e suporte premium.",
        shortDescription: "Pacote completo com todos os hacks para BloodStrike",
        price: 14900, // R$ 149,00
        categoryId: 4, // Scripts
        features: ["Aimbot premium", "ESP completo", "Mod pack", "Bypass anti-cheat", "Suporte prioritário", "Atualizações vitalícias"],
        imageUrl: "https://pixabay.com/get/g1891a2213814653ce217951e9f14ee4a81c04c28da18fa6878954067fa77eee619c085395814e8d905f967a87222eb43140d3f20ac6c9f56ee0ba4550be217a6_1280.jpg",
        isBestseller: true,
        isActive: true
      }
    ];

    for (const product of products) {
      const existingProduct = await db.select().from(schema.products)
        .where(eq(schema.products.slug, product.slug)).limit(1);

      if (existingProduct.length === 0) {
        await db.insert(schema.products).values(product);
        console.log(`- Produto criado: ${product.name}`);
      } else {
        console.log(`- Produto já existe: ${product.name}`);
      }
    }

    // Criando tema padrão
    console.log("Criando tema padrão...");
    const defaultTheme = {
      name: "Cyberpunk Default",
      isActive: true,
      primaryColor: "#00f0ff",
      secondaryColor: "#ff2a6d",
      accentColor: "#7000ff",
      backgroundColor: "#050507",
      textColor: "#f9f9f9",
      fontFamily: "Share Tech Mono",
      cssOverrides: null
    };

    const existingTheme = await db.select().from(schema.themes)
      .where(eq(schema.themes.name, defaultTheme.name)).limit(1);

    if (existingTheme.length === 0) {
      await db.insert(schema.themes).values(defaultTheme);
      console.log(`- Tema criado: ${defaultTheme.name}`);
    } else {
      console.log(`- Tema já existe: ${defaultTheme.name}`);
    }

    // Criando reviews de exemplo
    console.log("Criando reviews...");
    const reviews = [
      {
        userId: "user_1",
        productId: 1,
        rating: 5,
        comment: "Ótimo produto, funcionando perfeitamente há 3 meses!",
      },
      {
        userId: "user_2",
        productId: 2,
        rating: 4,
        comment: "Muito bom, apenas alguns ajustes necessários.",
      },
      {
        userId: "user_3",
        productId: 3,
        rating: 5,
        comment: "Melhor investimento que fiz, recomendo!",
      },
      {
        userId: "user_4",
        productId: 4,
        rating: 5,
        comment: "Suporte excelente e produto de qualidade.",
      }
    ];

    for (const review of reviews) {
      await db.insert(schema.reviews).values(review);
      console.log(`- Review criado para produto ${review.productId}`);
    }

    console.log("Seed concluído com sucesso!");
  } catch (error) {
    console.error("Erro durante o seed do banco de dados:", error);
  } finally {
    await client.end();
  }
}

seedDatabase().catch(console.error);