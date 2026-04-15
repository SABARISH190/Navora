import React from 'react';
import PlotComponent from 'react-plotly.js';
const Plot = PlotComponent.default || PlotComponent;

export default function ZoneChart({ zoneName, history }) {
  if (!history || history.length === 0) return null;

  const x = history.map(h => new Date(h.timestamp * 1000));
  const y = history.map(h => {
    const zoneData = h.zones[zoneName];
    return zoneData ? zoneData.utilization * 100 : 0;
  });

  return (
    <div style={{ 
      background: 'var(--surface)', 
      padding: '1.5rem', 
      borderRadius: 'var(--radius)', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <h4 style={{ margin: '0 0 1rem', color: 'var(--primary)', fontSize: '1.1rem' }}>{zoneName} Activity</h4>
      <Plot
        data={[
          {
            x: x,
            y: y,
            type: 'scatter',
            mode: 'lines',
            line: { color: 'var(--secondary)', width: 3, shape: 'spline' },
            fill: 'tozeroy',
            fillcolor: 'rgba(47, 127, 127, 0.1)'
          }
        ]}
        layout={{
          autosize: true,
          margin: { l: 40, r: 20, t: 10, b: 30 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          xaxis: { 
            showgrid: true, 
            gridcolor: 'rgba(0,0,0,0.05)', 
            type: 'date',
            tickfont: { color: 'var(--text-secondary)' }
          },
          yaxis: { 
            showgrid: true, 
            gridcolor: 'rgba(0,0,0,0.05)', 
            range: [0, 100], 
            title: '%',
            tickfont: { color: 'var(--text-secondary)' }
          }
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "220px" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}
