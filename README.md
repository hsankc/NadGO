<div align="center">
  <img src="public/logo.png" alt="Monad Go Logo" width="150" />
  <h1>🎮 Monad Go</h1>
  <p><b>Gotta Catch 'em All on Monad! A location-based Web3 monster-catching AR game.</b></p>
  <p>Built for the <b>Ankara Hackathon</b> ⚡</p>
</div>

---

## 🌟 About The Project

**Monad Go** is a next-generation, location-based Web3 game inspired by Pokémon GO. Players explore the real world to find legendary **MonAnimals**, catch them using augmented reality (AR) and physical device movements, and build their ultimate NFT collection on the lightning-fast **Monad** blockchain.

We bring the real world and Web3 together by utilizing mobile sensors (GPS, Camera, Gyroscope) and seamless wallet integrations.

---

## 📱 User Flow & Features (Screen by Screen)

### 1. Onboarding & Wallet Connection 🔐
When a user opens Monad Go, they are greeted with a sleek onboarding flow. 
- **Mandatory Wallet Connection:** Players must connect their Web3 wallet to start. This ensures every user has a unique, isolated account.
- **Data Isolation:** All local storage data is prefix-isolated using the wallet address, meaning multiple users can play on the same device without mixing up their collections!
- *Image Reference: `![Onboarding & Wallet](./foto/IMG_8247.PNG)` (Replace with your onboarding screenshot)*

### 2. Permissions Screen 📸📍
To provide a true AR experience, Monad Go requires real-world sensors.
- **Camera Access:** Used for the AR catching background.
- **Location (GPS):** Used to place the player accurately on the world map.
- **Gyroscope:** Used to map the physical tilt of the phone to the virtual AR world.
- *Image Reference: `![Permissions](./foto/IMG_8248.PNG)`*

### 3. The Map Screen 🗺️
The core exploration hub.
- Powered by `Leaflet.js`, the map tracks your real-time GPS location.
- **MonAnimals** spawn randomly around your physical location in a 2km radius.
- Players tap on a nearby MonAnimal to initiate the Catch Phase.
- *Image Reference: `![Map Screen](./foto/IMG_8249.PNG)`*

### 4. Catching Phase (AR & Physics) 🎯
This is where the magic happens!
- **AR Background:** Your device's camera stream is used as the background.
- **Gyroscope Targeting:** The MonAnimal moves on the screen based on how you tilt and move your phone physically (using `DeviceOrientationEvent`).
- **Throwing Mechanics:** Players swipe up to throw a physical Monad Coin. The throw speed and angle affect the trajectory with 3D CSS transforms!
- **Micro-Transactions:** Every throw sends a micro-transaction of `0.01 MON` to the Treasury. Powered by Monad's fast block times, this feels instant!
- *Image Reference: `![Catching AR Phase](./foto/IMG_8250.PNG)`*

### 5. Catch Result ✨
Did you catch it or did it escape?
- If the catch is successful, the MonAnimal is minted into your Collection as a new NFT!
- If you already own it, you get a **Power-Up** (+5 to +15 Power) and Catch Count increases.
- If it escapes, your catch chance increases by +25% for the next try.
- *Image Reference: `![Catch Result](./foto/IMG_8251.PNG)`*

### 6. Collection (Pokedex) 🎒
View all your caught MonAnimals in the Collection tab.
- Displays Rarity, Base Power, HP, and Speed.
- **Rarities:** Legendary, Rare, Uncommon, Common.
- Smooth glass-morphism UI with rarity-based neon glows.
- *Image Reference: `![Collection](./foto/IMG_8252.jpg)`*

### 7. Profile & Social Quests 🏅
Players can track their stats and earn extra scores.
- **Stats:** Total Catches, Total Score, Wallet Balance.
- **Social Quests:** 
  - Connect X (Twitter) for +20 Score.
  - Share the app on X for +20 Score.
- *Image Reference: `![Profile & Quests](./foto/IMG_8254.jpg)`*

### 8. Viral QR Code Sharing 📲
Built for the Hackathon Pitch!
- In the Profile screen, tapping "Share App" opens a giant QR code modal.
- The presenter can display this on the big screen, and the audience can scan it to instantly open the game and connect their wallets!
- *Image Reference: `![QR Code Share](./foto/IMG_8255.jpg)`*

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, CSS Modules (Custom Neon Design System)
- **Web3:** ethers.js, MetaMask SDK
- **Map & Geospatial:** Leaflet.js
- **AR & Sensors:** HTML5 Geolocation API, MediaDevices API (Camera), DeviceOrientation API (Gyroscope)
- **Deployment:** Vercel

## 🚀 How to Run Locally

1. Clone the repository:
```bash
git clone https://github.com/hsankc/NadGO.git
```
2. Install dependencies:
```bash
npm install
```
3. Run the development server:
```bash
npm run dev
```

*Note: For the Camera and Gyroscope to work locally on a mobile device, you must serve the app over HTTPS or use a tunneling service like LocalTunnel/Ngrok.*

---
*Developed with 💜 for the Monad Ecosystem.*
