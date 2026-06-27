<div align="center">
  <img src="public/logo.png" alt="Monad Go Logo" width="180" />
  <h1>🎮 Monad Go</h1>
  <p><b>Gotta Catch 'em All on Monad! The Future of Location-Based Web3 AR Gaming.</b></p>
  <p>Built exclusively for the <b>Ankara Hackathon</b> ⚡</p>

  <div>
    <p style="font-size: 18px;"><b>🟢 Play Live Now:</b> <a href="https://monadgo.vercel.app/">https://monadgo.vercel.app/</a></p>
    <a href="https://monadgo.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/PLAY_LIVE_DEMO-0D0620?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
    </a>
  </div>
  <br/>
  <p><b>🏆 Hackathon Category:</b> GameFi / Web3 Gaming & AR</p>
  <div>
    <img src="https://img.shields.io/badge/Blockchain-Monad-836EF9?style=for-the-badge" alt="Monad" />
    <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Web3-Ethers.js-3C3C3D?style=for-the-badge&logo=ethereum" alt="Web3" />
    <img src="https://img.shields.io/badge/Tech-AR%20%26%20Geolocation-FF6B6B?style=for-the-badge" alt="AR" />
  </div>
</div>

<br/>

## 🌌 The Vision: Revolutionizing Web3 Gaming on Monad

For years, Web3 gaming has struggled with a massive bottleneck: **Friction**. Traditional blockchains are too slow and too expensive to support real-time, micro-interaction gaming. Players don't want to wait 15 seconds for a transaction to clear just to throw an item or take a step in a game.

**Enter Monad Go.**

We are bridging the gap between the physical world and the digital Web3 ecosystem. Inspired by the cultural phenomenon of Pokémon GO, we created a game where players actually have to step outside, explore their physical surroundings using GPS, and hunt down legendary **MonAnimals** as NFTs.

### ⚡ Why Monad? (The Ecosystem Impact)
**Monad Go** is a love letter to the Monad ecosystem. It showcases exactly why Monad's architecture is a game-changer:
1. **Instant Micro-Transactions:** In Monad Go, *every single time* a player throws a coin to catch a monster, an on-chain transaction of `0.01 MON` is executed. On any other EVM chain, this would completely ruin the immersion. On Monad, the extreme parallel execution and sub-second finality make the transaction feel **instant**.
2. **Mass Onboarding (SocialFi):** By integrating viral QR sharing and X (Twitter) social quests, Monad Go is designed to be an onboarding funnel. It brings non-crypto natives into the Monad ecosystem through the universal appeal of gaming.
3. **True Ownership:** Every caught MonAnimal isn't just a database entry; it's a verifiable asset on the fastest blockchain in the world.

---

## 📸 Step-by-Step Interactive Walkthrough

We have meticulously crafted every screen of Monad Go to provide a AAA mobile experience in the browser. Here is the complete journey of a player:

### 1. The Gateway (Onboarding)
<div align="center">
  <img src="foto/IMG_8247.PNG" width="300" />
</div>
When a user opens Monad Go, they are greeted with a sleek, cyberpunk-inspired onboarding flow. This screen introduces them to the Monad Go universe, immediately setting the high-quality visual tone with smooth glass-morphism UI.

<br/>

### 2. The Lore
<div align="center">
  <img src="foto/IMG_8248.PNG" width="300" />
</div>
Players learn about their objective: The 7 Legendary MonAnimals have escaped into the real world. This step builds excitement and gives the player a clear goal before they even connect their wallet.

<br/>

### 3. Web3 Identity (Mandatory Wallet Connection)
<div align="center">
  <img src="foto/IMG_8249.PNG" width="300" />
</div>
We enforce a strict Web3-first approach. Players **must** connect their Web3 wallet to proceed. 
*Technical Flex:* The app uses the wallet address to strictly isolate local storage data. This means multiple users can play on the exact same physical device, and each wallet will load its own unique collection and game state perfectly.

<br/>

### 4. Bridging Realities (Sensor Permissions)
<div align="center">
  <img src="foto/IMG_8250.PNG" width="300" />
</div>
To blur the lines between the game and reality, Monad Go requests access to the device's **Camera**, **Location (GPS)**, and **Gyroscope**. These aren't gimmicks—they are the core engines of our AR experience.

<br/>

### 5. The Monad World Map
<div align="center">
  <img src="foto/IMG_8251.PNG" width="300" />
