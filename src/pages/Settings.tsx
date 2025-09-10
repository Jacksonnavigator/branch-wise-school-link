import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Database,
  School,
  Clock,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';

const Settings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // General Settings State
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/dd/yyyy');
  const [timeFormat, setTimeFormat] = useState('12h');

  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [gradeUpdates, setGradeUpdates] = useState(true);
  const [feeReminders, setFeeReminders] = useState(true);
  const [eventNotifications, setEventNotifications] = useState(true);

  // Academic Settings State
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [currentTerm, setCurrentTerm] = useState('Term 1');
  const [gradingScale, setGradingScale] = useState('percentage');
  const [attendanceThreshold, setAttendanceThreshold] = useState('75');
  const [lateThreshold, setLateThreshold] = useState('15');

  // Security Settings State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [passwordExpiry, setPasswordExpiry] = useState('90');
  const [loginAttempts, setLoginAttempts] = useState('5');

  // System Settings State (Admin/Headmaster only)
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [dataRetention, setDataRetention] = useState('7');
  const [auditLogging, setAuditLogging] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Track changes and auto-save functionality
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [theme, language, timezone, dateFormat, timeFormat, emailNotifications, pushNotifications, smsNotifications, attendanceAlerts, gradeUpdates, feeReminders, eventNotifications, academicYear, currentTerm, gradingScale, attendanceThreshold, lateThreshold, twoFactorAuth, sessionTimeout, passwordExpiry, loginAttempts, backupFrequency, dataRetention, auditLogging, maintenanceMode]);

  const handleSaveSettings = async (category: string) => {
    setLoading(true);
    setHasUnsavedChanges(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const now = new Date().toLocaleString();
      setLastSaved(now);
      
      toast({
        title: "✅ Settings Saved!",
        description: `${category} preferences updated successfully at ${now}`,
      });
    } catch (error) {
      toast({
        title: "❌ Save Failed",
        description: "Failed to save settings. Please check your connection and try again.",
        variant: "destructive",
      });
      setHasUnsavedChanges(true);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isHeadmaster = profile?.role === 'headmaster';
  const canAccessSystemSettings = isAdmin || isHeadmaster;
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-background/95">
      <PageHeader title="Settings" subtitle="Customize your experience and system preferences" />

      {/* Decorative enhanced header kept for visual emphasis */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-8 border border-border/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse"></div>
              <div className="relative p-3 rounded-full bg-primary/10 border border-primary/20">
                <SettingsIcon className="h-8 w-8 text-primary animate-[spin_10s_linear_infinite]" />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-lg">Customize your experience and system preferences</p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-col items-end gap-2">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="animate-pulse bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                <AlertCircle className="h-3 w-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
            {lastSaved && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Last saved: {lastSaved}
              </Badge>
            )}
          </div>
        </div>
      </div>
*** End Patch

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          {canAccessSystemSettings && (
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              System
            </TabsTrigger>
          )}
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Display & Localization
              </CardTitle>
              <CardDescription>
                Configure your display preferences and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                      <SelectItem value="CET">Central European Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                      <SelectItem value="dd-MM-yyyy">DD-MM-YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select value={timeFormat} onValueChange={setTimeFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('General')} 
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-primary/25"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how and when you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                </div>

                <Separator />

                <h4 className="font-medium text-foreground">Specific Notifications</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Attendance Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about attendance issues</p>
                  </div>
                  <Switch checked={attendanceAlerts} onCheckedChange={setAttendanceAlerts} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Grade Updates</Label>
                    <p className="text-sm text-muted-foreground">Notifications when grades are updated</p>
                  </div>
                  <Switch checked={gradeUpdates} onCheckedChange={setGradeUpdates} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Fee Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminders for upcoming fee payments</p>
                  </div>
                  <Switch checked={feeReminders} onCheckedChange={setFeeReminders} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Event Notifications</Label>
                    <p className="text-sm text-muted-foreground">Updates about school events and announcements</p>
                  </div>
                  <Switch checked={eventNotifications} onCheckedChange={setEventNotifications} />
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('Notification')} 
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-primary/25"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Settings */}
        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Academic Configuration
              </CardTitle>
              <CardDescription>
                Configure academic year, grading, and attendance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                      <SelectItem value="2026-2027">2026-2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentTerm">Current Term</Label>
                  <Select value={currentTerm} onValueChange={setCurrentTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select current term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Term 1">Term 1</SelectItem>
                      <SelectItem value="Term 2">Term 2</SelectItem>
                      <SelectItem value="Term 3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradingScale">Grading Scale</Label>
                  <Select value={gradingScale} onValueChange={setGradingScale}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grading scale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (0-100)</SelectItem>
                      <SelectItem value="letter">Letter Grades (A-F)</SelectItem>
                      <SelectItem value="points">Point System (1-10)</SelectItem>
                      <SelectItem value="gpa">GPA Scale (0.0-4.0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendanceThreshold">Minimum Attendance (%)</Label>
                  <Input
                    id="attendanceThreshold"
                    type="number"
                    value={attendanceThreshold}
                    onChange={(e) => setAttendanceThreshold(e.target.value)}
                    placeholder="75"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lateThreshold">Late Threshold (minutes)</Label>
                  <Input
                    id="lateThreshold"
                    type="number"
                    value={lateThreshold}
                    onChange={(e) => setLateThreshold(e.target.value)}
                    placeholder="15"
                    min="1"
                    max="60"
                  />
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('Academic')} 
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-primary/25"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Authentication
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      placeholder="60"
                      min="5"
                      max="480"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={passwordExpiry}
                      onChange={(e) => setPasswordExpiry(e.target.value)}
                      placeholder="90"
                      min="30"
                      max="365"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                    <Input
                      id="loginAttempts"
                      type="number"
                      value={loginAttempts}
                      onChange={(e) => setLoginAttempts(e.target.value)}
                      placeholder="5"
                      min="3"
                      max="10"
                    />
                  </div>
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('Security')} 
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-primary/25"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings (Admin/Headmaster only) */}
        {canAccessSystemSettings && (
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Advanced system settings and maintenance options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Temporarily disable access for maintenance</p>
                    </div>
                    <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">Track all system activities and changes</p>
                    </div>
                    <Switch checked={auditLogging} onCheckedChange={setAuditLogging} />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select backup frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataRetention">Data Retention (years)</Label>
                      <Input
                        id="dataRetention"
                        type="number"
                        value={dataRetention}
                        onChange={(e) => setDataRetention(e.target.value)}
                        placeholder="7"
                        min="1"
                        max="20"
                      />
                    </div>
                  </div>
                </div>

                <Separator />
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('System')} 
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-primary/25"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
              <CardDescription>
                Control your privacy settings and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share Analytics Data</Label>
                    <p className="text-sm text-muted-foreground">Help improve the system by sharing anonymous usage data</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Allow others in your organization to see your profile</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Activity Status</Label>
                    <p className="text-sm text-muted-foreground">Show when you're online and active</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Data Management</h4>
                  
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Download My Data
                  </Button>
                  
                  <Button variant="destructive" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Delete My Account
                  </Button>
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('Privacy')} 
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-primary/25"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;