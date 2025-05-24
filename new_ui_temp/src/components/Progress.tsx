
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle } from 'lucide-react';

const progressData = [
  {
    date: 'May 23',
    status: 'skipped',
    goal: 'steps - 15000 steps',
    progress: 'Steps: 3988, Distance: 6.80 km',
    synced: '5/23/2025, 8:38:05 PM'
  },
  {
    date: 'May 22',
    status: 'completed',
    goal: 'steps - 15000 steps',
    progress: 'Steps: 4086, Distance: 0.20 km',
    synced: '5/23/2025, 7:36:46 PM'
  }
];

const Progress = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Progress
          </h1>
          <p className="text-slate-600 mt-2">Your Weekly Progress</p>
        </div>

        {/* Date Range Selector */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-slate-800">May 19 - May 25</span>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Items */}
        <div className="space-y-4">
          {progressData.map((item, index) => (
            <Card key={index} className="border-none shadow-lg animate-fade-in overflow-hidden" 
                  style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-0">
                <div className="flex">
                  {/* Status Icon */}
                  <div className={`p-6 flex items-center justify-center ${
                    item.status === 'completed' 
                      ? 'bg-gradient-success' 
                      : 'bg-gradient-warning'
                  }`}>
                    {item.status === 'completed' ? (
                      <CheckCircle className="h-8 w-8 text-white" />
                    ) : (
                      <XCircle className="h-8 w-8 text-white" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-slate-800">{item.date}</h3>
                      <Badge className={`mt-2 ${
                        item.status === 'completed' 
                          ? 'bg-success-100 text-success-800 border-success-200' 
                          : 'bg-warning-100 text-warning-800 border-warning-200'
                      }`}>
                        Status: {item.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-700">
                        <span className="font-semibold">Goal:</span> {item.goal}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-semibold">Progress:</span> {item.progress}
                      </p>
                      <p className="text-slate-500 text-xs">
                        <span className="font-semibold">Synced:</span> {item.synced}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progress;
