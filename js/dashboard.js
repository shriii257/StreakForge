// ====================================
// DASHBOARD LOGIC
// ====================================

let weeklyChart = null;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if user is authenticated
    auth.onAuthStateChanged(user => {
        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }
        
        // Initialize dashboard
        initDashboard(user);
    });
    
    // Add Habit button
    document.getElementById('addHabitBtn').addEventListener('click', () => {
        document.getElementById('addHabitForm').classList.remove('hidden');
        document.getElementById('newHabitName').focus();
    });
    
    // Cancel button
    document.getElementById('cancelHabitBtn').addEventListener('click', () => {
        document.getElementById('addHabitForm').classList.add('hidden');
        document.getElementById('newHabitName').value = '';
    });
    
    // Save habit button
    document.getElementById('saveHabitBtn').addEventListener('click', async () => {
        const habitName = document.getElementById('newHabitName').value;
        
        if (habitName.trim()) {
            await addHabit(habitName);
            document.getElementById('addHabitForm').classList.add('hidden');
            document.getElementById('newHabitName').value = '';
        }
    });
    
    // Enter key to save habit
    document.getElementById('newHabitName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('saveHabitBtn').click();
        }
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await auth.signOut();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
    });
    
    // Generate Report button
    document.getElementById('reportBtn').addEventListener('click', () => {
        window.location.href = 'report.html';
    });
});

// Initialize dashboard
async function initDashboard(user) {
    // Set user info
    const displayName = user.displayName || user.email.split('@')[0];
    document.getElementById('userName').textContent = displayName;
    document.getElementById('userAvatar').textContent = displayName.charAt(0).toUpperCase();
    
    // Initialize habits
    initHabits(user);
    
    // Initialize chart
    initChart();
    
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').textContent = '☀️';
    }
}

// Toggle dark mode
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
    
    // Update chart colors
    if (weeklyChart) {
        updateChartTheme();
    }
}

// Initialize chart
function initChart() {
    const ctx = document.getElementById('weeklyChart');
    
    if (!ctx) return;
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    weeklyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: getLast7Days(),
            datasets: [{
                label: 'Daily Completion %',
                data: [0, 0, 0, 0, 0, 0, 0],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: isDarkMode ? '#f9fafb' : '#111827',
                        font: {
                            size: 14,
                            weight: 600
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Weekly Progress',
                    color: isDarkMode ? '#f9fafb' : '#111827',
                    font: {
                        size: 16,
                        weight: 700
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: isDarkMode ? '#d1d5db' : '#6b7280',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: isDarkMode ? '#374151' : '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: isDarkMode ? '#d1d5db' : '#6b7280'
                    },
                    grid: {
                        color: isDarkMode ? '#374151' : '#e5e7eb'
                    }
                }
            }
        }
    });
    
    // Update chart with real data
    updateChartData();
}

// Get last 7 days labels
function getLast7Days() {
    const days = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(daysOfWeek[date.getDay()]);
    }
    
    return days;
}

// Update chart with real data
async function updateChartData() {
    if (!weeklyChart || !currentUser) return;
    
    try {
        const snapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('habits')
            .get();
        
        const allHabits = [];
        snapshot.forEach(doc => {
            allHabits.push(doc.data());
        });
        
        const weekData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const completedCount = allHabits.filter(habit => 
                habit.completedDates && habit.completedDates.includes(dateString)
            ).length;
            
            const percentage = allHabits.length > 0 
                ? Math.round((completedCount / allHabits.length) * 100) 
                : 0;
            
            weekData.push(percentage);
        }
        
        weeklyChart.data.datasets[0].data = weekData;
        weeklyChart.update();
        
    } catch (error) {
        console.error('Error updating chart:', error);
    }
}

// Update chart theme
function updateChartTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    weeklyChart.options.plugins.legend.labels.color = isDarkMode ? '#f9fafb' : '#111827';
    weeklyChart.options.plugins.title.color = isDarkMode ? '#f9fafb' : '#111827';
    weeklyChart.options.scales.y.ticks.color = isDarkMode ? '#d1d5db' : '#6b7280';
    weeklyChart.options.scales.x.ticks.color = isDarkMode ? '#d1d5db' : '#6b7280';
    weeklyChart.options.scales.y.grid.color = isDarkMode ? '#374151' : '#e5e7eb';
    weeklyChart.options.scales.x.grid.color = isDarkMode ? '#374151' : '#e5e7eb';
    
    weeklyChart.update();
}

// Export for use in habits.js
window.updateChartData = updateChartData;