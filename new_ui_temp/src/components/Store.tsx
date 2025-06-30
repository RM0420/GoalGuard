import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Calendar, Shield, Target, ShoppingBag } from "lucide-react";

const storeItems = [
  {
    id: 3,
    name: "Goal Reduction",
    description: "Temporarily lower your daily goal target.",
    cost: 100,
    icon: Target,
    color: "bg-gradient-primary",
  },
  {
    id: 1,
    name: "Skip Day",
    description: "Skip a day's goal without breaking your streak.",
    cost: 200,
    icon: Calendar,
    color: "bg-gradient-warning",
  },
  {
    id: 2,
    name: "Streak Saver",
    description: "Maintain your streak despite a missed goal.",
    cost: 450,
    icon: Shield,
    color: "bg-gradient-success",
  },
];

const Store = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Rewards Store
          </h1>
          <p className="text-slate-600 mt-2">Spend your hard-earned coins</p>
        </div>

        {/* Coins Balance */}
        <Card className="bg-gradient-card text-white border-none shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <Coins className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-slate-300">Your Coins</p>
                <p className="text-3xl font-bold">500</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Items */}
        <div className="space-y-4">
          {storeItems.map((item, index) => (
            <Card
              key={item.id}
              className="border-none shadow-lg animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Icon Section */}
                  <div
                    className={`${item.color} p-6 flex items-center justify-center`}
                  >
                    <item.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-800">
                        {item.name}
                      </h3>
                      <p className="text-slate-600 text-sm mt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Coins className="h-5 w-5 text-yellow-600" />
                        <span className="text-lg font-bold text-slate-800">
                          Cost: {item.cost} coins
                        </span>
                      </div>
                      <Button className="bg-gradient-purple text-white border-none hover:opacity-90 transition-opacity">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Purchase
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

export default Store;
