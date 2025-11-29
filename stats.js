document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('detailedChart');
    if (!ctx) return;

    // Load data from localStorage
    const habits = JSON.parse(localStorage.getItem('habits')) || [];
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Generate labels (day numbers)
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Calculate Cumulative Data
    const totalTasksData = [];
    const completedTasksData = [];
    const currentMonthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    let cumulativeTotal = 0;
    let cumulativeCompleted = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${currentMonthPrefix}-${String(i).padStart(2, '0')}`;

        // Cumulative Total: Habits * Day Number
        // This creates a linear "ideal" line
        cumulativeTotal += habits.length;
        totalTasksData.push(cumulativeTotal);

        let completedOnDay = 0;
        habits.forEach(h => {
            if (h.completedDays.includes(dateStr)) completedOnDay++;
        });

        cumulativeCompleted += completedOnDay;
        completedTasksData.push(cumulativeCompleted);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Cumulative Goal',
                    data: totalTasksData,
                    borderColor: '#94a3b8', // Grey for total
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    borderDash: [5, 5],
                    fill: false, // Don't fill the goal line to keep it clean
                    tension: 0.1, // Straight line for goal
                    pointRadius: 0 // Hide points for goal line
                },
                {
                    label: 'Actual Progress',
                    data: completedTasksData,
                    borderColor: '#4CAF50', // Green for completed (User's color)
                    backgroundColor: 'rgba(76, 175, 80, 0.2)', // User's fill color
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4CAF50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cumulative Tasks'
                    },
                    ticks: {
                        stepSize: 10 // Larger steps for cumulative view
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Day of Month'
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + context.parsed.y;
                        }
                    }
                },
                legend: {
                    position: 'top',
                }
            }
        }
    });
});
