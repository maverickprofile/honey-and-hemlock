
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, DollarSign, Mail, Globe, Shield, FileText, Send, Lock } from 'lucide-react';

const SettingsSection = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('Fetching settings data...');
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      
      if (error) {
        console.error('Settings fetch error:', error);
        // Set default settings instead of failing
        setSettings({
          tier_1_price: '500',
          tier_2_price: '750',
          tier_3_price: '1000',
          site_title: 'Honey & Hemlock Productions',
          support_email: 'support@honeyandhemlock.productions'
        });
        toast({
          title: "Database Warning",
          description: `Settings could not be loaded: ${error.message}. Using defaults.`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('Settings fetched:', data?.length || 0);
      
      const settingsMap = {};
      (data || []).forEach(setting => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings({
        tier_1_price: '500',
        tier_2_price: '750',
        tier_3_price: '1000',
        site_title: 'Honey & Hemlock Productions',
        support_email: 'support@honeyandhemlock.productions'
      });
      toast({
        title: "Error",
        description: "Failed to fetch settings. Using defaults. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      console.log('Updating setting:', key, '=', value);
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Setting update error:', error);
        toast({
          title: "Error",
          description: `Failed to update setting: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      setSettings(prev => ({
        ...prev,
        [key]: value
      }));

      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting. Check console for details.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-portfolio-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-portfolio-gold mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#282828] border-none">
        <CardHeader>
          <CardTitle className="text-portfolio-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pricing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="pricing" className="space-y-4">
              <Card className="bg-[#232323] border-gray-600">
                <CardHeader>
                  <CardTitle className="text-portfolio-white flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Tier Pricing Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-portfolio-white">Tier 1 Price ($)</Label>
                      <Input
                        type="number"
                        value={settings.tier_1_price || ''}
                        onChange={(e) => updateSetting('tier_1_price', e.target.value)}
                        className="bg-[#282828] text-portfolio-white border-gray-600"
                      />
                    </div>
                    <div>
                      <Label className="text-portfolio-white">Tier 2 Price ($)</Label>
                      <Input
                        type="number"
                        value={settings.tier_2_price || ''}
                        onChange={(e) => updateSetting('tier_2_price', e.target.value)}
                        className="bg-[#282828] text-portfolio-white border-gray-600"
                      />
                    </div>
                    <div>
                      <Label className="text-portfolio-white">Tier 3 Price ($)</Label>
                      <Input
                        type="number"
                        value={settings.tier_3_price || ''}
                        onChange={(e) => updateSetting('tier_3_price', e.target.value)}
                        className="bg-[#282828] text-portfolio-white border-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-portfolio-white">Additional Page Fee ($)</Label>
                    <Input
                      type="number"
                      value={settings.additional_page_fee || ''}
                      onChange={(e) => updateSetting('additional_page_fee', e.target.value)}
                      className="bg-[#282828] text-portfolio-white border-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-portfolio-white">Tier 1 Description</Label>
                    <Textarea
                      value={settings.tier_1_description || ''}
                      onChange={(e) => updateSetting('tier_1_description', e.target.value)}
                      className="bg-[#282828] text-portfolio-white border-gray-600"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-portfolio-white">Tier 2 Description</Label>
                    <Textarea
                      value={settings.tier_2_description || ''}
                      onChange={(e) => updateSetting('tier_2_description', e.target.value)}
                      className="bg-[#282828] text-portfolio-white border-gray-600"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-portfolio-white">Tier 3 Description</Label>
                    <Textarea
                      value={settings.tier_3_description || ''}
                      onChange={(e) => updateSetting('tier_3_description', e.target.value)}
                      className="bg-[#282828] text-portfolio-white border-gray-600"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="email" className="space-y-4">
              {/* SMTP Configuration */}
              <Card className="bg-[#232323] border-gray-600">
                <CardHeader>
                  <CardTitle className="text-portfolio-white flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    SMTP Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-portfolio-white">SMTP Host</Label>
                      <Input
                        placeholder="smtp.gmail.com"
                        value={settings.smtp_host || ''}
                        onChange={(e) => updateSetting('smtp_host', e.target.value)}
                        className="bg-[#282828] text-portfolio-white border-gray-600"
                      />
                    </div>
                    <div>
                      <Label className="text-portfolio-white">SMTP Port</Label>
                      <Input
                        placeholder="587"
                        value={settings.smtp_port || ''}
                        onChange={(e) => updateSetting('smtp_port', e.target.value)}
                        className="bg-[#282828] text-portfolio-white border-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-portfolio-white">SMTP Username</Label>
                    <Input
                      placeholder="your-email@gmail.com"
                      value={settings.smtp_username || ''}
                      onChange={(e) => updateSetting('smtp_username', e.target.value)}
                      className="bg-[#282828] text-portfolio-white border-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-portfolio-white flex items-center">
                      <Lock className="w-3 h-3 mr-1" />
                      SMTP Password / API Key
                    </Label>
                    <Input
                      type="password"
                      placeholder="••••••••••••"
                      value={settings.smtp_password || ''}
                      onChange={(e) => updateSetting('smtp_password', e.target.value)}
                      className="bg-[#282828] text-portfolio-white border-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-portfolio-white">From Email</Label>
                      <Input
                        type="email"
                        placeholder="noreply@honeyandhemlock.com"
                        value={settings.smtp_from_email || ''}
                        onChange={(e) => updateSetting('smtp_from_email', e.target.value)}
                        className="bg-[#282828] text-portfolio-white border-gray-600"
                      />
                    </div>
                    <div>
                      <Label className="text-portfolio-white">From Name</Label>
                      <Input
                        placeholder="Honey & Hemlock Productions"
                        value={settings.smtp_from_name || ''}
                        onChange={(e) => updateSetting('smtp_from_name', e.target.value)}
                        className="bg-[#282828] text-portfolio-white border-gray-600"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.smtp_secure === 'true'}
                      onCheckedChange={(checked) => updateSetting('smtp_secure', checked ? 'true' : 'false')}
                    />
                    <Label className="text-portfolio-white">Use TLS/SSL Encryption</Label>
                  </div>
                  <Button 
                    className="bg-portfolio-gold text-black hover:bg-portfolio-gold/90"
                    onClick={async () => {
                      toast({
                        title: "Testing Connection",
                        description: "Sending test email...",
                      });
                      // Test SMTP connection would go here
                      setTimeout(() => {
                        toast({
                          title: "Test Complete",
                          description: "SMTP settings saved. Test email functionality will be implemented with backend.",
                        });
                      }, 1000);
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Test SMTP Connection
                  </Button>
                </CardContent>
              </Card>

              {/* Email Notification Settings */}
              <Card className="bg-[#232323] border-gray-600">
                <CardHeader>
                  <CardTitle className="text-portfolio-white">Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-portfolio-white">Admin Notification Email</Label>
                    <Input
                      type="email"
                      placeholder="admin@honeyandhemlock.com"
                      value={settings.support_email || ''}
                      onChange={(e) => updateSetting('support_email', e.target.value)}
                      className="bg-[#282828] text-portfolio-white border-gray-600"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.email_notifications_enabled}
                        onCheckedChange={(checked) => updateSetting('email_notifications_enabled', checked)}
                      />
                      <Label className="text-portfolio-white">Enable Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.contractor_assignment_emails}
                        onCheckedChange={(checked) => updateSetting('contractor_assignment_emails', checked)}
                      />
                      <Label className="text-portfolio-white">Contractor Assignment Emails</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.review_completion_emails}
                        onCheckedChange={(checked) => updateSetting('review_completion_emails', checked)}
                      />
                      <Label className="text-portfolio-white">Review Completion Emails</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.new_script_upload_emails}
                        onCheckedChange={(checked) => updateSetting('new_script_upload_emails', checked)}
                      />
                      <Label className="text-portfolio-white">New Script Upload Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.contact_form_emails}
                        onCheckedChange={(checked) => updateSetting('contact_form_emails', checked)}
                      />
                      <Label className="text-portfolio-white">Contact Form Submission Alerts</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;