</div>
The core exploration hub. Powered by `Leaflet.js` and real-time Geolocation tracking, players see themselves on a stylized dark-mode map of the real world. MonAnimals dynamically spawn around the player's physical location within a 2km radius. If you want to catch them, you literally have to walk to them!

<br/>

### 6. Entering AR Catch Mode
<div align="center">
  <img src="foto/IMG_8252.jpg" width="300" />
</div>
Once a player taps a MonAnimal on the map, they enter Catch Mode. The device's camera opens as the background. Using the **DeviceOrientation API (Gyroscope)**, the MonAnimal physically shifts on the screen as you tilt and move your phone, creating a stunning Augmented Reality tracking effect.

<br/>

### 7. The Micro-Transaction Throw
<div align="center">
  <img src="foto/IMG_8254.jpg" width="300" />
</div>
This is where Monad shines. Players swipe their finger UP to throw a physical Monad Coin at the beast. The speed, velocity, and X/Y drift of the swipe are calculated to create a 3D physics throw. At the exact moment of the throw, a `0.01 MON` transaction is signed and executed instantly.

<br/>

### 8. The Catch Result
<div align="center">
  <img src="foto/IMG_8255.jpg" width="300" />
</div>
The adrenaline rush! Did it escape, or did you catch it?
- **Success:** The MonAnimal is yours. If it's a duplicate, it acts as a "Power-Up" to your existing NFT.
- **Escape:** The monster eats your MON and flees! But don't worry, your catch probability increases by +25% for the next attempt.

<br/>

### 9. Your NFT Pokedex (Collection)
<div align="center">
  <img src="foto/IMG_8257.PNG" width="300" />
</div>
A gorgeous, scrollable grid of your hard-earned assets. Each MonAnimal has unique stats (Base Power, HP, Speed) and falls into a rarity tier (Common, Uncommon, Rare, Legendary). The UI glows based on the rarity of the collected NFT.

<br/>

### 10. Player Profile & Stats
<div align="center">
  <img src="foto/IMG_8258.PNG" width="300" />
</div>
The command center. Players can view their connected Wallet Address, live MON balance, Total Catches, and their overall Trainer Score. This page is designed to make the player feel rewarded for their exploration.

<br/>

### 11. SocialFi & Viral Quests
<div align="center">
  <img src="foto/IMG_8259.PNG" width="300" />
</div>
We built viral marketing directly into the game mechanics. Players can connect their X (Twitter) handles and complete "Social Quests" (like tweeting about their catches with the `@monad_dev` tag) to earn massive bonus scores. This creates an organic, self-sustaining growth loop for the application.

<br/>

### 12. Pitch-Perfect Viral QR Sharing
<div align="center">
  <img src="foto/IMG_8260.jpg" width="300" />
</div>
Built specifically with the Hackathon presentation in mind! When the presenter clicks "Share App" on stage, a massive QR code fills the screen. The audience can scan it with their phones, instantly load the DApp, connect their wallets, and start catching MonAnimals in the auditorium in seconds!

---

## 🛠️ Deep Dive: Architecture & Tech Stack

We refused to compromise on performance. Monad Go is built to be as fast as the blockchain it runs on.

- **Frontend:** React.js powered by Vite for blazing fast performance and HMR.
- **Styling:** Custom CSS modules utilizing a unified Design System (Neon Purple / Cyberpunk aesthetic). We avoided heavy UI libraries to ensure smooth 60fps rendering on mobile devices.
- **State Management:** A custom, highly complex `useGameState` React Hook that handles multi-tenant states. It automatically switches contexts based on the injected `wallet.address`.
- **Web3 Integration:** `ethers.js` connected directly to the Monad RPC.
- **Map Engine:** `react-leaflet` with custom CartoDB Dark Matter tiles.
- **Custom AR Engine:** Instead of heavy WebXR polyfills, we built a lightweight, dependency-free AR engine using native browser APIs (`navigator.mediaDevices`, `DeviceOrientationEvent`) and inline CSS 3D Transforms.

---

## 🚀 How to Run Locally

Want to test the magic yourself?

1. Clone the repository:
```bash
git clone https://github.com/hsankc/MonadGO.git
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

*⚠️ **Important for Local Mobile Testing:** The Camera and Gyroscope APIs require a Secure Context (HTTPS). If testing on your mobile phone via your local network, you must use a tunneling service like [localtunnel](https://localtunnel.me/) or `ngrok`.*

```bash
npx localtunnel --port 5173
```

---
<div align="center">
  <i>Developed with 💜 for the Monad Ecosystem. We are ready to onboard the next billion users.</i>
</div>
