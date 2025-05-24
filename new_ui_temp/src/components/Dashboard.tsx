import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  Target,
  Zap,
  RefreshCw,
  Trophy,
  User2,
  HelpCircle,
} from "lucide-react";

const Dashboard = () => {
  const currentSteps = 9939;
  const targetSteps = 15000;
  const progressPercentage = Math.round((currentSteps / targetSteps) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        </div>

        {/* User Profile Card */}
        <Card className="bg-gradient-purple text-white border-none shadow-lg animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User2 className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Welcome, Rohit</h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold">Coins</span>
              </div>
              <span className="text-2xl font-bold">85</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-orange-400" />
                <span className="font-semibold">Streak</span>
              </div>
              <span className="text-2xl font-bold">7 days</span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Goal Card */}
        <Card
          className="border-none shadow-lg animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-slate-800">
                <Target className="h-5 w-5 text-purple-600" />
                <span>Today's Goal</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-700 mb-4">
                Walk/Run 15000 steps
              </h3>

              <div className="space-y-3">
                <div className="flex items-end space-x-2">
                  <span className="text-4xl font-bold text-purple-600">
                    {currentSteps.toLocaleString()}
                  </span>
                  <span className="text-xl text-slate-500 pb-1">
                    / {targetSteps.toLocaleString()} steps
                  </span>
                </div>

                <Progress value={progressPercentage} className="h-3" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">
                    {progressPercentage}% complete
                  </span>
                  <Badge
                    variant="outline"
                    className="border-yellow-500 text-yellow-700 bg-yellow-50"
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Status: Pending
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Rewards Card */}
        <Card
          className="border-none shadow-lg animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-800">
              <Trophy className="h-5 w-5 text-green-600" />
              <span>Active Rewards</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-100 text-green-800 border-green-200 w-full justify-center py-3 text-sm font-medium">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Streak Saver is ACTIVE</span>
              </div>
            </Badge>
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <Card
          className="border-none shadow-lg animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <CardContent className="p-4">
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3">
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Bottom padding for navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default Dashboard;
