import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// A stylish, custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{`Date: ${label}`}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm font-medium">
            {`${p.name}: ${p.value.toLocaleString()} pcs`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Dummy data that mimics the structure of your fetched data
// In your actual implementation, you would use the fetched and processed data.
const sampleData = [
  { date: 'Aug 20', 'Line 1': 0, 'Line 2': 0, 'Line 3': 0, 'Line 4': 0, 'Line 5': 0, 'Line 6': 0, 'Line 7': 0, 'Line 8': 480 },
  { date: 'Aug 26', 'Line 1': 0, 'Line 2': 20, 'Line 3': 0, 'Line 4': 0, 'Line 5': 120, 'Line 6': 130, 'Line 7': 125, 'Line 8': 0 },
  { date: 'Sep 10', 'Line 1': 0, 'Line 2': 0, 'Line 3': 0, 'Line 4': 0, 'Line 5': 30, 'Line 6': 0, 'Line 7': 40, 'Line 8': 0 },
  { date: 'Sep 14', 'Line 1': 0, 'Line 2': 130, 'Line 3': 0, 'Line 4': 160, 'Line 5': 0, 'Line 6': 150, 'Line 7': 0, 'Line 8': 0 },
  { date: 'Sep 19', 'Line 1': 0, 'Line 2': 70, 'Line 3': 0, 'Line 4': 155, 'Line 5': 0, 'Line 6': 90, 'Line 7': 80, 'Line 8': 0 },
  { date: 'Oct 02', 'Line 1': 0, 'Line 2': 0, 'Line 3': 40, 'Line 4': 0, 'Line 5': 0, 'Line 6': 0, 'Line 7': 20, 'Line 8': 0 },
  { date: 'Oct 08', 'Line 1': 0, 'Line 2': 0, 'Line 3': 250, 'Line 4': 0, 'Line 5': 0, 'Line 6': 0, 'Line 7': 0, 'Line 8': 0 },
  { date: 'Oct 12', 'Line 1': 0, 'Line 2': 0, 'Line 3': 0, 'Line 4': 0, 'Line 5': 0, 'Line 6': 0, 'Line 7': 0, 'Line 8': 10 },
];


const LineProductivityChart = () => {
    // This state would normally be populated by your useEffect fetch call
    const [chartData, setChartData] = React.useState(sampleData);
    const [loading, setLoading] = React.useState(false); // Set to false to show chart with sample data

    const lines = [1, 2, 3, 4, 5, 6, 7, 8];
    
    // New color palette inspired by the image provided
    const lineColors = [
        '#0088FE', // Line 1 - Blue
        '#00C49F', // Line 2 - Green
        '#FF8042', // Line 3 - Orange
        '#FFBB28', // Line 4 - Yellow (swapped for better visibility)
        '#A463F2', // Line 5 - Purple
        '#FF6384', // Line 6 - Pink
        '#FFCD56', // Line 7 - Lighter Yellow
        '#4BC0C0', // Line 8 - Cyan
    ];

  // The original useEffect for fetching data would be here.
  // For this styling example, we are using the sampleData above.
  /*
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("http://localhost:8001/api/iot/rfid-scans");
        // processChartData(data); // You would process the real data here
      } catch (err) {
        console.error("Error fetching RFID scans:", err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  */

  if (loading) {
    // Your loader component
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-6 border border-gray-200/80">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Daily Productivity - Line Wise
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" tick={{ fill: '#6B7280' }} />
          <YAxis tick={{ fill: '#6B7280' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ paddingTop: '20px' }}
          />
          {lines.map((line, index) => (
            <Line
              key={line}
              type="monotone"
              dataKey={`Line ${line}`}
              stroke={lineColors[index]}
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineProductivityChart;

