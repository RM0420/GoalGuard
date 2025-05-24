
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Coins, Zap, LogOut, Edit } from 'lucide-react';

const Profile = () => {
  const [username, setUsername] = useState('Rohit');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-slate-600 mt-2">Your Profile</p>
        </div>

        {/* Profile Info Card */}
        <Card className="border-none shadow-lg animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-slate-800">
              <User className="h-5 w-5 text-purple-600" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-slate-700 font-semibold">
                <Mail className="h-4 w-4" />
                <span>Email:</span>
              </Label>
              <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">rmahajan0420@gmail.com</p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-semibold">
                Username:
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-lg p-4 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <Button className="w-full bg-gradient-primary text-white border-none hover:opacity-90 transition-opacity">
              <Edit className="h-4 w-4 mr-2" />
              Update Username
            </Button>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="border-none shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-slate-800">Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <Coins className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">Coins</p>
                    <p className="text-2xl font-bold text-yellow-800">450</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-3">
                  <Zap className="h-6 w-6 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-700 font-medium">Current Streak</p>
                    <p className="text-2xl font-bold text-orange-800">10 days</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <Button 
          variant="outline" 
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
