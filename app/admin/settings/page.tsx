import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Admin Settings | Vietnam Property Platform',
  description: 'Configure system settings for the Vietnam Property Platform',
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Site Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007882]"
                defaultValue="Vietnam Property Platform"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">
                Contact system administrator to change site name
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007882]"
                defaultValue="admin@example.com"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button className="bg-[#007882] hover:bg-[#005F67]">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Property Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Currency
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007882]"
              >
                <option value="USD">USD ($)</option>
                <option value="VND">VND (₫)</option>
                <option value="KRW">KRW (₩)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Featured Properties
              </label>
              <input
                type="number"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007882]"
                defaultValue="6"
              />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-[#007882] mr-2" />
              <span className="text-sm">Require admin approval for new listings</span>
            </label>
          </div>
          
          <div className="flex justify-end">
            <Button className="bg-[#007882] hover:bg-[#005F67]">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Enabling maintenance mode will make the site inaccessible to regular users. 
            Administrators will still be able to log in.
          </p>
          
          <div className="flex items-center">
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-[#007882] mr-2" />
              <span className="text-sm font-medium">Enable Maintenance Mode</span>
            </label>
          </div>
          
          <div className="flex justify-end">
            <Button className="bg-[#007882] hover:bg-[#005F67]">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
