import puppeteer from "puppeteer";
import sendEmail from "./mail.js";
import "dotenv/config";

let found = false;
let recipient = process.env.recipient;
let url = process.env.url
let sku = process.env.sku
let taxaAtt = process.env.taxaAtt * 100000

async function searchYeezy() {
  let browser = await puppeteer.launch({
    headless: false,
    protocolTimeout: 60000,
  }); // 'new' para rodar em background

  while (!found) {
    // Abrir uma nova página
    const page = await browser.newPage();
    // Navegar para a URL especificada
    await page.goto(url, {
      waitUntil: "networkidle2",
    });

    console.error(`${new Date().toLocaleString()} -  Iniciando pesquisa do SKU: ${sku}`);

    // Extrair as informações dos produtos
    const productInfoList = await page.evaluate(() => {
      function normalizeString(s) {
        // Remove punctuation, convert to lowercase, and split into words
        s = s.replace(/[^\w\s]/g, "").toLowerCase();
        return s.split(/\s+/);
      }

      function extractProductInfo() {
        const products = document.querySelectorAll(
          ".plp-grid___1FP1J .grid-item"
        );
        const productInfoList = [];

        products.forEach((product) => {
          const titleElement = product.querySelector(
            '[data-auto-id="product-card-title"]'
          );
          const priceElement =
            product.querySelector(".gl-price-item--sale") ||
            product.querySelector(
              ".gl-price-item:not(.gl-price-item--crossed)"
            );
          const skuElement = product.querySelector(
            ".glass-product-card__assets-link"
          );
          const colorElement = product.querySelector(
            '[data-auto-id="product-card-colvar-count"]'
          );
          const urlElement = product.querySelector(
            ".glass-product-card__assets-link"
          );

          const sizeElements = product.querySelectorAll(
            '[data-auto-id="size-selector"] .gl-label'
          );

          const title = titleElement ? titleElement.textContent.trim() : "";
          const price = priceElement ? priceElement.textContent.trim() : "";
          const sku = skuElement
            ? skuElement.href.split("/").pop().replace(".html", "")
            : "";
          const color = colorElement ? colorElement.textContent.trim() : "";
          const url = urlElement ? urlElement.href : "";
          const sizes = sizeElements
            ? Array.from(sizeElements).map((size) => size.textContent.trim())
            : [];

          productInfoList.push({ title, price, sku, color, url, sizes });
        });

        return productInfoList;
      }

      return extractProductInfo();
    });

    // Exibir as informações dos produtos no console
    productInfoList.forEach((shoe) => {
      // console.error(shoe, 'e', shoe.sku)
      if (shoe.sku === sku) {
        sendEmail(
          "ATENÇÃO - Produto encontrado na Adidas!",
          recipient,
          `O produto 'ADIDAS YEEZY 700 WAVE RUNNER' foi encontrado no URL: \n${shoe.url}`
        );
        console.error(
          `${new Date().toLocaleString()} - O produto 'ADIDAS YEEZY 700 WAVE RUNNER' foi encontrado no URL: \n${shoe.url}`
        );
        console.error(
          `${new Date().toLocaleString()} - Email de alerta enviado com sucesso para ${recipient}`
        );
        found = true;
        return;
      }
    });
    if (!found) {
      console.error(
        `${new Date().toLocaleString()} - 'ADIDAS YEEZY 700 WAVE RUNNER' não encontrado para venda\n${new Date().toLocaleString()} - Aguarde 10 minutos...`
      );
      console.error('-------------------------------------------------')
      // 10 min
      await new Promise((resolve) => setTimeout(resolve, taxaAtt));
    }

    // Fechar o navegador
    await page.close();
  }
}

searchYeezy();
