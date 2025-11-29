document.addEventListener('DOMContentLoaded', () => {
    const habitList = document.getElementById('habit-list');
    const habitNameInput = document.getElementById('habit-name');
    const habitIconInput = document.getElementById('habit-icon');
    const saveBtn = document.getElementById('save-habit-btn');

    let habits = JSON.parse(localStorage.getItem('habits')) || [];
    let editingId = null;

    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
        renderHabits();
    }

    function renderHabits() {
        habitList.innerHTML = '';
        habits.forEach((habit, index) => {
            const li = document.createElement('li');
            li.className = 'habit-item';
            li.innerHTML = `
                <div class="habit-info">
                    <span class="habit-icon-display">${habit.icon || '📝'}</span>
                    <span class="habit-name-display">${habit.name}</span>
                </div>
                <div class="habit-actions">
                    <button class="edit-btn" onclick="editHabit(${index})"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete-btn" onclick="deleteHabit(${index})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            habitList.appendChild(li);
        });
    }

    saveBtn.addEventListener('click', () => {
        const name = habitNameInput.value.trim();
        const icon = habitIconInput.value.trim();

        if (!name) {
            alert('Please enter a habit name.');
            return;
        }

        if (editingId !== null) {
            // Update existing
            habits[editingId].name = name;
            habits[editingId].icon = icon;
            editingId = null;
            saveBtn.textContent = 'Add Habit';
        } else {
            // Add new
            habits.push({
                name,
                icon,
                completedDays: [] // Initialize with empty history
            });
        }

        habitNameInput.value = '';
        habitIconInput.value = '';
        saveHabits();
    });

    window.editHabit = (index) => {
        const habit = habits[index];
        habitNameInput.value = habit.name;
        habitIconInput.value = habit.icon || '';
        editingId = index;
        saveBtn.textContent = 'Update Habit';
        habitNameInput.focus();
    };

    window.deleteHabit = (index) => {
        if (confirm(`Are you sure you want to delete "${habits[index].name}"?`)) {
            habits.splice(index, 1);
            saveHabits();
        }
    };

    renderHabits();
});
