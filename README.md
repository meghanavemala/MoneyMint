# 💸 MoneyMint – Finance Tracking App for Moneylenders

MoneyMint is a modern and user-friendly finance tracking web application designed specifically for moneylenders to track customer loans, payments, balances, and daily collections. Inspired by apps like Khata Book, it provides a powerful yet simple way to manage financial transactions, all stored securely using **Supabase** and accessible via **desktop** and **mobile** devices.

---

## 🚀 Features

### 📊 Dashboard
- View **all customers** and their:
  - Total money borrowed
  - Total paid to date
  - Remaining balance
- Click a customer to view full **transaction history**:
  - All payment dates and times
  - Initial loan date
  - Personal details (Name, Address, Phone)
- **Download transaction history as PDF** for the full period or selected month

### ➕ Add Entry
- Add **new customer** details:
  - Name, Phone, Address, Loan Amount, etc.
- Search for existing customers and:
  - Add daily payments (amount only)
  - Auto-update the balance
  - Set/change payment date
- Entries are **stored and updated in real-time** in Supabase

### 📅 Daily Collection
- View all transactions for a **selected day** via calendar
- Visually separate:
  - **Credit (Green)** and **Debit (Red)**
- Helps monitor day-to-day cash flow

### 🎨 UI and Extras
- Fully **responsive** for both desktop and mobile
- **Dark / Light theme toggle**
- Smooth **sign-in via Clerk**
- **Landing page** with clean branding

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| **React** | Frontend Framework |
| **Supabase** | Backend-as-a-Service (Database + Auth + Storage) |
| **Clerk** | User authentication |
| **TailwindCSS** | Styling |
| **React Router** | Page Navigation |
| **React-PDF / jsPDF** | PDF download functionality |
| **Day.js** or **Date-fns** | Date & time formatting |
| **Vercel** | Deployment Platform |

---

## 📁 Project Structure

```

money-mint/
│
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── AddEntry.jsx
│   │   ├── DailyCollection.jsx
│   ├── services/
│   │   └── supabaseClient.js
│   ├── utils/
│   │   └── pdfGenerator.js
│   └── App.jsx
├── public/
├── .env
└── README.md

````

---

## 📦 Database Schema (Supabase)

- **customers**
  - `id`, `name`, `phone`, `address`, `loan_amount`, `loan_date`, `created_at`

- **transactions**
  - `id`, `customer_id`, `amount`, `type` (credit/debit), `date`, `created_at`

- **users**
  - Managed via **Clerk**, integrated with Supabase via JWT

---

## 📲 How to Run Locally

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/your-username/moneymint.git
   cd moneymint
````

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file with:

   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SIGN_IN_URL=https://your-app.clerk.accounts.dev/sign-in
   CLERK_SIGN_UP_URL=https://your-app.clerk.accounts.dev/sign-up
   ```

4. **Run the App**

   ```bash
   npm run dev
   ```

5. **Visit**
   Open `http://localhost:3000` in your browser

---

## ✅ Compatibility

MoneyMint is:

* ✅ Fully **responsive** – optimized for **desktop** and **mobile**
* 🌓 Supports both **Dark** and **Light** mode
* 🔐 Auth-secured via **Clerk**

---

## 🧱 Planned Enhancements

* 🔔 Push notifications for due payments
* 📈 Analytics dashboard
* 🗃️ Export CSV reports
* 🌍 Multilingual support (starting with Kannada/Hindi)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---


> Built with ❤️ for Indian moneylenders and small businesses.
> From paper *bahi-khatas* to the digital future — *MoneyMint* is here to help you grow!

```
