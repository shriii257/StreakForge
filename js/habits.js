// ====================================
// HABIT MANAGEMENT LOGIC
// ====================================

let currentUser = null;
let habits = [];

// Initialize habits management
function initHabits(user) {
    currentUser = user;
    loadHabits();
}

// Load habits from Firestore
async function loadHabits() {
    try {
        const snapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('habits')
            .orderBy('createdAt', 'desc')
            .get();
        
        habits = [];
        snapshot.forEach(doc => {
            habits.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        renderHabits();
        updateStats();
        
    } catch (error) {
        console.error('Error loading habits:', error);
    }
}

// Render habits to the UI
function renderHabits() {
    const habitsList = document.getElementById('habitsList');
    const emptyState = document.getElementById('emptyState');
    
    if (habits.length === 0) {
        habitsList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    habitsList.innerHTML = habits.map(habit => {
        const isCompletedToday = checkIfCompletedToday(habit);
        
        return `
            <div class="habit-item" data-id="${habit.id}">
                <input 
                    type="checkbox" 
                    ${isCompletedToday ? 'checked' : ''}
                    onchange="toggleHabit('${habit.id}')"
                >
                <div class="habit-info">
                    <div class="habit-name ${isCompletedToday ? 'completed' : ''}">
                        ${habit.name}
                    </div>
                    <div class="habit-streak">
                        🔥 ${habit.streak || 0} day streak
                    </div>
                </div>
                <div class="habit-actions">
                    <button onclick="deleteHabit('${habit.id}')" title="Delete habit">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Check if habit was completed today
function checkIfCompletedToday(habit) {
    if (!habit.completedDates || habit.completedDates.length === 0) {
        return false;
    }
    
    const today = new Date().toISOString().split('T')[0];
    return habit.completedDates.includes(today);
}

// Toggle habit completion
async function toggleHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = checkIfCompletedToday(habit);
    
    try {
        let updatedCompletedDates = habit.completedDates || [];
        let updatedStreak = habit.streak || 0;
        
        if (isCompletedToday) {
            // Uncomplete: remove today's date
            updatedCompletedDates = updatedCompletedDates.filter(date => date !== today);
            updatedStreak = Math.max(0, updatedStreak - 1);
        } else {
            // Complete: add today's date
            updatedCompletedDates.push(today);
            updatedStreak = calculateStreak([...updatedCompletedDates, today]);
        }
        
        // Update in Firestore
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('habits')
            .doc(habitId)
            .update({
                completedDates: updatedCompletedDates,
                streak: updatedStreak,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        // Reload habits
        await loadHabits();
        
    } catch (error) {
        console.error('Error toggling habit:', error);
        alert('Failed to update habit. Please try again.');
    }
}

// Calculate streak
function calculateStreak(completedDates) {
    if (!completedDates || completedDates.length === 0) return 0;
    
    // Sort dates in descending order
    const sortedDates = completedDates.sort().reverse();
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        
        // Check if this date matches the expected consecutive date
        if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// Add new habit
async function addHabit(habitName) {
    if (!habitName || habitName.trim() === '') {
        alert('Please enter a habit name');
        return;
    }
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('habits')
            .add({
                name: habitName.trim(),
                completedDates: [],
                streak: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        // Reload habits
        await loadHabits();
        
    } catch (error) {
        console.error('Error adding habit:', error);
        alert('Failed to add habit. Please try again.');
    }
}

// Delete habit
async function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) {
        return;
    }
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('habits')
            .doc(habitId)
            .delete();
        
        // Reload habits
        await loadHabits();
        
    } catch (error) {
        console.error('Error deleting habit:', error);
        alert('Failed to delete habit. Please try again.');
    }
}

// Update statistics
function updateStats() {
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => checkIfCompletedToday(h)).length;
    const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
    
    document.getElementById('progressPercent').textContent = `${completionPercentage}%`;
    document.getElementById('completedCount').textContent = `${completedToday}/${totalHabits}`;
    document.getElementById('totalStreak').textContent = totalStreak;
    document.getElementById('activeHabits').textContent = totalHabits;
}

// Export functions to global scope
window.initHabits = initHabits;
window.toggleHabit = toggleHabit;
window.addHabit = addHabit;
window.deleteHabit = deleteHabit;