import axios from "axios";

async function testShop() {
  console.log("🔎 Testando endpoint da Loja Fortnite...");

  try {
    const res = await axios.get(
      "https://fortnite-api.com/v2/shop?language=pt-BR",
      {
        headers: { "User-Agent": "FortniteShopTest/1.0" }
      }
    );

    if (!res.data || !res.data.data) {
      console.log(" A API não retornou um campo data.data");
      return;
    }

    const shop = res.data.data;
    const entries = shop.entries || [];

    console.log("📦 Total de entries:", entries.length);

    if (entries.length === 0) {
      console.log(" Nenhuma entry encontrada! Isso já explica o problema.");
      return;
    }

    console.log("\n Estrutura da PRIMEIRA entry:");
    console.log(Object.keys(entries[0]));

    console.log("\n Primeiro entry completo (resumido):");
    console.dir(entries[0], { depth: 5 });

    console.log("\n🟦 Itens dentro da entry:");
    console.log("items:", entries[0].items?.length);
    console.log("granted:", entries[0].granted?.length);
    console.log("bundle:", entries[0].bundle);
    console.log("cars:", entries[0].cars);

  } catch (err) {
    console.error(" Erro ao chamar a API:", err.message);
  }
}

testShop();
