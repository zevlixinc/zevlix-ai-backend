import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const SHOPIFY_DOMAIN = "cs00bd-n7.myshopify.com";
const SHOPIFY_API_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;
const STOREFRONT_TOKEN = "9de3464fec3a1926f0aed544f6df8ddd";

async function callShopify(query, variables = {}) {
  const response = await fetch(SHOPIFY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN 
    },
    body: JSON.stringify({ query, variables })
  });
  return response.json();
}

app.get("/products", async (req, res) => {
  const query = `
    query {
      products(first: 20) {
        edges {
          node {
            id
            title
            description
            featuredImage { url }
            variants(first: 10) {
              edges {
                node {
                  id
                  price { amount }
                }
              }
            }
          }
        }
      }
    }
  `;
  res.json(await callShopify(query));
});

app.post("/cart/add", async (req, res) => {
  const { variantId, quantity } = req.body;

  const mutation = `
    mutation cartCreate($variantId: ID!, $quantity: Int!) {
      cartCreate(
        input: {
          lines: [
            { merchandiseId: $variantId, quantity: $quantity }
          ]
        }
      ) {
        cart {
          id
          checkoutUrl
        }
      }
    }
  `;

  res.json(await callShopify(mutation, { variantId, quantity }));
});

app.listen(3000, () => console.log("Zevlix AI backend running on port 3000"));
