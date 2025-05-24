
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Target, CheckCircle } from 'lucide-react';

const Goals = () => {
  const [goalType, setGoalType] = useState('steps');
  const [targetSteps, setTargetSteps] = useState('15000');
  const [appsToBlock, setAppsToBlock] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Goals
          </h1>
          <p className="text-slate-600 mt-2">Set your daily targets</p>
        </div>

        {/* Edit Daily Goal Card */}
        <Card className="border-none shadow-lg animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-slate-800">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Edit Daily Goal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Goal Type Selection */}
            <div>
              <Label className="text-base font-semibold text-slate-700 mb-4 block">
                Select Goal Type:
              </Label>
              <RadioGroup value={goalType} onValueChange={setGoalType} className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-purple-200 bg-purple-50">
                  <RadioGroupItem value="steps" id="steps" />
                  <Label htmlFor="steps" className="flex items-center space-x-2 cursor-pointer">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-slate-800">Steps</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <RadioGroupItem value="distance" id="distance" />
                  <Label htmlFor="distance" className="cursor-pointer font-medium text-slate-800">
                    Running Distance
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Target Steps Input */}
            <div className="space-y-2">
              <Label htmlFor="target-steps" className="text-base font-semibold text-slate-700">
                Target Steps
              </Label>
              <Input
                id="target-steps"
                value={targetSteps}
                onChange={(e) => setTargetSteps(e.target.value)}
                className="text-lg p-4 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter target steps"
              />
            </div>

            {/* Apps to Block Input */}
            <div className="space-y-2">
              <Label htmlFor="apps-to-block" className="text-base font-semibold text-slate-700">
                Apps to Block (comma-separated, e.g.,...)
              </Label>
              <Input
                id="apps-to-block"
                value={appsToBlock}
                onChange={(e) => setAppsToBlock(e.target.value)}
                className="text-lg p-4 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Instagram, TikTok, YouTube"
              />
            </div>

            {/* Update Button */}
            <Button className="w-full bg-gradient-purple text-white border-none hover:opacity-90 transition-opacity py-3 text-lg font-semibold">
              Update Goal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Goals;
