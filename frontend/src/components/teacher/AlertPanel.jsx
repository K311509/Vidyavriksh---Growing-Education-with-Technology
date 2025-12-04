import React from 'react';
import { Bell, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const AlertsPanel = ({ alerts, onAcknowledge }) => {
  const getSeverityColor = (severity) => {
    const colors = {
      LOW: 'bg-blue-50 border-blue-300 text-blue-800',
      MEDIUM: 'bg-yellow-50 border-yellow-300 text-yellow-800',
      HIGH: 'bg-orange-50 border-orange-300 text-orange-800',
      CRITICAL: 'bg-red-50 border-red-300 text-red-800',
    };
    return colors[severity] || 'bg-gray-50 border-gray-300 text-gray-800';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'LOW': return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'MEDIUM': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'HIGH': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'CRITICAL': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Alerts</h3>
        <p className="text-gray-500">All students are doing well!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Bell className="w-6 h-6 text-red-500" />
        Active Alerts ({alerts.length})
      </h3>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 border-2 rounded-lg ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                {getSeverityIcon(alert.severity)}
                <div>
                  <h4 className="font-bold text-gray-800">{alert.studentName}</h4>
                  <p className="text-sm font-semibold">{alert.message}</p>
                  <p className="text-xs mt-1">{alert.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(alert.createdAt).toLocaleDateString()} • {alert.alertType}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded ${getSeverityColor(alert.severity)}`}>
                {alert.severity}
              </span>
            </div>

            <button
              onClick={() => onAcknowledge && onAcknowledge(alert.id)}
              className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
            >
              Acknowledge Alert
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;