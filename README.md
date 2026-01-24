This is a fantastic project\! Based on the files you provided, here is a comprehensive GitHub description (README) and the file structure for your **StreakForge** repository.



## 1\. GitHub Repository Description (README Content)

### StreakForge: Build Habits Better, One Day at a Time

**StreakForge** is a modern, single-page web application designed to help users establish and maintain long-lasting habits. Built with plain HTML, CSS, and JavaScript, it uses **Firebase** for fast, reliable backend services, focusing on consistency, visualization, and momentum.

This project is specifically built to track habits and be consistent. By focusing on your daily streaks, StreakForge helps you build momentum and achieve your long-term goals.

### ✨ Key Features

  * **Robust Streak Tracking:** Automatically calculates and displays your current consecutive streak for every habit.
  * **Firebase Authentication:** Secure and easy user registration and login using Firebase Auth.
  * **Daily Habit Management:** Add, delete, and toggle habits completed for the day. Tracks completion dates for accurate streak calculation.
  * **Visual Analytics:** Dashboard displays key statistics (Today's Progress, Total Streak) and a weekly completion percentage chart powered by Chart.js.
  * **Printable Reports:** Generate a professional, printable progress report summarizing all habits and weekly performance.
  * **Dark Mode Toggle:** User-friendly design with an accessible dark mode option.

### 💻 Technologies Used

  * **Front-end:** HTML5, CSS3, JavaScript (Vanilla JS)
  * **Database & Backend:** Google Firebase (Authentication and Firestore)
  * **Charting:** Chart.js

-----

## 2\. File Arrangement

```
StreakForge/
├── css/
│   ├── print.css     # Styles specific for printing the report
│   └── style.css     # Global and component-level CSS styling
├── js/
│   ├── auth.js       # Authentication (Login/Signup) logic
│   ├── dashboard.js  # Dashboard UI and Chart.js integration logic
│   ├── firebase.js   # Firebase configuration and initialization
│   ├── habits.js     # Core logic for loading, adding, toggling, and calculating streaks for habits
│   └── report.js     # Logic for generating and rendering the progress report
├── dashboard.html    # The main user dashboard page
├── index.html        # The public landing page
├── login.html        # The combined login and sign-up page
└── report.html       # The printable progress report page
```
