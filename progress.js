document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;

    // Load data from localStorage
    const habits = JSON.parse(localStorage.getItem('habits')) || [];
    const currentDate = new Date();
    
    // Helper to get YYYY-MM-DD
    function getDateString(day) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${month}-${d}`;
    }

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dataPoints = [];

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = getDateString(i);
        let dailyCompleted = 0;
        habits.forEach(habit => {
            if (habit.completedDays.includes(dateStr)) dailyCompleted++;
        });
        // Avoid division by zero if no habits
        const percentage = habits.length === 0 ? 0 : (dailyCompleted / habits.length) * 100;
        dataPoints.push(percentage);
    }

    new Chart(ctx, {
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
                    max: 100,
                    title: {
                        display: true,
                        text: 'Completion Percentage'
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
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Completion: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
});
