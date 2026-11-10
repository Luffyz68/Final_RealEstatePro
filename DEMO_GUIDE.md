# RealEstatePro - Demo & Architecture Guide

This guide is designed to help you easily explain how the RealEstatePro system works during your project demo. It covers the core technologies, the database structure, and the main workflows you should show off.

---

## 1. Overall System Architecture
The project follows a modern **Client-Server Architecture**:

*   **Frontend (Client):** Built with **Vue.js 3**. We use modern Composition API (`<script setup>`) for clean, maintainable components.
*   **Backend (Server):** Built with **Node.js & Express.js**. It exposes a RESTful API that the frontend communicates with via Axios.
*   **Database:** Powered by **SQLite**, providing a lightweight, file-based relational database that is perfect for this scale.

### How they communicate:
When a user does something on the frontend (like clicking "Login"), the frontend sends an HTTP request using Axios to the Node.js backend. The backend processes the request, interacts with the SQLite database, and sends JSON data back to the frontend to update the UI.

---

## 2. Security & Authentication (JWT)
Security is a major focus of this platform:

*   **JSON Web Tokens (JWT):** When a user logs in, the backend generates a secure JWT token. The frontend stores this token in `localStorage`.
*   **Interceptors:** In `frontend/src/services/api.js`, an Axios *Request Interceptor* automatically attaches this token to the header of every outgoing request. If a token expires, a *Response Interceptor* automatically catches the 401 Unauthorized error and logs the user out.
*   **Role-Based Access Control (RBAC):** There are 3 strict roles: `customer`, `agent`, and `admin`. Both the Vue Router (frontend) and Express Middleware (backend) block unauthorized users from accessing pages or data they shouldn't see.

---

## 3. State Management (Pinia)
We use **Pinia** (Vue's official state management tool) to manage global data across the app without having to pass props down multiple levels:

*   `authStore.js`: Keeps track of who is logged in and what their role is.
*   `favoriteStore.js`: Stores the customer's favorited properties so the "heart" icons stay synced across the entire app.
*   `uiStore.js`: Controls global UI elements like toast notifications, confirmation modals, and the global loading spinner.

---

## 4. Key Workflows to Demo

During your presentation, you should walk through the system using the three different roles. Here is the best order to demo the features:

### Step 1: The Public & Customer View
1.  **Home & Properties:** Show the modern, glassmorphic UI with the yellow background shapes on the public properties page.
2.  **Register/Login:** Create a new customer account.
3.  **Favorites:** Show how clicking the heart icon on a property instantly saves it to their favorites (managed by `favoriteStore`).
4.  **Become an Agent:** Go to the Customer Profile page and click the "Become an Agent" button. Explain that this sends an `agent_request` to the database, which is now pending admin approval.

### Step 2: The Admin Control Center
1.  **Admin Login:** Log out and log in as the System Admin.
2.  **The SaaS Dashboard:** Show off the clean, professional Admin Dashboard (with the dark sidebar and white cards).
3.  **Agent Approvals:** Show the "Pending Agent Requests" table. Click **Approve** on the request the customer just made. The backend instantly upgrades their role in the database from `customer` to `agent`.
4.  **User Management:** Go to "Users & Agents" to show how the admin can search for users and easily toggle their accounts to "active" or "inactive".

### Step 3: The Agent Workspace
1.  **Agent Login:** Log out and log back in as the newly approved Agent.
2.  **Add a Property:** Go to the Agent Dashboard and add a new property. Show that agents can flexibly choose between **Uploading an Image File** or **Pasting an Image URL**.
3.  **Property Approval System:** Show that the newly created property has an "Approval Status" of **Pending**. Explain that to maintain quality, agents cannot publish properties directly to the public site—they must be approved by an admin first.

### Step 4: The Final Admin Approval
1.  Log back in as the Admin.
2.  Go to the Dashboard and look at the "Pending Properties" table.
3.  Click **Approve** on the agent's new property.
4.  Go to the public "Browse Properties" page to prove that the property is now live and visible to the public.

---

## 5. Database Schema Highlights
If they ask about the database, highlight these specific tables and relationships:

*   `users`: Stores credentials (passwords are hashed securely) and role (`admin`, `agent`, `customer`).
*   `properties`: Linked to the `users` table via `agent_id`. It has an `approval_status` column (`pending`, `approved`, `rejected`) that dictates whether it shows up on the public API.
*   `agent_requests`: A dedicated table linking a `user_id` to a request status, allowing admins to track who wants to become an agent.
*   `favorites`: A junction table linking `user_id` and `property_id` for quick querying.
