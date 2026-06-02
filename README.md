# OrbitravelAI ✈️🤖

OrbitravelAI is a modern, AI-powered travel itinerary generator built on the **MERN** stack. It allows users to upload their travel booking documents (such as flight tickets and hotel reservations) and automatically extracts the data to generate a beautifully structured, day-by-day travel plan. 


## 🌟 Features

- **JWT Authentication:** Secure user registration and login functionality with protected routes.
- **Drag-and-Drop File Upload:** Intuitive UI for uploading PDFs and images (supports AWS S3 integration).
- **AI-Powered Data Extraction:** Integrates with Google's Gemini API to intelligently parse booking documents and structure the data.
- **Itinerary Management:** Saves generated trips to MongoDB, allowing users to view and manage their past travel plans on a dashboard.
- **Public Sharing:** Generates secure, read-only public links for itineraries with 1-click sharing to WhatsApp and Twitter/X.
- **Premium UI/UX:** A highly responsive, "glassmorphism" design built with Tailwind CSS, featuring full Light/Dark mode support and fluid micro-animations.

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** (for responsive styling and Light/Dark semantic theming)
- **React Router** (for navigation)
- **Lucide React** (for iconography)
- **Axios** (for API communication)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Database and ODM)
- **AWS SDK (S3)** (For secure file storage and presigned URLs)
- **Google Generative AI (Gemini)** (For intelligent data extraction and itinerary generation)
- **JWT & bcryptjs** (For secure authentication)
- **Multer** (For handling multipart/form-data uploads)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local or Atlas)
- AWS Account (for S3 bucket)
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/barikbibek/orbitra-travel-ai.git
   cd orbitra-travel-ai
   ```

2. **Setup the Backend:**
   ```bash
   cd server
   npm install
   
   Run the backend:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   Run the frontend:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 💡 Architecture & Data Flow
1. User uploads a PDF or image of their booking via the React frontend.
2. The Node/Express backend receives the file via Multer and uploads it securely to AWS S3.
3. The backend sends the file text (parsed via `pdf-parse`) or S3 URL to the Gemini AI API with a carefully crafted prompt.
4. The AI returns a structured JSON itinerary, which is saved to MongoDB.
5. The frontend fetches this data and renders it in a beautiful, shareable glassmorphism UI.

---

