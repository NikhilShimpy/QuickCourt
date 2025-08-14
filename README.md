# QuickCourt – A Local Sports Booking Platform

## 🌐 Live Demo
**[Click here to visit QuickCourt Live](https://youtu.be/K-pFGVxv3sg?si=KXVWtNit0Tv-giqf)** 

## 📌 Problem Statement
QuickCourt is a platform that enables sports enthusiasts to **book local sports facilities** (badminton courts, turf grounds, tennis tables, etc.) and create/join matches with others in their area.  
The goal is to build a **full-stack web application** providing a smooth booking experience, accurate availability, and community engagement.

---

## 👥 Contributors

- **Nikhil Shimpy** – [@NikhilShimpy](https://github.com/NikhilShimpy)  
- **Harsh Vardhan** – [@Harsh147v](https://github.com/Harsh147v)
- **Palak Paithari** – [@palakpaithari](https://github.com/palakpaithari)
- **Chetna Sikarwar** – [@chetnasingh31](https://github.com/chetnasingh31)
  
---

## 🛠 Tech Stack
- **Frontend:** HTML, CSS, Bootstrap, JavaScript  
- **Backend:** Python (Flask API)  
- **Database:** Firestore / Relational DB (as per implementation)  
- **Other:** Charts.js / D3.js for analytics visualizations  

---

## 👥 Roles & Functionalities

### 1. **User**
- **Authentication**
  - Sign up with email, password, full name, avatar, and role
  - OTP verification after signup
  - Login with email & password
- **Home Page**
  - Welcome banner/carousel
  - Quick links to popular venues & sports
  - Filters: sport type, price, venue type, rating
  - Pagination for venue listing
- **Venues Page**
  - Venue details: name, description, location, available sports, amenities, gallery, reviews
  - “Book Now” action
- **Court Booking**
  - Select court & time slot
  - View price & total
  - Confirm & simulate payment
- **My Bookings**
  - List bookings with venue name, sport type, court, date/time, status
  - Cancel future bookings
- **Profile**
  - View/update personal details

---

### 2. **Facility Owner**
- **Dashboard**
  - KPIs: total bookings, active courts, earnings, booking trends
  - Charts: daily/weekly/monthly bookings, peak hours
- **Facility Management**
  - Add/Edit facility (name, location, description, sports supported, amenities, photos)
- **Court Management**
  - Add/Edit/Delete courts (court name, sport type, pricing/hour, operating hours)
- **Time Slot Management**
  - Set availability for each court
  - Block slots for maintenance
- **Booking Overview**
  - View all bookings with user info & status

---

### 3. **Admin**
- **Dashboard**
  - Global stats: total users, facility owners, bookings, active courts
  - Charts: booking trends, user registrations, facility approvals, earnings
- **Facility Approval**
  - View pending registrations
  - Approve/Reject with comments
- **User Management**
  - Search/filter users
  - Ban/Unban users
  - View booking history
- **Reports & Moderation (Optional)**
  - Handle flagged facilities/users
- **Profile**
  - Edit admin details

---

## ✨ Features Summary
- **Role-based Access** (User, Facility Owner, Admin)
- **OTP-based Signup Verification**
- **Venue Search & Filtering**
- **Real-time Availability & Booking**
- **Interactive Booking Calendar**
- **Analytics Dashboards with Charts**
- **Facility Approval Workflow**
- **Review & Rating System**
- **Profile Management**
- **Simulated Payments**

---

## 📊 Example Pages & Components
- **Home Page** – Popular venues, filters, search bar
- **Single Venue Page** – Details, gallery, reviews, book button
- **Booking Page** – Court/time selection, price calc
- **My Bookings** – Booking history with cancel option
- **Owner Dashboard** – KPIs, charts, booking management
- **Admin Dashboard** – Global stats, facility approvals, user management

---

## 🚀 Setup & Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/quickcourt.git
cd quickcourt

# Install backend dependencies
pip install -r requirements.txt

# Run Flask API
python app.py


