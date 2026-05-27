export default {
  setup() {
    const { onMounted } = Vue;
    const downloadCSV = async () => {
      try {
        const response = await fetch('/api/export', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch CSV");
        }

        const data = await response.json();
        if (data) {
          window.location.href = `/api/csv/${data.id}`
        }
      } catch (error) {
        console.error("Error downloading CSV:", error)
      }
    };

    const loadChart = async () => {
      try {
        const res = await fetch('/api/quiz-attempts');
        const chartData = await res.json();

        const ctx = document.getElementById('quizChart').getContext('2d')
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: chartData.labels,
            datasets: [{
              label: 'Quiz Attempts',
              data: chartData.data,
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: false,
            plugins: {
              legend: { position: 'right' },
              title: {
                display: true,
                text: 'Attempts Per Quiz'
              }
            }
          }
        });
      } catch (err) {
        console.error("Chart load error:", err);
      }
    }
    onMounted(() => {
      loadChart()
    })
    return { downloadCSV }
  },

  template: `
    <div class="container mt-5 text-center">
      <button @click="downloadCSV" class="btn btn-primary mb-3 mb-10">Download CSV</button>
      <canvas id="quizChart" width="400px" height="400px"></canvas>
    </div>
  `
};
