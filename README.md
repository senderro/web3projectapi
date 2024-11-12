# Hello Everyone
My name is Lorenzo Henrique, and I created this small project using XRPL for the XRPL Student Residency program :)

## Inspiration
The inspiration for my project came from interacting with various game developers who wanted to integrate blockchain technology into their games, particularly focusing on NFTs, but didn't know where to start. I envisioned that an API designed for this purpose, which does almost everything for them, would be a great idea. This way, they could concentrate on creating an engaging game rather than needing to learn everything about WEB3. This would result in more enjoyable games rather than products that simply implement a trendy technology without purpose, as is the case with many WEB3 games currently on the market.

## What it does
It is an API aimed at enabling creators to mint NFTs and set up their own item sale pages through our app, without having to pay high fees using other platforms or dealing with the complexity of implementing such a system. Selling items becomes much easier with XRPL. I also implemented an NFT marketplace where users can transfer and sell their NFTs to other users.

For Game Dev:
-You can mint nfts for yours players.
-You can create a gameshop page and mint nfts for yours players buy.
-Its easy to use.

For players:
-You can view your items.
-You can sold, transfer and buy new items.

## How I built it
I built this system primarily using Next.js, as it makes deploying the site straightforward and is easy to use for creating endpoints and working with server-side logic. Additionally, it integrates well with a free-to-use PostgreSQL database. I developed a backend to utilize XRPL, integrating it with the Crossmark wallet and leveraging its documentation. I also used Iron Session to create and manage user sessions and Prisma for a more efficient and reliable way to interact with the database. Moreover, I utilized Ripple Key Pairs to authenticate developer users so they can access the mintNft endpoint.

## Challenges I ran into
The main challenge was implementing access to my endpoint for third parties (enabling CORS), as I made some mistakes at certain points, but I eventually managed to implement it correctly. Another challenge was creating a flow for minting NFTs, where I had to mint the NFT and then present it to the user for acceptance. This was somewhat difficult for me since I was more familiar with blockchains like Ethereum and Bitcoin.

## What I learned
I greatly improved my knowledge of using Next.js, which was a significant achievement for me. I also learned how to use XRPL and became familiar with its functions, which I find quite interesting :)

## What you need to test the deployed site
Just install [Crossmark](https://crossmark.io/) and create a network on Ripple's test server. I am using the server `wss://s.altnet.rippletest.net:51233`.

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



#### .env

POSTGRES_URL=""

POSTGRES_PRISMA_URL=""

POSTGRES_URL_NO_SSL=""

POSTGRES_URL_NON_POOLING=""

POSTGRES_USER=""

POSTGRES_HOST=""

POSTGRES_PASSWORD=""

POSTGRES_DATABASE=""

SECRET_SEED=""

NODE_ENV=""

SESSION_SECRET=""

PUBLIC_ADDRESS=""

PINATA_JWT=""

NEXT_PUBLIC_GATEWAY_URL=""


