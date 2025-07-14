'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/app/utils/supabase';

/**
 * A development-only page for seeding the database with initial data for testing
 * This should be removed in production
 */
export default function DbSeedingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('ryanmncgranework@gmail.com');
  const [hotelName, setHotelName] = useState('INITI AI Hotel');
  const [hotelSlug, setHotelSlug] = useState('initi-ai');
  const [seedGuests, setSeedGuests] = useState(true);
  const [seedFaqs, setSeedFaqs] = useState(true);
  const [seedRoomService, setSeedRoomService] = useState(true);
  const [seedLocalEvents, setSeedLocalEvents] = useState(true);
  const { toast } = useToast();
  
  const seedData = async () => {
    setIsLoading(true);
    
    try {
      toast({
        title: "Starting database seeding process",
        description: "This may take a few moments...",
      });
      
      // Step 1: Get the user by email using Supabase Auth API
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;
      const user = authUsers?.users.find(u => u.email === adminEmail);
      const userId = user?.id;
      
      if (!userId) {
        throw new Error(`User with email ${adminEmail} not found. Create the user first via Supabase Auth.`);
      }
      
      // Step 2: Create a hotel
      const { data: hotelData, error: hotelError } = await supabase
        .from('hotels')
        .insert({
          name: hotelName,
          slug: hotelSlug,
          address: '123 Main Street',
          city: 'Miami',
          region: 'FL',
          postal_code: '33101',
          country: 'USA',
          description: 'A luxury AI-powered hotel experience',
          website: 'https://initiai.com',
          phone: '+1 (800) 555-1234',
          email: 'info@initiai.com',
          is_active: true,
          timezone: 'America/New_York',
        })
        .select('id')
        .single();
        
      if (hotelError) throw hotelError;
      
      const hotelId = hotelData.id;
      
      // Step 3: Create hotel admin
      const { error: adminError } = await supabase
        .from('hotel_admins')
        .insert({
          hotel_id: hotelId,
          user_id: userId,
          role: 'admin',
        });
        
      if (adminError) throw adminError;
      
      // Step 4: Optionally seed guests
      if (seedGuests) {
        const guestData = [
          { guest_identifier: 'G12345', email: 'guest1@example.com' },
          { guest_identifier: 'G67890', email: 'guest2@example.com' },
          { guest_identifier: 'G24680', email: 'guest3@example.com' },
          { guest_identifier: 'G13579', email: 'guest4@example.com' },
          { guest_identifier: 'G11111', email: 'guest5@example.com' },
        ];
        
        const { error: guestsError } = await supabase
          .from('guests')
          .insert(guestData.map(guest => ({ 
            hotel_id: hotelId,
            ...guest 
          })));
          
        if (guestsError) throw guestsError;
      }
      
      // Step 5: Optionally seed FAQs
      if (seedFaqs) {
        const faqData = [
          {
            question: 'What time is check-in?',
            answer: 'Check-in time is 3:00 PM. Early check-in may be available based on room availability.',
          },
          {
            question: 'What time is check-out?',
            answer: 'Check-out time is 11:00 AM. Late check-out may be arranged for an additional fee.',
          },
          {
            question: 'Is breakfast included?',
            answer: 'Yes, complimentary breakfast is served daily from 7:00 AM to 10:30 AM in our main restaurant.',
          },
          {
            question: 'Do you have a pool?',
            answer: 'Yes, we have both indoor and outdoor pools open from 6:00 AM to 10:00 PM daily.',
          },
          {
            question: 'Is Wi-Fi available?',
            answer: 'Yes, complimentary high-speed Wi-Fi is available throughout the hotel.',
          },
        ];
        
        const { error: faqsError } = await supabase
          .from('faqs')
          .insert(faqData.map(faq => ({ 
            hotel_id: hotelId,
            ...faq 
          })));
          
        if (faqsError) throw faqsError;
      }
      
      // Step 6: Optionally seed room service items
      if (seedRoomService) {
        const roomServiceData = [
          {
            name: 'Classic Cheeseburger',
            description: 'Angus beef, cheddar cheese, lettuce, tomato, onion, and special sauce.',
            price: 18.99,
          },
          {
            name: 'Margherita Pizza',
            description: 'Fresh mozzarella, tomato sauce, and basil.',
            price: 16.99,
          },
          {
            name: 'Caesar Salad',
            description: 'Romaine lettuce, croutons, parmesan cheese, and Caesar dressing.',
            price: 14.99,
          },
          {
            name: 'Chocolate Lava Cake',
            description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.',
            price: 10.99,
          },
          {
            name: 'Bottle of House Wine',
            description: 'Your choice of red, white, or rosé.',
            price: 35.00,
          },
        ];
        
        const { error: roomServiceError } = await supabase
          .from('room_service_items')
          .insert(roomServiceData.map(item => ({ 
            hotel_id: hotelId,
            ...item 
          })));
          
        if (roomServiceError) throw roomServiceError;
      }
      
      // Step 7: Optionally seed local events
      if (seedLocalEvents) {
        const now = new Date();
        const localEventsData = [
          {
            event_name: 'Live Jazz Night',
            description: 'Enjoy an evening of smooth jazz in our lobby lounge.',
            location: 'Hotel Lobby',
            start_date: new Date(now.setDate(now.getDate() + 1)).toISOString(),
            end_date: new Date(now.setHours(now.getHours() + 3)).toISOString(),
          },
          {
            event_name: 'Wine Tasting',
            description: 'Sample our curated selection of local and international wines.',
            location: 'Hotel Restaurant',
            start_date: new Date(now.setDate(now.getDate() + 3)).toISOString(),
            end_date: new Date(now.setHours(now.getHours() + 2)).toISOString(),
          },
          {
            event_name: 'Poolside BBQ',
            description: 'Join us for a relaxed afternoon BBQ by the pool.',
            location: 'Pool Deck',
            start_date: new Date(now.setDate(now.getDate() + 5)).toISOString(),
            end_date: new Date(now.setHours(now.getHours() + 4)).toISOString(),
          },
        ];
        
        const { error: eventsError } = await supabase
          .from('local_events')
          .insert(localEventsData.map(event => ({ 
            hotel_id: hotelId,
            ...event 
          })));
          
        if (eventsError) throw eventsError;
      }
      
      toast({
        title: "Database seeding successful!",
        description: `Created hotel '${hotelName}' and associated it with user '${adminEmail}'`,
        variant: "success",
      });
      
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        title: "Database seeding failed",
        description: (error instanceof Error ? error.message : "An unexpected error occurred."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Database Seeding Tool</CardTitle>
          <CardDescription>
            This tool is for development use only. It will create a new hotel and associate it with an existing user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Admin Email</Label>
            <Input
              id="adminEmail"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              This email must already exist as a user in Supabase Auth.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hotelName">Hotel Name</Label>
            <Input
              id="hotelName"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              placeholder="Your Hotel Name"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hotelSlug">Hotel Slug</Label>
            <Input
              id="hotelSlug"
              value={hotelSlug}
              onChange={(e) => setHotelSlug(e.target.value)}
              placeholder="your-hotel-slug"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-4 pt-4">
            <Label>Additional Data to Seed</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="seedGuests"
                checked={seedGuests}
                onCheckedChange={(checked) => setSeedGuests(!!checked)}
                disabled={isLoading}
              />
              <label 
                htmlFor="seedGuests" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Sample Guests (5)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="seedFaqs"
                checked={seedFaqs}
                onCheckedChange={(checked) => setSeedFaqs(!!checked)}
                disabled={isLoading}
              />
              <label 
                htmlFor="seedFaqs" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Sample FAQs (5)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="seedRoomService"
                checked={seedRoomService}
                onCheckedChange={(checked) => setSeedRoomService(!!checked)}
                disabled={isLoading}
              />
              <label 
                htmlFor="seedRoomService" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Sample Room Service Items (5)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="seedLocalEvents"
                checked={seedLocalEvents}
                onCheckedChange={(checked) => setSeedLocalEvents(!!checked)}
                disabled={isLoading}
              />
              <label 
                htmlFor="seedLocalEvents" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Sample Local Events (3)
              </label>
            </div>
          </div>
          
          <div className="pt-4 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
            <strong>Warning:</strong> This tool is for development purposes only. Running it will create real data in your Supabase database.
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={seedData} 
            disabled={isLoading || !adminEmail || !hotelName || !hotelSlug}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Database...
              </>
            ) : (
              "Seed Database"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
