
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, Target, Shield, Play } from 'lucide-react';

const inventoryItems = [
  {
    id: 1,
    name: 'Skip Day',
    description: "Skip a day's goal without breaking your streak.",
    owned: 1,
    acquired: '5/23/2025',
    icon: Calendar,
    color: 'bg-gradient-warning'
  },
  {
    id: 2,
    name: 'Goal Reduction',
    description: 'Temporarily lower your daily goal target.',
    owned: 1,
    acquired: '5/16/2025',
    icon: Target,
    color: 'bg-gradient-primary'
  },
  {
    id: 3,
    name: 'Streak Saver',
    description: 'Maintain your streak despite a missed goal.',
    owned: 3,
    acquired: '5/16/2025',
    icon: Shield,
    color: 'bg-gradient-success'
  }
];

const Inventory = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold bg-gradient-purple bg-clip-text text-transparent">
            My Inventory
          </h1>
          <p className="text-slate-600 mt-2">Your power-ups and rewards</p>
        </div>

        {/* Inventory Items */}
        <div className="space-y-4">
          {inventoryItems.map((item, index) => (
            <Card key={item.id} className="border-none shadow-lg animate-fade-in overflow-hidden" 
                  style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-0">
                <div className="flex">
                  {/* Icon Section */}
                  <div className={`${item.color} p-6 flex items-center justify-center`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{item.name}</h3>
                        <p className="text-slate-600 text-sm mt-1">{item.description}</p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                        <Package className="h-3 w-3 mr-1" />
                        Owned: {item.owned}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">Acquired: {item.acquired}</p>
                      <Button className="bg-gradient-purple text-white border-none hover:opacity-90 transition-opacity">
                        <Play className="h-4 w-4 mr-2" />
                        Use Item
                      </Button>
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

export default Inventory;
