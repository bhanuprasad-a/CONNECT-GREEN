# 🌿 CONNECT GREEN
### *Smart Web Platform for Sustainable Tourism*

CONNECT GREEN is a high-performance web ecosystem designed to unify the sustainable tourism landscape. It connects eco-conscious travelers with verified green businesses, monitors natural site capacity through simulated IoT data, and provides verified carbon offsetting solutions.

---

## 🚀 Core Features

- **🗺️ Green Trip Planner**: AI-powered route optimization prioritizing low-carbon transport (EV, Train, Cycle).
- **🛡️ Green Badge Verification**: A rigorous application system for businesses to prove their sustainability.
- **📈 Live Site Monitoring**: Real-time traffic light system for nature reserves to prevent over-tourism.
- **🍃 Carbon Offset Portfolio**: Verified projects ranging from Amazon reforestation to Sahara solar farms.
- **♻️ Smart Recycling Map**: Geo-location services to find local eco-points and recycling centers.

---

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite)**: Ultra-fast UI development.
- **Tailwind CSS**: Utility-first styling with custom premium tokens.
- **Framer Motion**: Smooth, cinematic animations.
- **Recharts**: Data visualization for carbon tracking.
- **Lucide React**: Modern, consistent iconography.

### Backend
- **Node.js & Express**: Scalable API architecture.
- **MongoDB & Mongoose**: Flexible document-based data modeling.
- **Cloudinary**: Cloud-based media management for business assets.
- **JWT**: Secure token-based authentication.

---

## 📦 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or Atlas URI)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/connect-green.git
   cd connect-green
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Update .env with your credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   cp .env.example .env
   # Update .env with your API keys
   npm run dev
   ```
### ☁️ Cloud Database (MongoDB Atlas)

To keep your server running 24/7 with a cloud database:
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2. In **Database Access**, create a user with read/write permissions.
3. In **Network Access**, add IP `0.0.0.0/0` (Allow all) or your server's IP.
4. Replace the `MONGO_URI` in `server/.env` with your Atlas connection string.
   * *Example:* `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/connect_green`
To quickly populate the platform with sample projects and businesses:
- `cd server && node seedOffsets.js`

---

## 🛡️ Admin Access
The platform defines specific permissions for `tourist`, `business`, `siteManager`, and `admin`. 
- By default, the admin role is locked to `ADMIN_EMAIL` defined in the server `.env`.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
