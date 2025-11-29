document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const monthTitle = document.getElementById('month-title');
    const headerRow = document.getElementById('header-row');
    const trackerBody = document.getElementById('tracker-body');
    const analysisBody = document.getElementById('analysis-body');
    const newHabitInput = document.getElementById('new-habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const totalHabitsEl = document.getElementById('total-habits');
    const totalCompletedEl = document.getElementById('total-completed');
    const globalProgressEl = document.getElementById('global-progress');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    // State
    let currentDate = new Date();

    // Default Habits Data Structure
    let habits = JSON.parse(localStorage.getItem('habits')) || [
        { id: 1, name: "Wake up at 05:00", icon: "⏰", completedDays: [] },
        { id: 2, name: "Gym", icon: "💪", completedDays: [] },
        { id: 3, name: "Reading / Learning", icon: "📖", completedDays: [] },
        { id: 4, name: "Day Planning", icon: "🗓️", completedDays: [] }
    ];

    // Migration: Convert old integer days to date strings if needed
    function migrateData() {
        let migrated = false;
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');

        habits.forEach(habit => {
            if (habit.completedDays.length > 0 && typeof habit.completedDays[0] === 'number') {
                habit.completedDays = habit.completedDays.map(day => {
                    return `${year}-${month}-${String(day).padStart(2, '0')}`;
                });
                migrated = true;
            }
        });

        if (migrated) {
            saveHabits();
        }
    }

    // Initialize
    function init() {
        migrateData();
        renderAll();
    }

    function renderAll() {
        renderHeader();
        renderGrid();
        updateStats();
        renderGraph();
        renderFooter();
    }

    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
        updateStats();
        renderGraph();
        renderFooter();
    }

    // Change Month
    function changeMonth(delta) {
        currentDate.setMonth(currentDate.getMonth() + delta);
        renderAll();
    }

    // Helper to get YYYY-MM-DD
    function getDateString(day) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${month}-${d}`;
    }

    // Render Days Header
    function renderHeader() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        monthTitle.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        // Clear existing day headers (keep first "My Habits" th)
        while (headerRow.children.length > 1) {
            headerRow.removeChild(headerRow.lastChild);
        }

        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const dayName = days[date.getDay()];

            const th = document.createElement('th');
            th.className = 'day-header';
            th.innerHTML = `${dayName}<span class="day-sub">${i}</span>`;
            headerRow.appendChild(th);
        }
    }

    // Render Main Grid
    function renderGrid() {
        trackerBody.innerHTML = '';
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        habits.forEach(habit => {
            const tr = document.createElement('tr');

            // Habit Name Cell
            const nameTd = document.createElement('td');
            nameTd.className = 'habit-name-cell';
            nameTd.innerHTML = `
                <span class="habit-icon">${habit.icon}</span>
                <span>${escapeHtml(habit.name)}</span>
            `;
            tr.appendChild(nameTd);

            // Days Cells
            for (let i = 1; i <= daysInMonth; i++) {
                const dateStr = getDateString(i);
                const isCompleted = habit.completedDays.includes(dateStr);

                const td = document.createElement('td');
                td.className = `check-cell ${isCompleted ? 'completed' : ''}`;
                td.onclick = () => toggleHabit(habit.id, dateStr, td);

                const div = document.createElement('div');
                div.className = 'check-box';
                td.appendChild(div);

                tr.appendChild(td);
            }

            trackerBody.appendChild(tr);
        });
    }

    // Toggle Habit Completion
    window.toggleHabit = function (habitId, dateStr, cellElement) {
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
            const index = habit.completedDays.indexOf(dateStr);
            if (index === -1) {
                habit.completedDays.push(dateStr);
                cellElement.classList.add('completed');
            } else {
                habit.completedDays.splice(index, 1);
                cellElement.classList.remove('completed');
            }
            saveHabits();
        }
    };

    // Render Footer with Daily Stats
    function renderFooter() {
        const footer = document.getElementById('tracker-footer');
        if (!footer) return;
        footer.innerHTML = '';

        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const rows = {
            progress: { label: 'Progress', data: [] },
            done: { label: 'Done', data: [] },
            notDone: { label: 'Not Done', data: [] }
        };

        // Calculate stats per day
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = getDateString(i);
            let doneCount = 0;
            habits.forEach(h => {
                if (h.completedDays.includes(dateStr)) doneCount++;
            });

            const total = habits.length;
            const notDoneCount = total - doneCount;
            const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);

            rows.done.data.push(doneCount);
            rows.notDone.data.push(notDoneCount);
            rows.progress.data.push(`${progress}%`);
        }

        // Helper to create row
        const createRow = (label, data) => {
            const tr = document.createElement('tr');
            const th = document.createElement('td');
            th.className = 'footer-label';
            th.textContent = label;
            tr.appendChild(th);

            data.forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                tr.appendChild(td);
            });
            return tr;
        };

        footer.appendChild(createRow(rows.progress.label, rows.progress.data));
        footer.appendChild(createRow(rows.done.label, rows.done.data));
        footer.appendChild(createRow(rows.notDone.label, rows.notDone.data));
    }



    // Update Statistics & Analysis (Monthly Context)
    function updateStats() {
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        // Top Stats
        totalHabitsEl.textContent = habits.length * daysInMonth;

        let totalChecksInMonth = 0;
        const currentMonthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

        habits.forEach(h => {
            const checksInMonth = h.completedDays.filter(d => d.startsWith(currentMonthPrefix)).length;
            totalChecksInMonth += checksInMonth;
        });

        totalCompletedEl.textContent = totalChecksInMonth;

        const maxPossibleChecks = habits.length * daysInMonth;
        const globalPercentage = maxPossibleChecks === 0 ? '0.00' : ((totalChecksInMonth / maxPossibleChecks) * 100).toFixed(2);
        globalProgressEl.style.width = `${globalPercentage}%`;

        // Update percentage text
        const progressPercentageEl = document.getElementById('progress-percentage');
        if (progressPercentageEl) {
            progressPercentageEl.textContent = `${globalPercentage}%`;
        }

        // Analysis Table
        analysisBody.innerHTML = '';
        habits.forEach(habit => {
            const actual = habit.completedDays.filter(d => d.startsWith(currentMonthPrefix)).length;
            const percentage = Math.round((actual / daysInMonth) * 100);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${daysInMonth}</td>
                <td>${actual}</td>
                <td class="progress-bar-cell">
                    <div class="cell-progress-bg">
                        <div class="cell-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </td>
            `;
            analysisBody.appendChild(tr);
        });
    }

    function renderGraph() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        // Destroy existing if any (simple check)
        if (window.myChart) window.myChart.destroy();

        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const dataPoints = [];

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = getDateString(i);
            let dailyCompleted = 0;
            habits.forEach(habit => {
                if (habit.completedDays.includes(dateStr)) dailyCompleted++;
            });
            dataPoints.push((dailyCompleted / habits.length) * 100);
        }

        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Completion %',
                    data: dataPoints,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event Listeners
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));

    // Mobile Progress Navigation
    const progressBox = document.querySelector('.stat-box.progress-box');
    if (progressBox) {
        progressBox.addEventListener('click', () => {
            // Check if mobile (using 768px as breakpoint matching CSS)
            if (window.innerWidth <= 768) {
                window.location.href = 'progress.html';
            }
        });
    }

    init();
});
