import React from 'react';
import PlotComponent from 'react-plotly.js';
const Plot = PlotComponent.default || PlotComponent;

export default function ComparisonChart({ zones }) {
  if (!zones || zones.length === 0) return null;

  // Sorting
  const sortedZones = [...zones].sort((a, b) => b.utilization - a.utilization);
  const max = Math.max(...zones.map(z => z.utilization));

  const x = sortedZones.map(z => z.name);
  const y = sortedZones.map(z => z.utilization * 100);
  
  // Highlighting Peak bounds safely (resolves CSS var mapping in Canvas)
  const colors = sortedZones.map(z => z.utilization === max ? '#D32F2F' : '#2F7F7F');

  return (
    <div role="img" aria-label="Crowd utilization chart" style={{ 
      background: 'var(--surface)', 
      padding: '1.5rem', 
      borderRadius: 'var(--radius)', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <h4 style={{ margin: '0 0 1rem', color: 'var(--primary)', fontSize: '1.1rem' }}>Global Utilization Ranking</h4>
      <Plot
        data={[
          {
            x: x,
            y: y,
            type: 'bar',
            marker: { color: colors, opacity: 0.9 },
            hoverinfo: 'x+y'
          }
        ]}
        layout={{
          autosize: true,
          margin: { l: 40, r: 20, t: 10, b: 30 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          xaxis: { 
            showgrid: false, 
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
