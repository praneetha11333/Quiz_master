export default {
  setup() {
    const { onMounted } = Vue;

    const loadUserChart = async () => {
      try {
        const res = await fetch('/api/usersummary', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });

        if (!res.ok) {
          throw new Error("Failed to load user scores");
        }

        const chartData = await res.json();

        const ctx = document.getElementById('userChart').getContext('2d')
        new Chart(ctx, {
          type: 'bar', 
          data: {
            labels: chartData.labels,
            datasets: [{
              label: 'My Scores',
              data: chartData.data,
              backgroundColor: '#36A2EB'
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              title: {
                display: true,
                text: 'My Quiz Scores'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100 
              }
            }
          }
        });
      } catch (err) {
        console.error("Chart error:", err)
      }
    };

    onMounted(() => {
      loadUserChart()
    });

    return {}
  },

  template: `
    <div class="container mt-4 text-center">
      <h5 class="mb-5">My Quiz Score Summary</h5>
      <div style="width: 250px; height: 200px; margin: auto; ">
        <canvas id="userChart"></canvas>
      </div>
    </div>
  `
};
 
