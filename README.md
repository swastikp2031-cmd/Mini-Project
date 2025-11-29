# 🍜 FreshCanteen Management System (React + Gemini API)

A fully responsive, single-file React application simulating a canteen ordering & management system — with separate views for **customers** and **administrators**.  
It also integrates the **Gemini API** to intelligently suggest new "Chef’s Specials" for the menu.

---

## ✨ Features

### 🧑‍🍽 Customer Ordering Interface
- Browse complete menu with item details + images  
- Filter by category (Lunch, Snacks, Beverages, etc.)
- 🔍 Search items instantly
- 🛒 Add to Cart / remove / adjust quantity
- ✔️ Checkout simulation with success alert

### 🧑‍💼 Admin Dashboard (Manager Role)
- 📊 Analytics stats (Revenue / Orders / Menu Count — mock values)
- ➕ Add menu items (Name, Price, Category, Image URL)
- ❌ Delete menu items
- 📦 Track recent orders in a table

### 🤖 Gemini LLM Integration — *Chef’s Special Generator*
The app integrates the Gemini API for intelligent menu generation:
- Uses structured JSON output (specialName, description, tagline)
- AI analyzes current Indian-style menu to generate matching cuisine-style dishes
- Suggested dish can **auto-fill** admin "Add Menu Item" form

---

## 💻 Tech Stack

| Category | Technology |
|---------|------------|
| Frontend | React (Hooks + Functional Components) |
| Styling | Tailwind CSS (utility classes) |
| API | Gemini — `gemini-2.5-flash-preview-09-2025` |
| Dependencies | No extra npm libs (uses `fetch`) |
| Icons | Lucide React |

---

## 🚀 How to Run

This project is contained in a **single React file** (`CanteenApp.jsx`).

1️⃣ Ensure a React environment is set up (Vite / CRA / CodeSandbox etc.)  
2️⃣ Replace your main component file with `CanteenApp.jsx`  
3️⃣ Run the project normally — state, menu & orders are handled internally.

---

## 🔑 Login Credentials

| Role | Username | Password | Redirects To | Permissions |
|------|----------|----------|--------------|-------------|
| Admin (Manager) | `admin` | `admin` | Admin Dashboard | Full Menu CRUD, Orders, AI Generator |
| Customer (User) | Anything else | Anything else | Menu | Browse, Cart, Checkout |

➡️ Quick login buttons are also available on the sign-in screen.

---

## ⚙️ AI Integration — Genie Behind the Scenes

The **ChefSpecialGenerator** module:
- Calls Gemini model: `gemini-2.5-flash-preview-09-2025`
- Requests structured JSON response
- Handles retries using **exponential backoff** (self-recovering for rate limits)
- Result auto-suggests a *chef’s special* with:
  ```json
  {
    "specialName": "",
    "description": "",
    "tagline": ""
  }
