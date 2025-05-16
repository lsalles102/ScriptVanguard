// Script para configuração automática do banco de dados no Supabase
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';

// Dados iniciais para popular o banco de dados
const seedCategories = [
  { name: "Aimbot", slug: "aimbot" },
  { name: "ESP", slug: "esp" },
  { name: "Mods", slug: "mods" },
  { name: "Scripts", slug: "scripts" }
];

const seedProducts = [
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

const seedTheme = {
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

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL não definida. Configure a variável de ambiente DATABASE_URL.");
    process.exit(1);
  }

  console.log("Conectando ao banco de dados PostgreSQL no Supabase...");
  
  // Configurar cliente SQL para Postgres
  const queryClient = postgres(process.env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10
  });
  
  const db = drizzle(queryClient, { schema });

  try {
    console.log("Iniciando configuração do banco de dados...");
    
    // Verificar tabelas existentes
    const tables = await queryClient`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const existingTables = tables.map(row => row.table_name);
    console.log("Tabelas existentes:", existingTables);
    
    // Verificar se precisamos criar as tabelas
    if (!existingTables.includes('users')) {
      console.log("Tabelas necessárias não encontradas.");
      
      try {
        // Tentar criar tabela de sessões
        console.log("Criando tabela sessions...");
        await queryClient`
          CREATE TABLE IF NOT EXISTS sessions (
            sid VARCHAR(255) PRIMARY KEY,
            sess JSONB NOT NULL,
            expire TIMESTAMP NOT NULL
          )
        `;
        
        // Criar índice para sessions
        await queryClient`CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire)`;
        
        // Tentar criar tabela de usuários
        console.log("Criando tabela users...");
        await queryClient`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY NOT NULL,
            email VARCHAR(255) UNIQUE,
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            profile_image_url VARCHAR(255),
            hwid VARCHAR(255),
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
        // Outras tabelas básicas...
        console.log("Criando tabela categories...");
        await queryClient`
          CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
        console.log("Criando tabela products...");
        await queryClient`
          CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            description TEXT NOT NULL,
            short_description TEXT,
            price INTEGER NOT NULL,
            category_id INTEGER REFERENCES categories(id),
            features JSONB,
            image_url TEXT,
            is_bestseller BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
        console.log("Criando tabela themes...");
        await queryClient`
          CREATE TABLE IF NOT EXISTS themes (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            is_active BOOLEAN DEFAULT FALSE,
            primary_color VARCHAR(50),
            secondary_color VARCHAR(50),
            accent_color VARCHAR(50),
            background_color VARCHAR(50),
            text_color VARCHAR(50),
            font_family VARCHAR(100),
            css_overrides TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
      } catch (err) {
        console.error("Erro ao criar tabelas:", err);
        console.log("Use o comando 'npm run db:push' para criar as tabelas via Drizzle ORM.");
      }
    }
    
    // Inserir dados iniciais
    console.log("Populando banco de dados com dados iniciais...");
    
    // Inserir categorias
    for (const category of seedCategories) {
      // Verificar se a categoria já existe
      const categoryExists = await queryClient`
        SELECT * FROM categories WHERE slug = ${category.slug} LIMIT 1
      `;
      
      if (categoryExists.length === 0) {
        await queryClient`
          INSERT INTO categories (name, slug) 
          VALUES (${category.name}, ${category.slug})
        `;
        console.log(`- Categoria criada: ${category.name}`);
      } else {
        console.log(`- Categoria já existe: ${category.name}`);
      }
    }
    
    // Inserir produtos
    for (const product of seedProducts) {
      // Verificar se o produto já existe
      const productExists = await queryClient`
        SELECT * FROM products WHERE slug = ${product.slug} LIMIT 1
      `;
      
      if (productExists.length === 0) {
        await queryClient`
          INSERT INTO products (
            name, slug, description, short_description, price, category_id,
            features, image_url, is_bestseller, is_active
          ) 
          VALUES (
            ${product.name}, 
            ${product.slug}, 
            ${product.description}, 
            ${product.shortDescription}, 
            ${product.price}, 
            ${product.categoryId},
            ${JSON.stringify(product.features)}, 
            ${product.imageUrl}, 
            ${product.isBestseller}, 
            ${product.isActive}
          )
        `;
        console.log(`- Produto criado: ${product.name}`);
      } else {
        console.log(`- Produto já existe: ${product.name}`);
      }
    }
    
    // Inserir tema padrão
    const themeExists = await queryClient`
      SELECT * FROM themes WHERE name = ${seedTheme.name} LIMIT 1
    `;
    
    if (themeExists.length === 0) {
      await queryClient`
        INSERT INTO themes (
          name, is_active, primary_color, secondary_color, accent_color,
          background_color, text_color, font_family
        ) 
        VALUES (
          ${seedTheme.name}, 
          ${seedTheme.isActive}, 
          ${seedTheme.primaryColor}, 
          ${seedTheme.secondaryColor}, 
          ${seedTheme.accentColor},
          ${seedTheme.backgroundColor}, 
          ${seedTheme.textColor}, 
          ${seedTheme.fontFamily}
        )
      `;
      console.log(`- Tema criado: ${seedTheme.name}`);
    } else {
      console.log(`- Tema já existe: ${seedTheme.name}`);
    }
    
    console.log("Configuração do banco de dados finalizada com sucesso!");
  } catch (error) {
    console.error("Erro ao configurar o banco de dados:", error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

// Executa a função
setupDatabase().catch(console.error);