// ====================================
// REPORT GENERATION LOGIC
// ====================================

let reportChart = null;

document.addEventListener('DOMContentLoaded', function() {
    
    // Check authentication
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        generateReport(user);
    });
    
    // Print button
    document.getElementById('printBtn').addEventListener('click', () => {
        window.print();
    });
    
    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
});

// Generate report
async function generateReport(user) {
    try {
        // Set user info
        const userName = user.displayName || 'User';
        const userEmail = user.email;
        
        document.getElementById('reportUserName').textContent = userName;
        document.getElementById('reportUserEmail').textContent = userEmail;
        
        // Set dates
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('reportDate').textContent = dateString;
        document.getElementById('reportGeneratedDate').textContent = now.toLocaleString();
        document.getElementById('footerDate').textContent = dateString;
        
        // Load habits
        const snapshot = await db.collection('users')
            .doc(user.uid)
            .collection('habits')
            .get();
        
        const habits = [];
        snapshot.forEach(doc => {
            habits.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Calculate statistics
        const totalHabits = habits.length;
        const today = new Date().toISOString().split('T')[0];
        const completedToday = habits.filter(h => 
            h.completedDates && h.completedDates.includes(today)
        ).length;
        const completionRate = totalHabits > 0 
            ? Math.round((completedToday / totalHabits) * 100) 
            : 0;
        const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
        
        // Update summary
        document.getElementById('reportTotalHabits').textContent = totalHabits;
        document.getElementById('reportCompletedToday').textContent = completedToday;
        document.getElementById('reportCompletionRate').textContent = completionRate + '%';
        document.getElementById('reportTotalStreak').textContent = totalStreak;
        
        // Generate habits table
        generateHabitsTable(habits);
        
        // Generate chart
        generateReportChart(habits);
        
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Failed to generate report. Please try again.');
    }
}

// Generate habits table
function generateHabitsTable(habits) {
    const tbody = document.getElementById('reportHabitsTable');
    
    if (habits.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No habits found</td></tr>';
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    tbody.innerHTML = habits.map(habit => {
        const isCompleted = habit.completedDates && habit.completedDates.includes(today);
        const lastCompleted = habit.completedDates && habit.completedDates.length > 0
            ? new Date(habit.completedDates[habit.completedDates.length - 1]).toLocaleDateString()
            : 'Never';
        
        return `
            <tr>
                <td>${habit.name}</td>
                <td style="text-align: center;">${isCompleted ? '✓ Completed' : '○ Pending'}</td>
                <td style="text-align: center;">${habit.streak || 0} days</td>
                <td style="text-align: center;">${lastCompleted}</td>
            </tr>
        `;
    }).join('');
}

// Generate report chart
function generateReportChart(habits) {
    const ctx = document.getElementById('reportChart');
    
    if (!ctx) return;
    
    // Calculate last 7 days data
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        const completedCount = habits.filter(habit => 
            habit.completedDates && habit.completedDates.includes(dateString)
        ).length;
        
        const percentage = habits.length > 0 
            ? Math.round((completedCount / habits.length) * 100) 
            : 0;
        
        data.push(percentage);
    }
    
    reportChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion %',
                data: data,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 14,
                            weight: 600
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}